/*



time series in node: https://github.com/cgbystrom/hoard
rrd format: http://oss.oetiker.ch/rrdtool/tut/rrd-beginners.en.html





*/




var 
	express = require('express'),
	app = express(),
	path = require('path'),
//	wine = require('./routes/wines'),  //!!
//	userMgmt = require('./routes/userMgmt'),
	flash = require('connect-flash'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	fs = require('node-fs'),
	analytics = require('./core')
	;

	server.listen(3000);

/* configure application **/
	app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
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
	
	
	analytics.init();
	app.get('/analytics', analytics.init);
	


/* setup sockets **/
	io.sockets.on('connection', function (socket) {
		/*
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
		  console.log(data);
		});
		socket.broadcast.emit('user connected');
		*/
		socket.on('registered user', function(data) {
			socket.broadcast.emit('broadcast-user-online',data); 
		});
		
		socket.on('updated video', function (data) {
			console.log('update info eingegangen '+data.videoid);
		  socket.broadcast.emit('broadcast',{hello:'world2'}); 
		});
	});





