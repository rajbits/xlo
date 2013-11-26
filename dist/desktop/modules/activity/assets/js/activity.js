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
		var bf = [], b = Activity.day.buckets;
		$.each(b, function(i, buck)
		{
			if (buck == undefined) return true;
			if (buck.end.isBefore(set.activity.start) || buck.start.isAfter(set.activity.end)) return true;
			if (buck.end.isSame(set.activity.start, 'minute') || buck.start.isSame(set.activity.end, 'minute')) return true;
			if (buck.acts.indexOf(set) >= 0) return true; //If the activity already exists
						
			buck.acts.push(set);
			buck.start = buck.start.max(set.activity.start);
			buck.end = buck.end.min(set.activity.end);
			bf.push(buck);
		});

		//TODO: Optimize this section better
		function unique_join(target, src)
		{
			$.each(src, function(i, s)
			{
				target.indexOf(s) < 0 && target.push(s);
			});
		}
		
		var k;
		$.each(bf, function(i, bb)
		{
			if (i == 0 && (k = b.indexOf(bb)) >= 0) return true;
			if (b[k].acts.indexOf(bb.acts) >= 0) return true;
				
			unique_join(b[k].acts, bb.acts);
			
			b[k].start = b[k].start.max(bb.start);
			b[k].end = b[k].end.min(bb.end);
			
			delete b[b.indexOf(bb)];
		});
		
		(bf.length > 0) && $.each(b, function(i, buck)
		{
			if (buck == undefined)
				b.splice(i, 1);
		});
		
		if (bf.length == 0)
			bf.push({start: set.activity.start, end: set.activity.end, acts: [ set ]}) && b.push(bf[0]);
			
		return bf[0];
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
			if (buck.acts.length == 0) return true;
			
			var idx = buck.acts[0].activity.day.d.diff(settings.start_date, 'days');
			var $dest = $ad.find('>table >tbody >tr >td:eq(' + (idx + 1) + ')');

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
	
	Activity.day.refresh_activity = function($act)
	{
		var set = $act.data('o');
		if (set == undefined) throw new Error('Activity element not associated with data');
		
		$.extend(set.dim, { left: $act.css('left'), top: $act.css('top'), height: $act.innerHeight(), width: $act.outerWidth() });
		Activity.day.refresh_activity_time(set);
	};
	
	Activity.day.refresh_activity_time = function(set)
	{
		var $ad = Activity.day.get_ad(), time_width = $ad.find('>table >tbody >tr >td:eq(0)').outerWidth();
		var i = Math.floor((set.dim.left.replace(/px/, '') * 1 - time_width) / $ad.find('>table >tbody >tr >td:eq(1)').outerWidth());
		var ht = settings.cell_height / (settings.snap || 1);
		
		if (i < 0) i = 0;
		var $dest = $ad.find('>table >tbody >tr >td:eq(' + (i + 1) + ')'), off = $ad.find('>table.activity_tbl >tbody').offset();
		var left = $dest.offset().left, width = $dest.width();		
		
		if (settings.snap)
		{
			set.dim.top = Math.round((set.dim.top.replace(/px/, '') * 1 - off.top) / ht) * ht + off.top;
			set.dim.top += 'px';
			set.dim.height = Math.round(set.dim.height / ht) * ht;
		}
		
		var mins  = (set.dim.top.replace(/px/, '') * 1 - off.top) / settings.cell_height * settings.stop_gap;
		set.activity.day = { d: moment(settings.start_date).add('day', i) };
		set.activity.day.s = set.activity.day.d.format('MM/DD/YYYY');
			
		set.activity.start.hours(0); set.activity.end.hours(0); //Setting mins later will automatically set hours
		set.activity.start.minutes(mins);
		set.activity.start.seconds((mins % 1) * 60);
		
		var emins = mins + (set.dim.height / settings.cell_height) * settings.stop_gap;		
		set.activity.end.minutes(emins);
		set.activity.end.seconds((emins % 1) * 60);
		
		set.activity.start.year(set.activity.day.d.year());set.activity.end.year(set.activity.day.d.year());
		set.activity.start.month(set.activity.day.d.month());set.activity.end.month(set.activity.day.d.month());
		set.activity.start.date(set.activity.day.d.date());set.activity.end.date(set.activity.day.d.date());
		
		Activity.day.refresh_buckets();
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
			
			Activity.day.refresh_activity($me);
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
			
			Activity.day.refresh_activity($me);
		};
		
		$a.addClass('unselectable');
		$(document).on('mousemove', move);
		$(document).on('mouseup', up);
	};
	
	handler.open = function(e)
	{
		console.log(e);
	};
})(window, jQuery);
