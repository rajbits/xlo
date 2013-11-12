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
		
		var Handlers = 
		{
			handle_bind: function($t, a)
			{
				var u = oattr(a), obj = u.obj, attr = u.attr;
				
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
				$.datax(ar, '_tmpl', $t.remove());
				
				function add()
				{
					var $clone = $.datax(ar, '_tmpl').clone().removeAttr(DL + 'repeat').appendTo($p);					
					recurse($clone);	
				}				
				
				$.each(ar, function(i, aa)
				{
					if ($scope._dyn == undefined) $scope._dyn = [];
					$scope._dyn[itr] = aa;
					add();					
				});
				
				ar.watch(null, function(arr, op, idx, nu)
				{
					$scope[itr] = nu;
					add();
				});
				
				// delete $scope._dyn; //TODO: find best place to do this cleanup. dl-bind may also need this info					
			},
			
			handle_json: function(type, $t, a)
			{
				
			},
			
			handle_data: function($t, a)
			{
				var reg = /{{\s*(\w*\.*\w*)\s*}}/g, match;				
				function setData($t, a, nu, m)
				{
					var v;
					if (nu != undefined) a = a.replace(new RegExp('{{\s*' + m + '\s*}}'), JSON.stringify(nu));	
					var at = a.replace(reg, '$scope._dyn.$1');
					
					try
					{
						eval('v = ' + at);
					}	
					catch(e)
					{
						at = a.replace(reg, '$scope.$1');
						eval('v = ' + at);	
					}
					$t.data(v);
				}
	
				while((match = reg.exec(a)) != undefined)
				{
					var m = match[1];
					var u = oattr(m), obj = u.obj, attr = u.attr;
					
					obj.watch(attr, function(aa, old, nu)
					{
						setData($t, a, nu, m);
						return nu;
					});
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
			
			handle_css: function($t, a)
			{
				var reg = /{{\s*(\w*\.*\w*)\s*}}/g, match;		
				function setCSS($t, a, nu, m)
				{
					var v;
					if (nu != undefined) a = a.replace(new RegExp('{{\s*' + m + '\s*}}'), JSON.stringify(nu));					
					var at = a.replace(reg, '$scope._dyn.$1');
					
					try
					{
						eval('v = ' + at);
					}	
					catch(e)
					{
						at = a.replace(reg, '$scope.$1');
						eval('v = ' + at);	
					}				
					
					$t.css(v);
				}
	
				while((match = reg.exec(a)) != undefined)
				{
					var m = match[1];
					var u = oattr(m), obj = u.obj, attr = u.attr;
							
					obj.watch(attr, function(aa, old, nu)
					{					
						setCSS($t, a, nu, m);
						return nu;
					});
				}
				
				setCSS($t, a);
			}
		};
		
		var binders =
		[
			{name: 'repeat', handler: Handlers.handle_repeat, intraverse: false},
			{name: 'bind', handler: Handlers.handle_bind},
			{name: 'data', handler: Handlers.handle_data},
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
		return $t;
	}
	
	window.duplex = {};
	duplex.render = render;
	
})(window, jQuery);
