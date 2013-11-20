var fs = require('fs'),
	extra = require('fs.extra'),
	watchr = require('watchr'),
	path = require('path');

var SRC = '../src', DIST = '../dist';

//Main build function
function Build(argv)
{
	var platform = 'desktop';
	
	function parse_args()
	{
		for(var i = 0; i < argv.length; i++)
		{
			var a = argv[i];
			if (!a) continue;
			
			if (a.indexOf('-') == 0)
			{
				var k = a.replace('-', '');
				if (k == 'p')
				{
					if (i >= argv.length)
						break;
						
					var p = argv[++i];
					platform = p;
				}	
			}
		}
	}
	
	parse_args();
	var target = DIST + path.sep + platform;
	
	function init()
	{
		dist();
		copy();
		watch(SRC);
	}
	
	function dist()
	{
		extra.mkdirRecursiveSync(target, 0777);
	}
	
	function copy()
	{
		extra.removeSync(target);
		extra.copyRecursive(platform, target, function()
		{
			extra.copyRecursive(SRC, target, function() {});
		});		
	}
	
	function watch(folder)
	{
		watchr.watch(
		{
			paths: [ folder ], 
			listeners: 
			{
				change: function(type, fileName, fileCurrentStat, filePrevStat)
				{
					fileName = fileName.replace(SRC + path.sep, '');
					console.log('file: ' + fileName);
					
					var exists = fs.existsSync(SRC + path.sep + fileName),
						isDir = fs.lstatSync(SRC + path.sep + fileName).isDirectory();
		
					console.log("File exists " + exists + " Is Dir " + isDir);			
					if (exists && isDir)
					{
						extra.mkdirRecursiveSync(target + path.sep + fileName, 0777);
						return;	
					}
					
					try
					{
						fs.unlinkSync(target + path.sep + fileName);	
					}
					catch(e)
					{
						console.log('Exception (may be a new file)' + e.message);
					}
					
					extra.copy(SRC + path.sep + fileName, target + path.sep + fileName, function(err)
					{
						if (!err)
							console.log('Copied ' + SRC + path.sep + fileName + "\n" + target + path.sep + fileName);
						else
							console.log(err);
					});
				}
			}
		});
	}
	
	return {
		init: init,
		watch: watch
	};
}

var build = new Build(process.argv);
build.init();
