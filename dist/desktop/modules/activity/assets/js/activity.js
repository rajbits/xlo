(function(window, $, undefined)
{
	window.Activity = { day: {} };
	Activity.day.activities = [];
	Activity.day.buckets = [];
	
	Activity.day.add = function(activity)
	{
		var $ad = Activity.day.get_ad();
		var buck = Activity.day.add_activity(activity), width = 100, left = 0;
		
		for(var i=0; i < settings.dates.length; i++)
		{
			if (settings.dates[i].d.isSame(activity.day.d, 'day'))
			{
				var $f = $ad.find('>table >thead >tr >th:eq(' + (i + 1) + ')');
				width = $f.width();	
				left = $f.position().left;
			}
		}
		
		Xlo.assets.loadview('../activity/assets/view/activity.htm', function(tmpl)
		{
			var off = $ad.find('>table.activity_tbl >tbody').offset();
			var $act = duplex.render
			({
				model:
				{
					activity: activity,
					dim: 
					{
						top: off.top + (activity.start.hour() * 1 * (60 / settings.stop_gap) + activity.start.minute() * 1 / settings.stop_gap)  * settings.cell_height,
						height: settings.cell_height,
						left: left,
						width: width
					}
				},
				template: $(tmpl)
			});
			
			$ad.append($act);
			Activity.day.adjust_buckets = function(buck)
			{
				
			};
		});
	};
	
	Activity.day.add_activity = function(activity)
	{
		var acts = Activity.day.activities;
		if (acts[activity.day.s] == undefined) acts[activity.day.s] = [];
		
		acts[activity.day.s].push(activity);
		return Activity.day.bucketize(activity);
	};
	
	Activity.day.bucketize = function(activity)
	{
		var buck_found;
		$.each(Activity.day.buckets, function(i, buck)
		{
			if (buck.end.isBefore(activity.start) || buck.start.isAfter(activity.end)) return true;
			
			buck.acts.push(activity);
			buck_found = buck;
			return false;
		});
		
		if (!buck_found)
			Activity.day.buckets.push(buck_found = {start: activity.start, end: activity.end, acts: [activity]});
			
		return buck_found;
	};
	
	Activity.day.get_ad = function()
	{
		var $ad = Activity.day.$ad;
		if ($ad == undefined) $ad = Activity.day.$ad = $('#activity_day');
		
		return $ad;
	};
	
	Activity.day.add_from = function($td, e)
	{
		var activity = { title: 'New Activity'};
		activity.day = settings.dates[$td.index() - 1];
		
		activity.start = moment(activity.day.d).hour($td.attr('hr') * 1).minute($td.attr('min') * 1);
		activity.end = moment(activity.start).add('min', settings.stop_gap);
		
		Activity.day.add(activity);			
	};	
	
})(window, jQuery);
