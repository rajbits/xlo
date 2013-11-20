var user = 
{
	email: null,
	pwd: null	
};

Xlo.server = 'http://localhost:9000/';

Xlo.assets.loadcss('assets/css/main.css', function(){ });
function login()
{
	Xlo.assets.loadview('assets/view/main.htm',
	function(data)
	{
		function signIn()
		{
			var o = 
			{
				url: Xlo.server + 'svc/auth',
				data:
				{
					usr: user.email,
					pwd: CryptoJS.SHA256(user.pwd).toString()
				},
				success: function(data, xhr, status)
				{
					$.publish('nav.home');
					Xlo.assets.loadjs('../../modules/activity/assets/js/init.js');
				},
				error: function(xhr, status, err)
				{
					
				}
			};
			
			$.ajax(o);
			return false;
		}
		
		function register_click()
		{
			Xlo.assets.loadview('assets/view/register.htm', function(data)
			{
				$('#main').empty();
				var $register = duplex.render({model: {user: user, register: register, cancel: cancel_register}, template: $(data)});
				$('#main').append($register);
			});
		}
		
		function register()
		{
			
		}
		
		function cancel_register()
		{
			login();
		}
		
		var $signin = duplex.render({model: { user: user, signIn: signIn, register_click: register_click }, template: $(data)});
		$('#main').empty().append($signin);
	});	
}

Xlo.assets.loadjs('assets/lib/crypto/crypto-3.1.2-sha256.js', login);
