/*

Weitere Hinweise zum Vorgehen in einer Datenanalyse:
https://www.udacity.com/course/ud032?utm_source=sendgrid&utm_medium=email&utm_campaign=march-newsletter

toDo:
- Metadatensätez anlegen, inkl. d3/svg, tsv und einer allgemeinen und speziellen Beschreibung des Diagramm
- gauss vollständig einbinden
- MONGO DB ablage je untersuchter Plattform
-- Daten als solche
-- Sessions
-- API
-- Upload, Felder zuordnen, Lizenz festlegen, daten für visualisierung berechnen
-- write function to append existing log

Workflow
	mongodump --db <application name>
	bsondump collection.bson > collection.json
	replace ObjectId( ) Date( )
	make array, add comma
	write config
	run script below
	process csv in R
	preprocess date via api to render it with D3.js

IWRM
file:///home/abb/Documents/www2/vi-analytics/public/vi-lab/analysis/cordtra-video-time.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/bar_sessions_per_country.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/session_activity_distribution.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/bar_activities_per_video.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/heatmap-matrix-paths.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/bar-paths.html


SCM
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/bar_group-annotations.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/cordtra-group-time-tool.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/scatter_group_phase_activity.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/cordtra-video-time-tool.html
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/cordtra-video-source-time-tool.html

*/


var
	fs = require('node-fs'),
	csv = require('csv'),
	gauss = require('gauss'),
	Collection = gauss.Collection,
	mongoose = require( 'mongoose' ),
	Log  = mongoose.model( 'Log' ),
	hooks = {},
	http = require('http'),
	parser = require('ua-parser-js'),
	tmp=[]
	;


/*
* Hooks
**/
exports.registerHook = function(hook, callback, fn){ 
	if( hook in hooks === false){
		hooks[hook] = [];
	}
	hooks[hook].push( {callback: callback, fn: fn} );
}

exports.callHook = function(c){ callHook(c); };

var callHook = function (hook){ console.log('hooked    '+hook)
	for(var h in hooks[hook] ){
		if( hooks[hook].hasOwnProperty(h) ){ 
			var the_hook = hooks[hook][h];
			the_hook.callback[ the_hook.fn ]();
		}else{
			return;
		}
	}
}



/*
* Load config
**/
var project = 'etuscript2015';
exports.project = project;	


// loads configuration file
var projectConfiguration = require("./input/"+ project +"/config.json");
exports.projectConfiguration = projectConfiguration;



/*
* Determines whether the main log is a JSON or CSV-File
**/	
exports.makeCleanLog = function(req, result){

	var regex = new RegExp(/.json/);
	if( projectConfiguration.raw_logfile.match( regex ) ){ 
		convertLogFromJSON( projectConfiguration );
	}else{
		convertLogFromCSV( projectConfiguration, true );
	}

};	



/*
 * Converts and completes JSON Log from Vi-Two considering further files with meta data about the videos, users, script phases, and groups.
 * @return Loads data into MongoDB and writes output csv-file for further processing in R.
 **/
convertLogFromJSON = function(conf){ 
	var 
		JSONStream = require('JSONStream'),
		crypto = require('crypto'),
		es = require('event-stream'),
		fs = require("fs"),
		videos = JSON.parse( fs.readFileSync( projectConfiguration.videos ) ),
		o = {},
		phases = require( projectConfiguration.script_phases ),
		session = [], 
		out = 'utc,date,time,phase,group,group_name,user,user_name,user_culture,user_gender,user_session,video_file,video_id,video_language,video_length,playback_time,action_context,action_type,action_value,action_artefact,action_artefact_id,action_artefact_author,action_artefact_time,action_artefact_response,ip,ua_browser,ua_browser_engine,ua_browser_version,ua_device,ua_os,ua_os_version,\n'
		;
		
		
	Log.remove({}, function(err) { 
		fileStream = fs.createReadStream( conf.raw_logfile, {encoding: 'utf8'});
		fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function (data) {
		    o = {};
	    	
				// extent temporal data	
				var d = new Date(data.utc);
				o.utc = parseInt(data.utc);
				o.date = d.toLocaleDateString();
				o.time = d.toLocaleTimeString();
				
				// xxx exception treatment
				if(o.date === '2016-10-23'){
					o.date = '2015-10-23';
				}
		
				// extent phase
				var getScriptPhase = function (utc){
					for (var i = 0; i < phases.phases.length; i++){
						//console.log(utc, phases.phases[i].utc)
						if( utc < phases.phases[i].utc ){
							return i;
						} 
					}
					//console.log(-99,o.date, data.user)
					return 6; // make negative xxx -99
				}
				o.phase = getScriptPhase( o.utc ); //if(data.phase == -1){ console.log('outside phase range: '+data.utc)}
				
				// extent user data
				var u = getUserData( data.user );
				o.user = data.user;
				o.user_name = u.name;
				o.user_gender = u.gender;
				o.user_culture = u.culture; 
		
				// extent group data
				o.group_name = u.groups[ ( o.phase - 1 ) ]
				o.group = String(o.group_name).replace(/[0-9]/, ''); 
				
				// extent video data
				var getVideoFile = function(id){  
					for (var i = 0; i < videos.length; i++){ 
						if( id === videos[i]._id ){  //console.log(videos[i].metadata[0]['length'])
							return {
									file: videos[i].video.replace("http://141.46.8.101/beta/e2script/", ''),
									length: videos[i].metadata[0]['length'],
									language: 'de'//videos[i].metadata[0].language
								};	
							} 
						} 
						return {
									file: "-99",
									length: "-99",
									language: "-99"
								};
					}
				var v = getVideoFile( data.video_id ); // missing field video_id xxx
				o.video_id = String(data.video_id).replace('52a13d2e2aa9d35f24000',''); //console.log(v)
				o.video_file = v.file;
				o.video_length = deci2seconds( v['length'] ); //console.log(v['length'],o.video_id,v.file,o.video_length)
				o.video_language = v.language;
				o.playback_time = data.playback_time;		
				
				
				// extent action
				o.action_context = data.action.context;
				o.action_type = data.action.action;
				
				if( typeof data.action.values === 'object' && data.action.values.length === 1 ){
					o.action_value = data.action.values[0]
				
				}else if( typeof data.action.values === 'object' && data.action.values.length === 2 ){
					if(data.action.action === 'skip-back'){
						o.action_value = data.action.values[0]; // take first value = starting time
					
					}else if(data.action.action === 'change-speed'){
						o.action_value = data.action.values[1]; // take second value = resulting playback speed
					
					}else if(data.action.action === 'timeline-link-click' && data.action.context === 'assessment'){
						o.action_artefact = decodeURIComponent( data.action.values[0].question );
						o.action_artefact_id = data.action.values[0].question.hashCode(); // htmlentitites
						o.action_artefact_author = -99;//xxx missing ; data.action.values[1];
						o.action_artefact_time = parseInt(data.action.values[1]); 
					
					}else if(data.action.action === 'video-loading-time'){
						o.action_value = data.action.values[0] +';'+data.action.values[1];
					
					}else{
						console.log('missed::: ',o.action_context,o.action_type)
					}	
				
				}else if( typeof data.action.values === 'object' && data.action.values.length === 3 ){
					o.action_artefact = decodeURIComponent( data.action.values[0] );
					o.action_artefact_id = data.action.values[0].hashCode();
					o.action_artefact_author = data.action.values[1];
					o.action_artefact_time = parseInt(data.action.values[2]);
					//if( tmp.indexOf(data.action.action) === -1){ tmp.push(data.action);}	
				
				} else if( typeof data.action.values === 'object' && data.action.values.length === 4 ){
					o.action_artefact = decodeURIComponent( data.action.values[0] ); //
					o.action_artefact_id = data.action.values[0].hashCode();
					o.action_artefact_author = data.action.values[1];
					o.action_artefact_time = parseInt(data.action.values[2]); 
					o.action_artefact_response = decodeURIComponent( data.action.values[3] ); //
				
				} else if(typeof data.action.values === 'object'){
					console.log('missed2::: ',data.action.context,data.action.action)
				}
				
				// parse user agent
				var ua = parser(data.user_agent);
				o.ua_browser = ua.browser.name;
				o.ua_browser_version = ua.browser.major;
				o.ua_browser_engine = ua.engine.name + '_'+ ua.engine.version;
				o.ua_os = ua.os.name;
				o.ua_os_version = ua.os.version;
				o.ua_device = ua.device.vendor ? ua.device.model +'_'+ ua.device.vendor +'_'+ua.device.type : -88;
				o.ip = data.ip;
				
				// extent session data
				if( session[ o.user ] === undefined ){
					session[ o.user ] = {}; session[ o.user ].session = 0;
				}
				s = session[ o.user ];
				// increment session if user has been inactive for more then one hour or changed IP or browser
			  if( s.ip !== o.ip || s.ua_browser !== o.ua_browser || (parseInt(o.utc) - s.utc) > 1800000 ){
					s.session++; //console.log(s.session)
					s.user_name = o.user_name;
					s.ip = o.ip;
					s.ua_browser = o.ua_browser;
					s.utc = parseInt(o.utc);
				}else{
					s.utc = parseInt(o.utc);
				}
				o.user_session = s.session;
				
				// print
				//console.log(orderKeys( o ));
				
				if( projectConfiguration.exclude_groups.indexOf( o.group ) === -1 && o.group !== undefined ){
				
					out += o.utc +',';//: 1477205745779, 
					out += '"'+ o.date +'",';//date: '2016-10-23',
					out += '"'+ o.time +'",';//time: '08:55:45',
					out += o.phase +',';//phase: 1,
			
					out += '"'+ o.group +'",';//group: 'init',
					out += '"'+ o.group_name +'",';//group_name: 'init',
					out += o.user +',';//user: 14,
					out += '"'+ crypto.createHash('md5').update( o.user_name ).digest('hex') +'",';//user_name: 'Andre',
					out += '"'+ o.user_culture +'",';//user_culture: 'de',
					out += '"'+ o.user_gender +'",';//user_gender: 'm',
					out += o.user_session +',';//user_session: 12,
	
					out += '"'+ o.video_file +'",';//video_file: 'e2script_kickoff.mp4',
					out += '"'+ o.video_id +'",';//video_id: '52a13d2e2aa9d35f24000014',
					out += '"'+ o.video_language +'",';//video_language: 'de',
					out += o.video_length +',';//video_length: 2942
					out += o.playback_time.toFixed(3) +',';//playback_time: 131.101927,
			
					out += '"'+ o.action_context +'",';//action_type: 'playback',
					out += '"'+ o.action_type  +'",';//action_context: 'player',
					out += '"'+ validate( o.action_value ) +'",';//action_value: '26',
					out += '"'+ validate( o.action_artefact ) +'",';//o.action_artefact = data.action.values[0];
					out += '"'+ validate( o.action_artefact_id ) +'",';//o.action_artefact_id = data.action.values[0].hashCode();
					out += validate( o.action_artefact_author ) +',';//o.action_artefact_author = data.action.values[1];
					out += validate( o.action_artefact_time ) +',';//o.action_artefact_time = parseInt(data.action.values[2]); 
					out += '"'+ validate( o.action_artefact_response ) +'",';//o.action_artefact_response = data.action.values[3];

					out += '"'+ o.ip +'",';//ip: '93.220.148.19',
					out += '"'+ validate( o.ua_browser ) +'",';//ua_browser: 'Firefox',
					out += '"'+ validate( o.ua_browser_engine ) +'",';//ua_browser_engine: 'Gecko_41.0',
					out += validate( o.ua_browser_version ) +',';//ua_browser_version: '41',
					out += '"'+ validate( o.ua_device ) +'",';//ua_device: -88,
					out += '"'+ validate( o.ua_os ) +'",';//ua_os: 'Windows',
					out += validate( o.ua_os_version ) +',';//ua_os_version: 'Vista',

					out += '\n';
					//console.log(out)
					writeFile.write(out);	
					
	    		this.pause();
	    		saveLogEntry(o, this);
	    	}
	    	out='';
	    return data;
		},function end () {
				console.log(tmp)
		    console.log('stream reading ended');
		    this.emit('end');
		 }));
	});	 
}



/*
 * Logging
 **/
var writeFile = fs.createWriteStream('./input/'+ project +'/logfile_clean.csv', {'flags': 'a'}); // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file


/*
 * Saves a single log entry to the database
 **/
function saveLogEntry(file, es){ 
	// save it
	new Log( file ).save( function( err, entry, count ){
		if(err){
			console.log(err)
		}else{
			es.resume();
		}
	});
}



/*
Identify the video file for a given video-id
**/
var users = require( projectConfiguration.users );
var getUserData = function(id){ 
	for (var i = 0; i < users.length; i++){
			if( Number(id) === Number(users[i].id) ){
				return {
					name: users[i].username,
					gender: users[i].gender,
					culture: users[i].culture,
					groups: users[i].groups
				};	
			} 
		}
		return {
					user_name: '-99',
					user_gender: '-99',
					user_culture: '-99'
				};
	}	



/*
 * Validates Strings
 **/
function validate( val ){
	if( val === undefined ){ 
		return -88;
	}else if(typeof val === 'string' ){
		return val.replace(/,/g, ';').replace(/\\n/g, '// ');
	}else{ return val;}	
	
}


/*
 * Generates hash from string
 **/
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


/* 
 * Converts decimal time format into seconds 
 **/
deci2seconds = function( decimal ){
		if(Number(decimal) < 0 || decimal === undefined ){ return 0; }
		var arr = decimal.split(':');
		if(arr.length === 3){
			return parseInt(arr[1]) * 3600 + parseInt(arr[2]) ;
		}
		if(arr.length === 2){
			return (parseInt(arr[0])*3600 + parseInt(arr[1]) * 60 ) ;
		}else{
		
			console.log('___'+decimal)
			return -99;	
		}	
	}


			
