(function(window, $, undefined)
{
	var DP = 'dp-',
	datay = function(node, key, value)
	{
		if (!node[key])
		{
			Object.defineProperty(node, key, 
			{
				enumerable: false,
				configurable: true,
				value: []
			});
		}
		
		if (value)
			node[key].push(value);
		else
			return node[key];			
	},
	dataz = function(node, key, value)
	{
		var t = '_tmpl';
		if (!node[t])
		{
			Object.defineProperty(node, t, 
			{
				enumerable: false,
				configurable: true,
				value: []
			});
		}
		
		if (node[t][key] == undefined) node[t][key] = [];
		
		if (value)
			node[t][key].push(value);
		else
			return node[t][key];			
	},
	watchArray = function(ar, handler)
	{
		ar.push = function(nu)
		{
			Array.prototype.push.call(this, nu);
			handler.call(this, this, 'add', this.length - 1, nu);
			return nu;
		};
		
		ar.pop = function()
		{
			var old = Array.prototype.pop.call(this);
			handler.call(this, this, 'remove', this.length, old);
			return old;
		};
	},
	lastNIndexOf = function(src, srch, n)
	{
		var idx = src.length, i = 0;
		while (idx >= 0 && i++ < n)
			idx = src.lastIndexOf(srch, idx - 1);
			
		return idx;	
	},
	
	/**
	 * Idea is to split up the last object and attribute/dimension pulled out
	 * If the last segment is a word, pull that out
	 * If the last segment is an array, find out the last segment of an array.
	 * Ex: Kagaz.arrow[abra[cada.bra]]
	 * Ex: Kagaz.arrow[abra[cada.bra]].basic
	 * @param {String} str - String to be parsed
	 */
	parsex = function(str)
	{
		str = $.trim(str);
		if (str == null || $.trim(str).length == 0) return null;
		
		var pos = str.lastIndexOf('.');
		if (pos >= str.length - 1)
			throw new Error('The expression does not seem to be valid!: ' + str);
			
		var attr = str.substr(pos + 1), arrs = attr.match(/(\])/), prs;
		if (arrs && arrs.length > 0) //There is an array component
		{
			var idx = lastNIndexOf(str, '[', arrs.length);
			prs = {o: str.substr(0, idx), a: str.substr(idx), type: 'array'};
		}		
		else
			prs = {o: str.substring(0, pos), a: attr};
		
		return prs;
	};
	
	$.fn.value = function(val)
	{
		var $me = $(this), m = 'html';
		if ($me.is('input')) m = 'val';
		
		if (val != undefined) 
		{
			$me[m](val);
			return $me;
		}
		
		return $me[m]();
	};
	
	function bind(o)
	{
		if (o.template == null || o.template.length == 0)
			throw new Error('Template value is empty');
		
		var $scope = o.model;
		var $t = $(o.template).wrap('<div/>').parent();
			
		var $xtra = { default_parent: o.default_parent };
		recurse($t, $scope, $xtra);
		
		return $t.children();
	}
	
	function expr($scope, $xtra, a)
	{
		try
		{
			var $c = $.extend({}, $scope, $xtra);
			if (a == '') return $c;
			
			var f = new Function('return this.' + a).bind($c);
			return f();	
		}
		catch(e)
		{
			console.error(e.message + ' ' + a);
		}		
	}
	
	var Handlers = 
	{
		repeat: function($t, $scope, $xtra, a)
		{
			var r = /(.*)\s+in\s+(.*)/g, p = r.exec(a);
			if (p == null)
			{
				console.error('Expecting an array in the form: x in y[;i, j] ' + a);
				return;
			}
			
			var itr = p[1], list = p[2], $p = $t.parent(), $tmpl = $t.removeAttr(DP + 'repeat').remove();
			
			var ar = expr($scope, $xtra, list), set = { el: $tmpl, p: $p };
			datay(ar, '_tmpl', set);
			
			$.each(ar, function(i, a)
			{
				$xtra[itr] = a;
				add(a, i, false);
			});			
			
			watchArray(ar, function(arr, op, idx, itm)
			{
				$xtra[itr] = itm;
				if (op == 'add') 	add(itm, idx, true);
				if (op == 'remove') remove(itm, idx, true);
			});
			
			function add(a, i, later)
			{			
				$.each(later ? datay(ar, '_tmpl') : [set], function(i, t)
				{
					if (later && (t.p == undefined || t.p.parent().length == 0))
						t.p = $xtra.default_parent || $scope.default_parent;
					
					var $tt = t.el.clone().appendTo(t.p);
					datay(a, '_bind', $tt);
					recurse($tt, $scope, $xtra);
				});							
			}
			
			function remove(a, i, later)
			{
				$.each(datay(a, '_bind') || [], function(i, $el) { $el.remove(); });
			}
		},
		
		bind: function($t, $scope, $xtra, a)
		{		
			Handlers.setData($t, $scope, $xtra, 'value', null, a);
		},
		
		json: function($t, $scope, $xtra, a, type)
		{
			//First convert to json. Expecting a very basic json (a 2d one)			
			var aa = a = $.trim(a), r = /(.*?):(.*?)($|,)/g, m;						
			while((m = r.exec(aa)) !== null)
			{
				var o = m[1], attr = m[2];
				o = $.trim(o); attr = $.trim(attr);

				Handlers.setData($t, $scope, $xtra, type, o, attr);
			}
		},
		
		setData: function($t, $scope, $xtra, type, o, attr)
		{
			var af = attr.split('|'), arg1 = af[0], arg1_ar = arg1.split(';'), args = [], output, m = 'modifying';
			$.each(arg1_ar, function(i, a)
			{
				a = $.trim(a);
				var val, txt;
				
				if (a.indexOf('"') == 0 && a.lastIndexOf('"') == a.length - 1)
					(txt = true) && (val = a.substring(1, a.length - 1));
				else
					val = expr($scope, $xtra, a);
					
				args.push(val);
				
				if (!txt)
				{
					var prs = parsex(a), obj = expr($scope, $xtra, prs.o), at = prs.a;
					(function(o, obj, at, type)
					{
						watch(obj, at, function(att, action, nu, old)
						{
							if (at != att) return;
							set(nu, i);						
						});
						
						if (type == 'value')
						{
							$t.on('change keyup update', function(e)
							{
								$t.data(m, true);
								obj[at] = $t[type]();
							});	
						}
					})(o, obj, at, type);
				}								
			});
			
			function set(output, idx)
			{
				//Formatters
				for(var i = 1; i < af.length; i++)
				{				
					var fn = expr($scope, $xtra, $.trim(af[i]));
					if (fn != undefined)
					{
						var aa = args;
						if (idx != undefined) 
							args[idx] = output;
						else
							aa = args.concat(output);
							
						output = fn.apply(this, aa);
					}						
				}
				
				if (output == null && args.length > 0)
					output = args[0];
			
				var k = output;
				if (o != null)
				{
					k = {};
					k[o] = output;
				}
				$t[type](k);	
			}
			
			set(output);			
		},
		
		data: function($t, $scope, $xtra, a)
		{
			Handlers.json($t, $scope, $xtra, a, 'data');
		},
		
		attr: function($t, $scope, $xtra, a)
		{
			Handlers.json($t, $scope, $xtra, a, 'attr');
		},
		
		ui_event: function($t, $scope, $xtra, a)
		{
			Handlers.json($t, $scope, $xtra, a, 'on');
		},
		
		css: function($t, $scope, $xtra, a)
		{
			Handlers.json($t, $scope, $xtra, a, 'css');
		},
		
		animate: function($t, $scope, $xtra, a)
		{
			Handlers.json($t, $scope, $xtra, a, 'animate');
		},
		
		fn: function($t, $scope, $xtra, a)
		{
			var af = a.split(';');
			$.each(af, function(i, aa)
			{
				as = $.trim(aa);
				aa = expr($scope, $xtra, as);
				
				if (typeof(aa) == 'function')
				{
					aa($t);
				}
				else if ($t[as])
				{
					$t[as]();
				}
			});
		},
		
		plugin: function($t, $scope, $xtra, a)
		{
			Handlers.fn($t, $scope, $xtra, a);
		},
		
		postCreate: function($t, $scope, $xtra, a)
		{
			Handlers.fn($t, $scope, $xtra, a);
		}
	};
	
	var binders =
	[
		{name: 'repeat', handler: Handlers.repeat, traverse: false},
		{name: 'bind', handler: Handlers.bind},
		{name: 'data', handler: Handlers.data},
		{name: 'attr', handler: Handlers.attr},
		{name: 'ui-event', handler: Handlers.ui_event},
		{name: 'css', handler: Handlers.css},
		{name: 'animate', handler: Handlers.animate},
		{name: 'plugin', handler: Handlers.plugin},
		{name: 'post-create', handler: Handlers.postCreate}
	];
	
	function recurse($t, $scope, $xtra)
	{
		var traverse = true;
		$.each(binders, function(i, b)
		{
			var a = $t.attr(DP + b.name);
			if (a == undefined) return;
			
			b.handler($t, $scope, $xtra, a);
			if (b.traverse == false) traverse = false;
		});
				
		traverse && $t.children().each(function(i, tt)
		{
			var $tt = $(tt);
			recurse($tt, $scope, $xtra);
		});
	}
			
	window.duplex = {};
	duplex.bind = bind;
})(window, jQuery);