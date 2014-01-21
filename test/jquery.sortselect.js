(function(window, $, undefined)
{
	$.fn.sortselect = function(opts)
	{
		var pref = {sort: true, select: true, selectableClass: 'selected'};
		$.extend(pref, opts);
		var $mees = $(this),
			$prev, //previously selected one
			$list, //selected list
			bg = 'background-color';
			
		return this.each(function()
		{
			var $me = $(this);
			if (pref.select)
			{
				var sc = pref.selectableClass;
				$me.on('click tap', function(e)
				{
					$me = $(this);					
					if (e.shiftKey && $prev != undefined)
					{
						var si = $prev.index(), ci = $me.index();						
						$list = $me.parent().children(':gt(' + Math.min(si - 1, ci - 1) + '):lt(' + Math.max(ci, si) + ')').addClass(sc);
						$list.addClass('unselectable');
						
						return;
					}
					
					if ($list)
					{
						$list.removeClass(sc).removeClass('unselectable');
						$list = undefined;
					}
					
					if ($me.hasClass(sc))
					{
						$me.removeClass(sc);
						if ($prev) 
						{
							$prev.removeClass(sc);
							$prev = undefined;
						}
						
						return;
					}
					
					if ($prev) $prev.removeClass(sc);
					$me.addClass(sc);
					$prev = $me;
				});				
			}
			
			if (pref.sort)
			{
				var $doc = $(document);
				$me.on('mousedown', function(e)
				{	
					var $me = $(e.target), drag = true;	
					if (!$me.is($list) && !$me.is($prev)) return;
									
					function cancel()
					{
						$doc.off('mousemove', move);
						$doc.off('mouseup', up);
					}
					
					function move(e)
					{
							
					}
					
					function up(e)
					{	
						if (!drag) return;
						
						var $tar = $(e.target);
						if (!$tar.is($mees))
						{
							while(($tar = $tar.parent()) != undefined && !$tar.is($mees));	
						}
						
						if ($tar == undefined) return cancel();
						
						if ($list || $prev)
							$tar.before($list || $prev);
						
						drag = false;
						$mees.removeClass('unselectable');
						cancel();	
					}
				
					$mees.addClass('unselectable');
					$doc.on('mousemove', move);
					$doc.on('mouseup', up);	
				});
			}
		});
	};
})(window, jQuery);
