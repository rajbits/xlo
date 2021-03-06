(function(window, $)
{	
	Xlo.assets.loadcss('../activity/assets/css/activity.css');
	Xlo.assets.loadjs('../activity/assets/js/activity.js', function()
	{		
		Activity.day.render();
	});
	
	Xlo.assets.loadview('../activity/assets/view/activity_day.htm', function(tmpl)
	{
		var $tmpl = $(tmpl);		
		window.settings =
		{
			timestops: [],
			stop_gap: 30, //mins
			units_within: 6,
			no_of_days: 3,
			cell_height: 50,
			snap: 4,
			start_date: moment().hours(0).minutes(0).seconds(0)
		};

		function reset()
		{
			settings.timestops_fmt = [];
			settings.units_ar = [];
			settings.dates = [];
			
			for(var hr = 0; hr < 24; hr++)
			{
				for(var min = 0; min < 60; min += settings.stop_gap)
				{
					settings.timestops.push({hr: hr, min: min});
					settings.timestops_fmt.push({hr: hr, min: (min < 10 ? '0' : '') + min});
				}
			}
			
			for(var i = 0; i < settings.no_of_days; i++)
			{
				settings.units_ar.push({i: i});
			}
			
			for(var i = 0; i < settings.no_of_days; i++)
			{
				var dd = moment(settings.start_date).add('days', i);
				settings.dates.push({s: dd.format('MM/DD/YYYY'), d: dd});
			}
		}
		
		var handlers = 
		{
			touchstart: function(e)
			{
				Activity.day.add_from(e);
			}
		};
		
		reset();
		
		var $act = duplex.bind({ model: { settings: settings, handlers: handlers }, template: $tmpl });
		$('#main').empty().append($act);			
	});
})(window, jQuery);
