(function(window, $, undefined)
{
	$.fn.sort = function()
	{
		var usc = 'unselectable';
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
			if ($ph.length == 0) $ph = $('<table id="act-placeholder" cellpadding="0" cellspacing="0" style="position: absolute; width: 80%"><tr><td class="glyphicon glyphicon-play" style="margin-right: -3px; color: gray"></td><td style="width: 100%"><div style="border-top:1px black solid; position: absolute; top:65%; width: 100%" class="col-xs-6"></div></td></tr></table>').appendTo(document.body);
			
			return $ph.hide();
		}
		
		return this.each(function()
		{
			var $me = $(this), $doc = $(document);
			$me.on('mousedown', function(e)
			{
				var $self = $(e.target), $el = $me.parents('ol:eq(0)');
				$self.parents('li:eq(0)').find('input:checkbox').prop({checked: true});
				
				var $checks = $el.find('input:checkbox:checked');				
				if ($checks.length == 0) return;				
				
				var $ph = getPlaceholder();
				
				function move(e)
				{					
					$ph.show().css({left: e.clientX, top: e.clientY});
				}
				
				function up(e)
				{			
					$ph.hide();		
					setLi($checks, 'act-moved', 'act-moving');
					$el.removeClass(usc);
					
					$doc.off('mousemove', move);
					$doc.off('mouseup', up);
				}
				
				setLi($checks, 'act-moving', 'act-moved');
				$el.addClass(usc);
				
				$doc.on('mousemove', move);
				$doc.on('mouseup', up);
			});		
		});
	};	
})(window, jQuery);
