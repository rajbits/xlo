(function(window, $, undefined)
{
	//Assumes the checkboxes are inside ul > li (need not be directly inside)
	$.fn.select = function(pref)
	{
		return this.each(function()
		{
			var $me = $(this);
			$me.on('click tap', function(e)
			{
				var $self = $(e.target), $el = $me.parents('ol:eq(0)'), $last = $el.data('last');
				if ($el.length == 0) $el = $me.parents('ul:eq(0)');
				
				if (e.shiftKey && $last)
				{
					var $checks = $el.find('input:checkbox'), pi = $checks.index($last), ci = $checks.index($self);
					$checks.slice(Math.min(pi, ci), Math.max(pi, ci) + 1).prop({checked: true});
					
					return true;
				}
				
				if ($self.is(':checked')) $el.data('last', $self); else $el.removeData('last');
				return true;
			});
		});
	};
})(window, jQuery);
