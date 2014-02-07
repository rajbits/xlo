(function(window, $, undefined)
{
	$.fn.sortselect = function(opts)
	{
		var pref = {sort: true, select: true, selectableClass: 'selected'};
		$.extend(pref, opts);
		
		return this.each(function(i, el)
		{
			var $el = $(el),
				$mees = $el.children(),
				$prev, //previously selected one
				$list, //selected list
				bg = 'background-color';
			
			$mees.each(function()
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
							$list = $me.parent().children().slice(Math.min(ci, si), Math.max(ci, si) + 1).addClass(sc);
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
					var $dragger = $me;
					
					if (pref.handle)
						$dragger = $(pref.handle, $me);
					
					$dragger.on('mousedown', function(e)
					{	
						var $drag = $(e.currentTarget).parents('li:eq(0)').css({listStyle: 'none'}), idx = $drag.index(), w = $drag.width();
						var $placeholder;
						
						function move(e)
						{
							var $s = $(e.target), $pp = $s.parentsUntil($el), x = e.clientX, y = e.clientY, b = 5;
							$drag.css({position: 'absolute', width: '100%', opacity: 0.8, left: x + b, top: y + b});
					
							if ($pp.length == 0 || !$pp.eq(0).parent().is($el)) return;

							$pp = $pp.eq(0);			
							var pos = $pp.position(), h = $pp.height();
														
							if ($placeholder == null)
								 $placeholder = $('<div style="height: 50px; border: 1px black dashed"/>');
	
							if (y >= pos.top + h / 2 || y >= $el.position().top + $el.height())
								$placeholder.insertAfter($pp);
							else
								$placeholder.insertBefore($pp);
						}
						
						function up(e)
						{
							$drag.css({position: 'static', width: 'auto', opacity: 1}).insertBefore($placeholder);
							if ($placeholder) $placeholder.remove();
							$drag = false;
							$placeholder = null;
							
							$doc.off('mousemove', move);
							$doc.off('mouseup', up);
						}
						
						$doc.on('mousemove', move);
						$doc.on('mouseup', up);
					});
				}			
			});
		});		
	};
})(window, jQuery);
