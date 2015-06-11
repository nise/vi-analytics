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




var 
	express = require('express'),
	app = express(),
	path = require('path'),
//	wine = require('./routes/wines'),  //!!
//	userMgmt = require('./routes/userMgmt'),
	flash = require('connect-flash'),
	server = require('http').createServer(app),
	fs = require('node-fs'),
	core = require('./core')
	;

	server.listen(3000);

/* configure application **/
	app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
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
	
	//console.log('............................................................................\n\n');
	
	
	
	
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
	
//
//require('./analysis');	
//require('./modules/distribution').init();
//require('./modules/time-effort').init();
//require('./modules/feedback-analysis').init();

//require('./modules/effective-interactions').init();

//core.init();

//var config = require("./input/etuscript/config.json");
//require('./modules/annotations').init(config);
//require('./modules/fill-in').init(config);
//require('./modules/ondemandtasks').init(config);
//require('./modules/etherpad').init(config);


//app.get('/analytics', core.init);





/**
Proofe of concept about generating SVG files from data input
*/
var jsdom = require('jsdom').jsdom;
var fs = require('fs');

var boilerplate = fs.readFileSync('index.html');

var doc = jsdom(boilerplate);
//doc.implementation.addFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1')
var window = doc.parentWindow;

window.onload = function() {
   window.Raphael.prototype.renderfix = function(){};
   var svgContainer = window.document.getElementById('svg');
   var paper = window.Raphael(svgContainer, 640, 480);
   paper
      .rect(0, 0, 640, 480, 10)
      .attr({
         fill: '#fff',
         stroke: 'none'
      });
   var circle = paper
                .circle(320, 240, 60)
                .attr({
                  fill: '#223fa3',
                  stroke: '#000',
                  'stroke-width': 80,
                  'stroke-opacity': 0.5
                });
   paper
      .rect(circle.attr('cx') - 10, circle.attr('cy') - 10, 20, 20)
      .attr({
         fill: '#fff',
         stroke: 'none'
      });
   console.log(svgContainer.innerHTML);
};

















