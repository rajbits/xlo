(function(window, $, undefined)
{
	window.Xlo = { modules: {}, assets: {}, db: {} }, MOD = 'modules/';
	
	Xlo.modules.load = function()
	{
		
	};
	
	Xlo.assets.loadjs = function(path, callback)
	{
		var $s = $('script[src="'+ path + '"]');
		if ($s.length == 0)
		{
			$s = $('<script/>')
				.attr({src: path})
				.on('load', callback || function()
				{
					console.log('Loaded...' + path);
				});
			document.body.appendChild($s.get(0));
		}
	};
	
	Xlo.assets.loadcss = function(path, callback)
	{
		var $l = $('link[href="' + path + '"]');
		if ($l.length == 0)
		{
			$l = $('<link/>').attr({ rel: 'stylesheet', href: path })
				.on('load', callback || function()
				{
					console.log('Loaded...' + path);
				})
				.appendTo(document.body);
		}
	};
		
	Xlo.assets.loadview = function(path, callback)
	{
		var o = 
		{
			url: path,
			success: function(data)
			{
				callback(data);
			},
			error: function()
			{
				console.log('Error loading ' + path);
			}
		};
		
		$.ajax(o);
	};	
})(window, jQuery);
