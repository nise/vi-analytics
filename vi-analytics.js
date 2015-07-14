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

*/


require( './db' );

var 
	express = require('express'),
	expressValidator = require('express-validator'),
	app = express(),
	path = require('path'),
	flash = require('connect-flash'),
	server = require('http').createServer(app),
	fs = require('node-fs'),
	core = require('./core')
	;
	var port = 3033;
	server.listen( port );

/* configure application **/
    app.set('port', process.env.PORT || port);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    

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

	app.get('/video-heatmap', function(req, res) { 
						res.sendfile('./results/viz_perception-heatmap.html', {root: __dirname });
	});
	
	app.get('/test3', function(req, res) { 
						res.sendfile('./results/line_forward-backward-dist.html', {root: __dirname });
	});
	
	
	app.get('/test2', function(req, res) { 
						res.sendfile('./results/viz_perception-patterns.html', {root: __dirname });
	});

/*
	app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  // 'default', 'short', 'tiny', 'dev' 
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'results')));
    // Passport:
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.engine('ejs', require('ejs-locals'));
		app.use(express.logger());
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.session({ secret: 'keyboard cat' }));
		app.use(flash());
		// Initialize Passport!  Also use passport.session() middleware, to support
		// persistent login sessions (recommended).
//		app.use(userMgmt.passport.initialize());
//		app.use(userMgmt.passport.session());
		app.use(app.router);
		app.set("jsonp callback", true); // ?????
	});
*/	


/**
* Start application including modules when the database has been loaded
*/	
var mongoose = require( 'mongoose' );
var conn = mongoose.connect( 'mongodb://localhost/vi-analytics' , function(err, db){
	if(err){
		console.log(err);
	}else{
		//
		//require('./analysis');	
		//require('./modules/distribution').init();
		//require('./modules/time-effort').init();
		//require('./modules/feedback-analysis').init();

		//require('./modules/effective-interactions').init();
		
	
		//core.makeCleanLog();
		//var t = require('./modules/peer-annotations/peer-annotations');
		var tt = require('./modules/video-perception/video-perception');
		var t = new tt(22);

		var selfa = require('./modules/self-assessment/self-assessment');
		//var s = new selfa();
		
		core.callHook( 'on-load' );

		//var config = require("./input/etuscript/config.json");
		//require('./modules/annotations').init(config);
		//require('./modules/fill-in').init(config);
		//require('./modules/ondemandtasks').init(config);
		//require('./modules/etherpad').init(config);


		//app.get('/analytics', core.init);

	
	}
});	
	
	
	/*
	Scan modules folder to register modules	
	**/
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



module.exports = function() {
    console.log(other.doSomething());
}
	























