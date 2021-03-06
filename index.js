/*


Run D3.js on serverside
http://mango-is.com/blog/engineering/pre-render-d3-js-charts-at-server-side.html


time series in node: https://github.com/cgbystrom/hoard
rrd format: http://oss.oetiker.ch/rrdtool/tut/rrd-beginners.en.html

Bigger frameworks for various analyses
https://github.com/CIShell/CIShell


R und node.js
https://gitorious.org/r-node/r-node/source/3cd7d5bb0b2ea73ae0ea7ab68e839cb8af2567f0:


http://square.github.io/cube/
intro: http://flowingdata.com/2011/09/21/quick-time-series-visualization-with-cube/


Web Analyse
http://piwik.org/docs/installation-maintenance/


edX analytics API
http://edx.readthedocs.org/projects/edx-data-analytics-api/en/latest/videos.html

*/


require( './db' );

var 
/*	express = require('express'),
	expressValidator = require('express-validator'),
	app = express(),
	path = require('path'),
	flash = require('connect-flash'),
	server = require('http').createServer(app),*/
	fs = require('node-fs'),
	//express = require('express'),
	core = require('./core')
	;
	var port = 3011;
	/*server.listen( port );*/

	/* configure application 
	app.set('port', process.env.PORT || port);
	app.use(express.logger('dev')); 
		

	app.use(express.static(path.join(__dirname, 'results')));
		// Passport:
	app.set('views', __dirname + '/public/vi-lab/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
	
	var cookieParser = require('cookie-parser');
	app.use(cookieParser());
	//	app.use(express.cookieSession({ secret: 'tobo!', maxAge: 360*5 }));
	
	var json = require('express-json');
	app.use( json());

	var bodyParser = require('body-parser');
	app.use(expressValidator());	
	app.use( bodyParser.urlencoded({ extended: true }));
	app.use( bodyParser.json());
	
	var methodOverride = require('method-override');
	app.use( methodOverride());
	
	var session = require('express-session');
	app.use(session({
		secret: 'keyb22oar4d cat', 
		saveUninitialized: true,
		resave: true
		}));

	app.use(flash());
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	//	app.use(users.passport.initialize());
	//	app.use(users.passport.session());
	//app.use(app.router);
	app.set("jsonp callback", true); // ?????
	
	// not working to prerender c3.js
	//app.use(require('prerender-node'));
	**/



/**
* Start application including modules when the database has been loaded
*/	
var mongoose = require( 'mongoose' );

exports.init = function(app, err, res){ 
	initDB(app, null, function(data){
		res( data )
	});
}


/***/
var initDB = function(app, err, res){
 
	var connection = mongoose.connect( 'mongodb://localhost/vi-analytics' , function(err, db){
		if(err){
			console.log(err);
		}else{
			// database log loaded
		
			//var preposttest = require('./modules/pre-post-test/pre-post-test');
			//var p = new preposttest(app);	
			
			core.makeCleanLog();
			
	
	/*
			var perception = require('./modules/perception-per-video/perception-per-video');
			var pp = new perception();
			 pp.init(app, null, function(data){
			 		res( data );
			 });
		
			var pattern = require('./modules/video-usage-patterns/video-usage-patterns');
			var s = new pattern(app);

			var usage = require('./modules/activity-distribution/activity-distribution');
			var u = new usage(app);

			var rewatching = require('./modules/rewatching/rewatching');
			var r = new rewatching(app);

			var selfa = require('./modules/self-assessment/self-assessment');
			var s = new selfa();
	
			var annotations = require('./modules/annotations/annotations');
			var a = new annotations();
			
			require('./modules/effective-interactions/analysis');	
			*/
		
			/*   OLD STUFF */
			//require('./modules/effective-interactions').init();
			//require('./modules/distribution').init();
			//require('./modules/time-effort').init();
			//require('./modules/feedback-analysis').init();
			//require('./modules/annotations').init(config);
			//require('./modules/fill-in').init(config);
			//require('./modules/ondemandtasks').init(config);
			//require('./modules/etherpad').init(config);
			core.callHook( 'on-load' );
		}
	});	

}



initDB();

	
	
	/*
	Scan modules folder to register modules	
	**/
var ttrtt = function(){	
	var dir = './modules';
	var files = fs.readdirSync(dir);
	for(var i in files){
		  if (!files.hasOwnProperty(i)) continue;
		  var name = dir+'/'+files[i];
		  if (fs.statSync(name).isDirectory()){
		      //getFiles(name);
		  }else{
		  		if(name.slice(-1) === '~'){ break;}
		      //console.log('Running module: '+ files[i])
		      //var mod = require(name);
		      //mod.init();
		      break;
		  }
	}
}


	























