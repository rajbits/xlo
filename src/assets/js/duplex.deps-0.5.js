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
	
	$.parsex = function(str)
	{
		str = $.trim(str);
		if (str == null || $.trim(str).length == 0) return null;
		
		var units = [], text = true, unit = { n: '' }; //n - name, t - type, c - child
		for(var i = 0; i < str.length; i++)
		{
			var k = str.charAt(i);
			if (k.length == 0) break;
					
			if (k == '.') //word ends
			{		
				if (str.charAt(i - 1) != ']')
				{
					units.push(unit);
					unit = { n: ''};	
				}
				
				continue;
			}
			else if (k == '[')
			{
				//Find the end of this bracket, and return the whole as a str for processing
				var segment = '', cnt = 1;
				for(var j = i + 1; j < str.length; j++)
				{
					var s = str.charAt(j);
					if (s == '[')
					{
						cnt++;
					}
					else if (s == ']')
					{
						if (cnt == 1) break;
						cnt--;
					}
					
					segment += s;				
				}
				
				//If the square brackets follow another set of square brackets, add it to the same child.
				var us = $.parsex(segment);
							
				if (str.charAt(i - 1) == ']')
				{				
					unit = units[units.length - 1];
					unit.t = 'array';
					if (!unit.c) unit.c = [];
					unit.c.push(us);
				}
				else
				{
					unit.c = [us];
					unit.t = 'array';
					units.push(unit);
				}
	
				i = j;			
				unit = {n: ''};
				
				continue;
			}
			else if (i == str.length - 1)
			{
				units.push(unit);
			}
			
			unit.n += k;
		}
		
		return units;
	};
	
	function ui(units)
	{
		var $d = $('<ul/>');
		$.each(units, function(i, unit)
		{
			var $li = _ui(unit);
			$d.append($li);
		});
		
		return $d;
	}
	
	function _ui(unit)
	{
		var $li = $('<li/>').html(unit.n + (unit.t ? ' (' + unit.t + ')' : ''));
		
		//This is an array of arrays
		if (unit.c && unit.c.length > 0)
		{
			var $ul = $('<ul/>').appendTo($li);
			$.each(unit.c, function(i, c)
			{			
				$.each(c, function(j, cc)
				{
					$ul.append(_ui(cc));
				});				
			});	
		}
			
		return $li;
	}

