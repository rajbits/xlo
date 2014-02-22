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
				$last;
			
			function getCheck($elem)
			{
				return $elem.find('input:checkbox.' + pref.checkbox);
			}
			
			function check($elem, chk)
			{
				if (chk == undefined) chk = true;
				getCheck($elem).attr({checked: chk});
			}
			
			$mees.each(function()
			{
				var $me = $(this);								
				if (pref.select)
				{								
					getCheck($me).on('click tap', function(e)
					{
						var $self = $(e.target);									
						if (e.shiftKey && $last != undefined)					
						{
							var $checks = getCheck($el), pi = $checks.index($last), ci = $checks.index($self);
							$checks.slice(Math.min(pi, ci), Math.max(pi, ci) + 1).prop({checked: true});
							console.log($checks); 
						}
						
						$last = $self.is(':checked') ? $self : undefined;
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
						var $drag = $(e.currentTarget).parents('li:eq(0)'), idx = $drag.index(), w = $drag.width();
						var $placeholder;
						
						function move(e)
						{
							var $s = $(e.target), $pp = $s.parentsUntil($el), x = e.clientX, y = e.clientY, b = 5;
							$drag.css({position: 'absolute', width: '100%', opacity: 0.8, left: x + b, top: y + b});
					
							if ($pp.length == 0 || !$pp.eq($pp.length - 1).parent().is($el)) return;

							$pp = $pp.eq($pp.length - 1);			
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
