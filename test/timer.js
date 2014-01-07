(function(window, undefined)
{
	if (window.Timer) return;
	var GAP = 1; //seconds
	window.Timer = function(s, callbacks)
	{
		if (s == undefined) s = 0;
		var status = {total: s};
		var interval = undefined;
		callbacks = $.extend
		({
			start: function(){},
			stop: function(){},
			tick: function(){}
		}, callbacks);
		
		function start()
		{
			interval = window.setInterval(tick, GAP * 1000);
			callbacks.start();
		};
		
		function tick()
		{
			status.total += GAP;
			callbacks.tick(status.total);
		};
		
		function stop()
		{
			window.clearInterval(interval);
			interval = undefined;
			callbacks.stop();
		};
		
		function toggle()
		{
			if (interval != undefined)
				stop();
			else
				start();
		}
		
		function split()
		{
			var secs = status.total;
			
			var mins = Math.floor(secs / 60);
			if (mins > 0)
				secs = status.total % 60;
				
			var hrs = Math.floor(mins / 60);			
			if (hrs > 0)
				mins = mins % 60;
				
			return {h: hrs, m: mins, s: secs};
		}
		
		function lpad(num)
		{
			return (num < 10) ? '0' + num : num;
		}
		
		function format()
		{
			var sp = split(), C = ':';
			return lpad(sp.h) + C + lpad(sp.m) + C + lpad(sp.s);
		}
		
		this.start = start;
		this.stop = stop;
		this.tick = tick;
		this.toggle = toggle;
		this.status = status;
		this.format = format;
	};		
	
})(window);
