//////////////////////////
// PASSPORT


var 
	passport = require('passport'), 
	flash = require('connect-flash'),
	database = require('../routes/wines.js'),
	LocalStrategy = require('passport-local').Strategy,
//	identicon = require('identicon/identicon.js'),
	fs = require('node-fs'),
	csv = require('csv');


exports.passport = passport;
server = 'http://176.10.37.68:3000' ;//'http://176.10.37.68:3000';

/*********************************/
/* USER MGMT */
	var users = [];
 
/* Load user data from csv file. Insert data into database s**/
exports.loadUserTable = function(){
	
	// read file
	fs.readFile(__dirname+'/user.csv', function read(err, data) {
		csv().from.string(data, {comment: '#'} )
			.to.array( function(data){
				//console.log(data);
				// users = [];
				// define user for each line
				for(var i = 1; i < data.length; i++){
					//console.log(data[i]);
					var u = {
						id: i,
						username: data[i][13], 
						password: data[i][2], 
						email: data[i][11],
						name : data[i][1],
						firstname: data[i][0],
						hs: data[i][3],
						role: data[i][12], 
						icon : 'img/usericons/user-'+i+'.png', 
						trace : 1,
						experimental: data[i][10],
						groups : [data[i][6], data[i][8], data[i][9]]	
					};
					//console.log(JSON.stringify(u));
					users.push(u);
					generateIdenticon((data[i][1]).toLowerCase(), i);
					
				}// end for
				// insert into database
				database.db.collection('users', function(err, collection) {
        	collection.remove();
        	console.log("Removed users");
    		});
    		database.db.collection('users', function(err, collection) {
	        collection.insert(users, {safe:true}, function(err, result) {});
  	      console.log("Added users");
    		});	
			});// end read
	});// end csv
};

/* Generate user Icons for each user **/
var generateIdenticon = function(name, id){
	/* // can't be installed on ubuntu 10.04 server
	identicon.generate(name, 10, function(err, buffer) {
		 if(err){ console.log('## ERROR while generating identicon')}
			fs.writeFileSync('/home/abb/Documents/www2/scm2-node/public/vi-lab/img/user-icons/user-'+id+'.png', buffer);
	});
	*/
};

/***************************************************/
/* GROUP MGMT */

	var groups = [];

/* Load user data from csv file. Insert data into database **/
exports.loadGroupTable = function(){
	
	// read file
	fs.readFile(__dirname+'/groups.csv', function read(err, data) {
		csv().from.string(data, {comment: '#'} )
			.to.array( function(data){
				//console.log(data);
				// groups = [];
				// define group for each line
				for(var i = 1; i < data.length; i++){
					//console.log(data[i]);
					var g = {
						id: data[i][0],
						description: data[i][1],
						persons: data[i][2],
						hs: data[i][3], 
						videos : (data[i][4]).split(';') // data[i][3],				"videos" : ["5294bc22985254e831000002", "2", "3"]
					};
					//console.log(JSON.stringify(g));
					groups.push(g);
					
				}// end for
				// insert into database   
				database.db.collection('groups', function(err, collection) {
						collection.remove();
						console.log("Removed groups");
				});
				database.db.collection('groups', function(err, collection) {
						collection.insert(groups, {safe:true}, function(err, result) {});
						console.log("Added groups");
				});	
			});// end read
	});// end csv
};
	



function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

var findVideoByGroup = function(id, cb) {
	var t = -1;
  database.db.collection('groups', function(err, collection) {
		collection.findOne({'id':id}, function(err, item) {
			if(!err){
				cb(item.videos[0]);
				console.log(item.videos[0]);
			}
      
      
    });
  });
};

//
exports.showAccountDetails = function(req, res){
  res.render('account', { user: req.user });
};

exports.openLoginPage = function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
};

exports.handleLogout = function(req, res){
  req.logout();
  res.redirect(server+'/login');
}; 

/* Check wether a user is logged in or not. If logged in give out the username. If not redirect to the login page. **/
exports.loggedIn = function loggedIn(req, res, next) {
	//console.log('#########################################');
  if (req.user) {
    res.type('application/json');
    //console.log('#############'  +req.user.groups[0]);
    findVideoByGroup(req.user.groups[0], function(video){
    	console.log('........................'+video) 
    	res.jsonp({username: req.user.username, id: req.user.id, videoid: video});
   	});
  } else {
  	res.redirect(server+'/login');
    //res.type('application/json');
    //res.jsonp({hello:'you are not logged in'});
  }
}; 


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));






// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  	console.log('------------------'+'/login');
  res.redirect('/login')
}
