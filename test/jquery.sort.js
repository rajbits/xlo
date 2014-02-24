(function(window, $, undefined)
{
	$.fn.sort = function()
	{
		var usc = 'unselectable', act = 'act-target';
		function setLi($checks, addClass, removeClass)
		{
			$checks.each(function(i, c)
			{
				var $c = $(c);
				var $li = $c.parents('li:eq(0)');
				$li.removeClass(removeClass).addClass(addClass);
			});	
		}
		
		function getPlaceholder()
		{
			var $ph = $('#act-placeholder');
			if ($ph.length == 0) $ph = $('<table id="act-placeholder" cellpadding="0" cellspacing="0" style="position: absolute; width: 80%"><tr><td class="glyphicon glyphicon-play" style="margin-right: -3px; color: gray"></td><td style="width: 100%"><div style="border-top:1px black solid; position: absolute; top:65%; width: 100%" class="col-xs-6"></div></td></tr></table>').hide().appendTo(document.body);
			
			return $ph;
		}
		
		function getCursor()
		{
			var $cu = $('#act-cursor');
			if ($cu.length == 0) $cu = $('<div id="act-cursor" style="position: absolute; display: inline-block; background-color: lightskyblue; padding-left: 5px; padding-right: 5px; border-radius: 10px;"></div>').hide().appendTo(document.body);
			
			return $cu;
		}
		
		function getChildAt($el, e)
		{
			var child = document.elementFromPoint(e.clientX, e.clientY), $child = $(child);
			if (child == null) return;		
			if (child.tagName != 'LI')
				$child = $child.parents('li:eq(0)');

			if ($child.length == 0) return null;
			return $child;
		}
		
		function positionPlaceHolder($el, e)
		{
			var $child = getChildAt($el, e), $ph = getPlaceholder();
			if ($child == null) return null;
			
			var pos = $child.offset(), x = pos.left, y = pos.top, mx = e.pageX, my = e.pageY, h = $child.outerHeight(), b = 15;
			$child.siblings().andSelf().removeClass(act);
			
			if (my <= y + h/4)
				$ph.show().css({top: y - b, left: x}).data({el: $child, p: 'above'});
			else if (my >= y + 3 * h/4)
				$ph.show().css({top: y + h - b, left: x}).data({el: $child, p: 'below'});
			else if ($child.find('input:checkbox:checked:eq(0)').length == 0)
			{
				$ph.hide();				
				$child.addClass(act);	
			}				
		}
		
		function moveSelected($el, $checks)
		{
			$checks.each(function(i, c)
			{
				var $c = $(c);
				var $li = $c.parents('li:eq(0)');
				$li.removeClass(removeClass).addClass(addClass);
			});	
		}
		
		function positionSelected($el, $checks)
		{
			var $ph = getPlaceholder();
			if ($ph.is(':visible'))
			{
				var $child = $ph.data('el'), pos = $ph.data('p');
				$checks.each(function(i, c)
				{				
					var $li = $(c).parents('li:eq(0)');
					if (pos == 'above')
						$li.insertBefore($child);
					else if (pos == 'below')
						$li.insertAfter($child);	
				});
			}
			else
			{
				
			}
		}
		
		return this.each(function()
		{
			var $me = $(this), $doc = $(document), $body = $(document.body);
			$me.on('mousedown', function(e)
			{
				var $self = $(e.target), $el = $me.parents('ol:eq(0)');
				$self.parents('li:eq(0)').find('input:checkbox:eq(0)').prop({checked: true});
				
				var $checks = $el.find('input:checkbox:checked');				
				if ($checks.length == 0) return;				
				
				var $ph = getPlaceholder(), $cu = getCursor();
				
				function move(e)
				{
					$cu.show().css({left: e.pageX + 20, top: e.pageY + 20}).html($checks.length + ' activities');					
					$body.css({cursor: '-webkit-grabbing'});
					
					positionPlaceHolder($el, e);
				}
				
				function up(e)
				{	
					positionSelected($el, $checks);		
					$ph.hide();		
					$cu.hide();
					$body.css({cursor: 'auto'});
										
					setLi($checks, 'act-moved', 'act-moving');
					$body.removeClass(usc);
					$el.children().removeClass(act);
					
					$doc.off('mousemove', move);
					$doc.off('mouseup', up);
				}
				
				setLi($checks, 'act-moving', 'act-moved');
				$body.addClass(usc);
				
				$doc.on('mousemove', move);
				$doc.on('mouseup', up);
			});		
		});
	};	
})(window, jQuery);
