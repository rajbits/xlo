(function(window, $, undefined)
{	
	function render(o)
	{
		if (o.template == null || o.template.length == 0)
			throw new Error('Template value is empty');
		
		if (o.model == undefined)
			throw new Error('Model object is null');
		
		var $scope = o.model, DL = 'dl-';
		var $t = $(o.template).wrap('<div/>').parent();
		
		function oattr(a)
		{
			try
			{
				var units = $.parsex(a), obj = $scope._dyn || $scope, attr;			
				for(var j = 0; j < units.length; j++)
				{
					var u = units[j];					
					if (attr)
						obj = obj[attr];
					else if ($scope[u.n] != undefined)
						obj = $scope;
								
					attr = u.n;
				}
				
				return {obj: obj, attr: attr};	
			}
			catch(e)
			{
				console.log(e);
				return undefined;
			}			
		}
		
		var Handlers = 
		{
			handle_bind: function($t, a)
			{
				var u = oattr(a);
				if (u == undefined) return;
				
				var obj = u.obj, attr = u.attr;				
				$t.value(obj[attr]);
				
				obj.watch(attr, function(aa, old, nu)
				{
					$t.value(nu);
					return nu;
				});
				
				Handlers.attach_binding($t, $scope, obj, attr);
			},
			
			attach_binding: function($t, $scope, obj, attr)
			{
				$t.on('change, keyup', function(e)
				{
					obj[attr] = $t.value();
					return true;
				});
			},
			
			handle_repeat: function($t, a)
			{
				var reg = /(\w*)\s*in\s*(\w*\.*\w*)/g, p = reg.exec(a);
				if (p == null || p.length != 3)
				{
					console.log('Expecting an array to iterate in format: x in y. Found: ' + a);
					return;
				}
				
				var list = p[2], itr = p[1], ar = eval('$scope.' + list);
				p = null;
				
				if (ar == undefined)
				{
					console.log('Array is null in dl-repeat: ' + list);
					return;	
				}
				
				if (!isArray(ar))
				{
					console.log('Was expecting an array, and it was not. ' + ar);
					return;
				}
				
				var $p = $t.parent();
				$.datay(ar, '_tmpl', { el: $t.remove(), p: $p });
				
				function add(later, aa, i)
				{
					try
					{
						if (!later)
						{
							var $clone = $t.clone().removeAttr(DL + 'repeat').data(DL + 'repeat-idx', i).appendTo($p);
							$.datay(aa, '_bind', $clone);
							recurse($clone);	
						}
						else
						{
							$.each($.datay(ar, '_tmpl'), function(i, newbie)
							{
								if (!$.contains(document.documentElement, newbie.p)) newbie.p = $scope.default_parent;
								var $clone = newbie.el.clone().removeAttr(DL + 'repeat').appendTo(newbie.p);
								
								$.datay(aa, '_bind', $clone);		
								recurse($clone);
							});
						}		
					}
					catch(e)
					{
						console.error(e);
					}								
				}	
				
				function remove(old, idx)
				{
					var $els = $.datay(old, '_bind');
					if ($els != undefined) $.each($els, function(i, $el) { $el.remove() });
				}
				
				$.each(ar, function(i, aa)
				{
					if ($scope._dyn == undefined) $scope._dyn = [];
					$scope._dyn[itr] = aa;
					add(false, ar[i], i);					
				});
				
				ar.watch(null, function(arr, op, idx, nu)
				{
					$scope[itr] = nu;
					if (op == 'add') add(true, nu);
					if (op == 'remove') remove(nu, idx);
				});
				
				// delete $scope._dyn; //TODO: find best place to do this cleanup. dl-bind may also need this info					
			},
						
			handle_json: function(type, $t, a)
			{
				var reg = /{{\s*((\w*\.*)*)\s*}}/g /*/{{\s*(\w*\.*\w*)\s*}}/g*/, match;				
				function setData($t, a, nu, m)
				{
					var v;
					if (nu != undefined) a = a.replace(new RegExp('{{\\s*' + m.replace(/\./g, '\\.') + '\\s*}}'), JSON.stringify(nu));	
					var at = a.replace(reg, function(match, p1, p2, p3, offset, string)
					{
						var ss = '$scope._dyn.' + p1;
						if ($.save_eval(ss, $scope)) return ss;
						
						ss = '$scope.' + p1;
						if ($.save_eval(ss, $scope)) return ss;
						
						// throw new Error('The pattern does not seem to be valid :' + a);
						console.error('The pattern does not seem to be valid :' + a);
						return '""';
					});
					
					eval('v = ' + at);	
					$t[type](v);
				}
	
				while((match = reg.exec(a)) != undefined)
				{
					var m = match[1];
					var u = oattr(m);
					if (u == undefined) break;
					
					var obj = u.obj, attr = u.attr;					
					$.dataz(obj, attr, $t);

					(function(m)
					{
						obj.watch(attr, function(aa, old, nu)
						{
							var $ts = $.dataz(obj, aa);
							setTimeout(function()
							{
								$.each($ts, function(k, $tt)
								{
									setData($tt, a, nu, m);	
								});
							}, 1);
													
							return nu;
						});
					})(m);					
				}
				
				setData($t, a);
			},
			
			handle_ui_event: function($t, a)
			{
				var reg = /{{\s*(\w*\.*\w*)\s*}}/g, v;
				a = a.replace(reg, '$scope.$1');
				eval('v = ' + a);
				
				for(var k in v)
				{
					$t.on(k, v[k]);
				}
			},
			
			handle_data: function($t, a)
			{
				this.handle_json('data', $t, a);
			},
						
			handle_css: function($t, a)
			{
				Handlers.handle_json('css', $t, a);
			},
			
			handle_attr: function($t, a)
			{
				Handlers.handle_json('attr', $t, a);
			}
		};
		
		var binders =
		[
			{name: 'repeat', handler: Handlers.handle_repeat, intraverse: false},
			{name: 'bind', handler: Handlers.handle_bind},
			{name: 'data', handler: Handlers.handle_data},
			{name: 'attr', handler: Handlers.handle_attr},
			{name: 'ui-event', handler: Handlers.handle_ui_event},
			{name: 'css', handler: Handlers.handle_css}
		];
		
		function recurse($t)
		{
			var intraverse = true;
			$.each(binders, function(i, b)
			{
				var a = $t.attr(DL + b.name);
				if (!a) return;
				
				if (b.intraverse == false) intraverse = b.intraverse;
				b.handler($t, a);
			});
			
			intraverse && $t.children().each(function(i, tt)
			{
				var $tt = $(tt);
				recurse($tt);
			});
		}
		
		recurse($t);
		return $t.children();
	}
	
	window.duplex = {};
	duplex.render = render;
	
})(window, jQuery);
