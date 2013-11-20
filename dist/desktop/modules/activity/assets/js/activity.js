(function(window, $, undefined)
{
	window.Activity = { day: {} };
	Activity.day.activities = [];
	Activity.day.buckets = [];
	
	Activity.day.render = function()
	{
		Xlo.assets.loadview('../activity/assets/view/activity.htm', function(tmpl)
		{
			var $ad = Activity.day.get_ad();
			var $cats = duplex.render({ model:{ activities: Activity.day.activities, default_parent: $ad, handler: handler }, template: $(tmpl) });
			
			$ad.append($cats);
		});		
	};
	
	Activity.day.add = function(activity)
	{
		var dim = {}, $ad = Activity.day.get_ad(), i = activity.day.d.diff(settings.start_date, 'days');
		var $dest = $ad.find('>table >tbody >tr >td:eq(' + (i + 1) + ')'), off = $ad.find('>table.activity_tbl >tbody').offset();
		var left = $dest.offset().left, width = $dest.width();
		
		$.extend(dim, 
		{
			top: off.top + (activity.start.hour() * 1 * (60 / settings.stop_gap) + activity.start.minute() * 1 / settings.stop_gap)  * settings.cell_height,
			height: settings.cell_height,
			left: left,
			width: width * 0.9
		});
				
		var set = {activity: activity, dim: dim};
		var buck = Activity.day.find_bucket(set);
		Activity.day.activities.push(set);
		
		Activity.day.adjust_bucket(buck, $dest);
	};
	
	Activity.day.get_ad = function()
	{
		var $ad = Activity.day.$ad;
		if ($ad == undefined) $ad = Activity.day.$ad = $('#activity_day');
		
		return $ad;
	};
	
	Activity.day.find_bucket = function(set)
	{
		var buck_found;
		$.each(Activity.day.buckets, function(i, buck)
		{
			console.log('-------------------------------------');
			console.log(buck.start.format("dddd, MMMM Do YYYY, h:mm:ss a"));
			console.log(buck.end.format("dddd, MMMM Do YYYY, h:mm:ss a"));
			console.log(set.activity.start.format("dddd, MMMM Do YYYY, h:mm:ss a"));
			console.log(set.activity.end.format("dddd, MMMM Do YYYY, h:mm:ss a"));
			console.log('-------------------------------------');
			
			if (buck.end.isBefore(set.activity.start) || buck.start.isAfter(set.activity.end)) return true;
			if (buck.end.isSame(set.activity.start) || buck.start.isSame(set.activity.end)) return true;
			
			buck.acts.push(set);
			buck.start = buck.start.min(set.activity.start);
			buck.end = buck.end.max(set.activity.end);
			buck_found = buck;
			return false;
		});

		if (!buck_found)
			Activity.day.buckets.push(buck_found = {start: set.activity.start, end: set.activity.end, acts: [ set ]});
			
		return buck_found;
	};
	
	Activity.day.adjust_bucket = function(buck, $dest)
	{
		var acts = buck.acts;
		if (acts == null)
			throw new Error('The bucket does not have any activities/dim. ' + buck.start + ' ' + buck.end);
		
		var w = $dest.width() * 0.9 / acts.length, l = $dest.offset().left;
		$.each(acts, function(i, b)
		{
			$.extend(b.dim, { width: w, left: l + i * w + 1 });
			console.log('width: ' + b.dim.width + ' top:' + b.dim.top + ' left:' + b.dim.left);
		});
	};
	
	Activity.day.refresh_buckets = function()
	{
		var $ad = Activity.day.get_ad();
		Activity.day.buckets.length = 0;
				
		$.each(Activity.day.activities, function(i, set)
		{
			Activity.day.find_bucket(set);
		});
		
		$.each(Activity.day.buckets, function(i, buck)
		{
			console.log('***************');
			console.log(buck);
			console.log('***************');
			if (buck.acts.length == 0) return true;
			
			var idx = buck.acts[0].activity.day.d.diff(settings.start_date, 'days');
			var $dest = $ad.find('>table >tbody >tr >td:eq(' + (idx + 1) + ')');
console.log(idx);
console.log($dest.get(0));		
			Activity.day.adjust_bucket(buck, $dest);
		});
	};
	
	var K = 1;
	Activity.day.add_from = function(e)
	{
		var $td = $(e.currentTarget);
		var activity = { title: 'New Activity ' + (K++)};

		activity.day = settings.dates[$td.index() - 1];
		activity.start = moment(activity.day.d).hour($td.attr('hr') * 1).minute($td.attr('min') * 1);
		activity.end = moment(activity.start).add('minutes', settings.stop_gap);
		
		Activity.day.add(activity);
	};
	
	var handler = {};
	handler.nresize = function(e)
	{
		handler.resize(e, -1);
	};
	
	handler.sresize = function(e)
	{
		handler.resize(e);
	};
	
	handler.resize = function(e, dir) //mousedown
	{
		var $me = $(e.currentTarget).parent(), origin = {x: e.pageX, y: e.pageY, h: $me.height(), off: $me.offset()}, $a = $('div.activity');
		if (dir == undefined) dir = 1;
		
		var move = function(e)
		{
			if (dir < 0)
				$me.offset({top: origin.off.top + e.pageY - origin.y});
				
			$me.height(origin.h + dir * (e.pageY - origin.y));
		};
		
		var up = function(e)
		{
			$(document).off('mousemove', move);
			$(document).off('mouseup', up);
			$a.removeClass('unselectable');
		};
		
		$a.addClass('unselectable');
		$(document).on('mousemove', move);
		$(document).on('mouseup', up);
	};
	
	handler.drag = function(e)
	{
		var $me = $(e.currentTarget).parent(), origin = {x: e.pageX, y: e.pageY, h: $me.height(), off: $me.offset()}, $a = $('div.activity');
		var move = function(e)
		{
			$me.offset({top: origin.off.top + e.pageY - origin.y, left: origin.off.left + e.pageX - origin.x});
		};
		
		var up = function(e)
		{
			$(document).off('mousemove', move);
			$(document).off('mouseup', up);
			$a.removeClass('unselectable');
		};
		
		$a.addClass('unselectable');
		$(document).on('mousemove', move);
		$(document).on('mouseup', up);
	};
})(window, jQuery);
