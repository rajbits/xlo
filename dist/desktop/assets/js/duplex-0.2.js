(function()
{
	function isArray(o)
	{
		return Array == o.constructor;
	}
	
	(function()
	{
		if (!Object.prototype.watch)
		{
			function handle_array(node, handler)
			{
				node.push = function(nu)
				{
					Array.prototype.push.call(this, nu);
					handler.call(this, this, 'add', this.length - 1, nu);
					return nu;
				};
				
				node.pop = function()
				{
					var old = Array.prototype.pop.call(this);
					handler.call(this, this, 'remove', this.length, old);
				};
			}
			
			Object.defineProperty(Object.prototype, 'watch', 
			{
				enumerable: false,
				configurable: true,
				writable: false,
				value: function(p, handler)
				{
					if (isArray(this))
					{
						handle_array(this, handler);
						return;	
					}
					
					var old = this[p], nu = old;
					var getter = function()
					{
						return nu;
					};
					
					var setter = function(v)
					{
						old = nu;
						return nu = handler.call(this, p, old, v);
					};
					
					if (delete this[p])
					{
						Object.defineProperty(this, p, { get: getter, set: setter, enumerable: false, configurable: false });
					}
				}
			});
		}
	})();
	
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
	
	$.datax = function(node, key, value)
	{
		if (!node[key])
		{
			Object.defineProperty(node, key, 
			{
				enumerable: false,
				configurable: true,
				value: value
			});
		}
		
		if (value)
			node[key] = value;
		else
			return node[key];
			
	};
	
	var Handlers =
	{
		handleBind: function($el, context)
		{
			var node = context.node, attr = context.attr;
			$el.value(node[attr]).data({ model: {node: node, attr: attr} });
			
			node.watch(attr, function(a, old, nu)
			{
				$el.value(nu);
			});
		},
		
		handleRepeat: function($el, context)
		{
			var node = context.node, attr = context.attr;
			var $p = $el.parent();
			var list = node[attr];
			
			if (!list) throw new Error('The list seems to be not defined yet or null');
			$.datax(list, '_tmpl', $el);
			$el.remove();
			
			function add(i, l)
			{
				var $clone = $.datax(list, '_tmpl').clone().appendTo($p).removeAttr(DL + 'repeat');
				context.node = l;
				recurse($clone, l);
			}
			
			$.each(list, function(i, l)
			{
				add(i, l);
			});
			
			list.watch(null, function(ar, action, i, item)
			{
				add(i, item);
			});
		},
		
		handleWith: function()
		{
			
		},
		
		handleClick: function()
		{
			
		}
	};
	
	var DL = 'dl-', binders =
	[
		{name: 'bind', handler: Handlers.handleBind},
		{name: 'repeat', handler: Handlers.handleRepeat, pull: true},
		{name: 'with', handler: Handlers.handleWith, pull: true},
		{name: 'click', handler: Handlers.handleClick}
		
	];
	
	function render(o)
	{
		var $el = $(o.template).wrap('<div/>').parent();
		recurse($el, o.model);
		
		return $el;
	}
	
	function recurse($el, node)
	{
		var context = {node: node};
		$.each(binders, function(i, b)
		{
			var attr = $el.attr(DL + b.name);
			if (!attr) return true;
				
			context.attr = attr;
			b.handler($el, context);								
		});
				
		$el.children().each(function(i, c)
		{
			recurse($(c), context.node);
		});
	}
	
	window.duplex = {};
	duplex.render = render;
})();
