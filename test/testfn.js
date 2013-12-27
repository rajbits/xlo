function parse(str)
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
			var us = parse(segment);
						
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
}

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

function lastNIndexOf(src, srch, n)
{
	var idx = src.length, i = 0;
	while (idx >= 0 && i++ < n)
		idx = src.lastIndexOf(srch, idx - 1);
		
	return idx;	
}

/**
 * Idea is to split up the last object and attribute/dimension pulled out
 * If the last segment is a word, pull that out
 * If the last segment is an array, find out the last segment of an array.
 * Ex: Kagaz.arrow[abra[cada.bra]]
 * Ex: Kagaz.arrow[abra[cada.bra]].basic
 * @param {String} str - String to be parsed
 */
function parsex(str)
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
}

function uui(start)
{
	var $ul = $('<ul/>');
	
	return $ul;
}
