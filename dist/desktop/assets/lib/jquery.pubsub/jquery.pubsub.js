(function($)
{
	var o = $({});
	var fns = 
	{
		'subscribe': 'on',
		'unsubscribe': 'off',
		'publish': 'trigger'	
	};
	
	$.each(fns, function(fn, api)
	{
		$[fn] = function()
		{
			o[api].apply(o, arguments);
		};
	});
	
})(jQuery);
