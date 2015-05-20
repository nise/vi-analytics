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
	Collection = gauss.Collection
	;



var groupData = require('./input/scm2-groups.json');
var userData = require('./input/scm2-users.json');
var videoMetaDataOrg = require('./input/scm2-video-metadata.json');
	
/*

**/	
exports.init = function(req, result){
	
	// load config and integrate all data
	var config = require("./input/etuscript/config.json");
	convertLog2( config, true );  

return;

// PREPARE DATA	
	//convertLog({filename:'scm2.csv', type:'scm2'}); 
	//getUserData({filename:'scm2_user.csv'});
	//getGroupData({filename:'scm2_groups.csv'});
	//getVideoData({filename:'scm2-video-metadata.csv'});
	//return;
	//convertLog({filename:'iwrm-clean.csv', type:'iwrm'}); return;

// INPUT DATA SCM
/*
	cleanlog = require('./input/scm2.json');
	videoMetaData = require('./input/scm2_videos.json');
	userData = require('./input/scm2-users.json');
	groupData = require('./input/scm2-groups.json');
	videoMetaDataOrg = require('./input/scm2-video-metadata.json');


// PRE CALC
	var sessions = getSessions();
	var paths = frequentPaths(sessions, 3);
	*/
	
// VISUALIZATION		
//phaseActivity(userData);

//pathTime(sessions, 3);	

// done:
//effektiveInter();
// cordtra();
//annotations(userData, videoMetaData);		

var path = '/home/abb/Documents/proj_001_doc/pres/20150204-BGU/data/scm2-users.json';	
var ano = anonymizeData(path, ['firstname', 'name', 'user'], 'md5');

return;

// INPUT DATA IWRM
	cleanlog = require('./input/iwrm.json');
	videoMetadata = require('./input/iwrm-data-video.json')

// PRE CALC
	var sessions = getSessions();
	//var paths = frequentPaths(sessions, 3);

	//return;
	var categoryOfVideo = getVideoCategories(videoMetadata);
	var categoryNameOfVideo = getVideoCategoryName(videoMetadata);
	

// VISUALIZATION
	//sessionActivityDistribution(sessions);
	sessionsPerCountry(sessions)
	//simpleCordtra();		
	//frequentPathsMatrix(paths, categoryOfVideo, node_list);

//pathTime(sessions, 3);	


// done:
//  frequentPathsNetwork(paths, categoryOfVideo, categoryNameOfVideo);
//	activityPerVideo(categoryOfVideo, categoryNameOfVideo);	
	
};	





/*****************************************************************************/
/*
- script transitions

*/


convertLog2 = function(conf, debug){ 
	
	var geoip = require('geoip-lite');	
	// var log = fs.createWriteStream(__dirname+'/input/'+req.type+'.json', {'flags': 'a'}); 
	var cleanLog = [];
	// load raw log
	fs.readFile( conf.raw_logfile, 'utf8', function read(err, data) { 
		if (err) throw err;
  	console.log('Read raw log file: ' + conf.raw_logfile);
  	
  	var 
			location = {},
			action = {},
			j = 0,
			el = [],
			x = [],
			a_tmp = [],
			csv_amount_of_fields = [],
			csv_empty_fields = [],
  		phases = require( conf.script_phases ).transitions,
  		videos = require( conf.videos )
  		users = require( conf.users )
  		groups = require( conf.groups )
  		;
  	
  	// process lines
  	lines = data.toString().split('\n');
  	for(var i = 0; i < lines.length-1; i++){ //if(i == 10) break;
  		if(lines[i] == undefined ){
  			console.warning('Ignores Rows: '+i +' '+lines[i-1].utc);
  		}else{
				el = lines[i].toString().split(',');
				// do some statistics about the data consistency
				csv_amount_of_fields[i] = el.length;
				
				
				// filter test group
				if( conf.exclude_groups.indexOf( el[ conf.raw_field_mapping.group ] ) == -1 ){
					// pre-process
					
					if(el[  conf.raw_field_mapping.action_details  ] != undefined){
						a_tmp = el[  conf.raw_field_mapping.action_details  ].split(':');
						action_value = el[  conf.raw_field_mapping.action_details  ]
					}else{
						//console.log(i, el);
					}
					
					if(el.length != 9 && debug){
						console.log(i, el.length, el);
					}
						
					switch(a_tmp[0]){
						case 'loadvideo' : 								action = {command:a_tmp[0], value:action_value.replace('loadvideo:','')}; break;
						case 'videoplayed' : 							action = {command:a_tmp[0], value:action_value.replace('videoplayed:','')}; break;
						case 'videopaused' : 							action = {command:a_tmp[0], value:action_value.replace('videopaused:','')}; break;
						case 'videoended' : 							action = {command:a_tmp[0], value:action_value.replace('videoended:','')}; break;
						case 'assessmentdisplaybegin' : 	action = {command:a_tmp[0], value:''}; break;
						case 'submitassessmenttask' : 		action = {command:a_tmp[0], value:a_tmp[1]}; break;
						case 'assessmentcorrect' : 				action = {command:a_tmp[0], value:''}; break;
						case 'clicktocfromlist' : 				action = {command:a_tmp[0], value:action_value.replace('clicktocfromlist:')}; break;
						case 'clicktagfromlist' : 				action = {command:a_tmp[0], value:action_value.replace('clicktagfromlist:')}; break;
						case 'clickcommentfromlist' : 		action = {command:a_tmp[0], value:action_value.replace('clickcommentfromlist:')}; break;
						case 'clickassessmentfromlist' : 	action = {command:a_tmp[0], value:action_value.replace('clickassessmentfromlist:')}; break;
						case 'save' : 										action = {command:a_tmp[0], value:a_tmp[1]}; break;
						case 'deleteannotation' : 				action = {command:a_tmp[0], value:a_tmp[1]}; break;

						case '[call' : 										action = {command:a_tmp[1].replace(']',''), value:''}; break;
						case 'saveannotation' : 					x = a_tmp[1].split(' '); action = {command:a_tmp[0]+' '+x[0], value:x[1]}; break;
						default : x = action_value.split(' '); action = {command:x[1].replace(':',''), value:Number(x[2])}; 
					} 
					
					//var action_tmp = el[  conf.raw_field_mapping.action_details  ] != undefined ? el[  conf.raw_field_mapping.action_details  ].split(':') : 'nix';
					
					/*
					For a given time stamp it returns the script phase with that time event occured. 
					Since the timestamps of the script phases are sorted we can compare them against the given stamp.
					**/
					var getPhase = function (stamp){
								for (var i = 0; i < phases.length; i++){
									if( stamp < phases[i]){
										return i+1;
									} 
								}
								return phases.length;
							}
					/*
					Identify the video file for a given video-id
					**/
					var getVideoFile = function(id){ 
						for (var i = 0; i < videos.length; i++){
								if( id === videos[i]._id ){
									return {
										video_file: videos[i].video.replace("http://141.46.8.101/beta/e2script/", ''),
										video_length: videos[i].metadata[0].length,
										video_language: videos[i].metadata[0].language
									};	
								} 
							}
							return {
										video_file: "xxx",
										video_length: "xxx",
										video_language: "xxx"
									};
						}
					/*
					Identify the video file for a given video-id
					**/
					var getUserData = function(id){ 
						for (var i = 0; i < users.length; i++){
								if( Number(id) === Number(users[i].id) ){
									return {
										user_name: users[i].username,
										user_gender: users[i].gender,
										user_culture: users[i].culture
									};	
								} 
							}
							return {
										user_name: 'xxx',
										user_gender: 'xxx',
										user_culture: 'xxx'
									};
						}	
					var user = getUserData( el[ conf.raw_field_mapping.user ] );
					var video = getVideoFile( el[ conf.raw_field_mapping.video_id ] );
							
					// fill data modell
					cleanLog[j] = {
						utc: 							Number( el[ conf.raw_field_mapping.utc ] ), 
						phase: 						getPhase( el[ conf.raw_field_mapping.utc ] ),
						date:  						el[ conf.raw_field_mapping.date ], 
						time:  						el[ conf.raw_field_mapping.time ], 
						
						group:  					el[ conf.raw_field_mapping.group ], 
						user:  						Number( el[ conf.raw_field_mapping.user ] ) , 
						user_name:  			conf.raw_field_mapping.user_name === -1 ? user.user_name : el[ conf.raw_field_mapping.user_name ], 
						user_gender:			conf.raw_field_mapping.user_gender === -1 ? user.user_gender : el[ conf.raw_field_mapping.user_gender ],
						user_culture:			conf.raw_field_mapping.user_culture === -1 ? user.user_culture : el[ conf.raw_field_mapping.user_culture ], 
						
						video_id:  				el[ conf.raw_field_mapping.video_id ], 
						video_file:  			conf.raw_field_mapping.video_file === -1 ? video.video_file : el[ conf.raw_field_mapping.video_file ], 
						video_length:  		conf.raw_field_mapping.video_length === -1 ? video.video_length : el[ conf.raw_field_mapping.video_length ], 
						video_language:  	conf.raw_field_mapping.video_language === -1 ? video.video_language : el[ conf.raw_field_mapping.video_language ], 
						
						action:  					action.command,//action_tmp[0], 
						action_details: 	action.value,//el[ conf.raw_field_mapping.action_details ],
						
						user_agent:  			el[ conf.raw_field_mapping.user_agent ],
						ip: 							el[ conf.raw_field_mapping.ip ],
						flag: false // storage parameter for session detection
					}
					j++;
				}// end if filter
			}		
		};	// end for	
		
		// output debug info
		if(debug){	
			console.log('.....................');
			console.log('Number of lines: '+lines.length);
			console.log('Distribution of the number of fields per row:'); 
			console.log(new gauss.Collection(csv_amount_of_fields).distribution());
			console.log('Empty values per field'); 
			console.log(new gauss.Collection(csv_empty_fields).distribution());
			console.log('.....................');
		}	
		
		//console.log(cleanLog);
		
		// write clean log to fs	
		fs.writeFile( conf.clean_log, JSON.stringify( cleanLog, undefined,"\t"), function(err) {
		  if(err) {
		      console.log('Error: '+err);
		  } else {
		      console.log('The clean log was saved to ' + conf.clean_log );
		  }
		});// end fs out
	
	});// end read fs
} // end function














































/*
Loads logfile and converts and cleans it into a json file that is saved loacaly
@filename The csv file that is going to be converted and cleaned
@typ Logfile type 
**/

convertLog = function(req, res){
	var geoip = require('geoip-lite');	
	var log = fs.createWriteStream(__dirname+'/input/'+req.type+'.json', {'flags': 'a'}); 
	var cleanLog = [];
	fs.readFile(__dirname+'/input/'+req.filename, 'utf8', function read(err, data) { 
		if (err) throw err;
  	console.log('Read file ' + req.filename);
  	data = data.toString().split('\n');
  	var phase = 0, 
  			location = {},
  			action = {},
  			j = 0,
  			el = [],
  			x = [],
  			a_tmp = [],
  			csv_amount_of_fields = [],
  			csv_empty_fields = []
  			;	
  	for(var i = 0; i < data.length; i++){ //if(i == 10) break;
  		if(data[i] == undefined ){
  			console.warning('Ignores Rows: '+i +' '+data[i-1].utc);
  		}else{
				el = data[i].toString().split(', ');
				// do some statistics about the data consistency
				csv_amount_of_fields[i] = el.length;
				if(el.length ==10){ console.log(data[i]); }
				//csv_empty_fields[i] = new gauss.Vector(el).find(function(e) { return e === ''; }).toVector().sum();
				// distinguish different log-types for cleanup and preparation	 
				////////////////////////////////////////////////////////////////////
				if(req.type == 'etuscript'){
					/*
					0 .. timestamp
					1 date
					2 time
					3 user
					4 --
					5 _user id
					6 _group id
					7 command
					8 user agend
			
					*/
					// filter test group
					if(el[6] !== " x"){
						// pre-process
						phase = getPhaseByDate(el[1]);
						
						a_tmp = el[7].split(':');
						switch(a_tmp[0]){
							case 'loadvideo' : action = {command:a_tmp[0], value:el[7].replace('loadvideo:','')}; break;
							case 'videoplayed' : action = {command:a_tmp[0], value:el[7].replace('videoplayed:','')}; break;
							case 'videopaused' : action = {command:a_tmp[0], value:el[7].replace('videopaused:','')}; break;
							case 'videoended' : action = {command:a_tmp[0], value:el[7].replace('videoended:','')}; break;
							case 'assessmentdisplaybegin' : action = {command:a_tmp[0], value:''}; break;
							case 'submitassessmenttask' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case '[call' : action = { command: a_tmp[1].replace(']',''), value:''}; break;
							case 'assessmentcorrect' : action = {command:a_tmp[0], value:''}; break;
							case 'clicktocfromlist' : action = {command:a_tmp[0], value:el[7].replace('clicktocfromlist:')}; break;
							case 'clicktagfromlist' : action = {command:a_tmp[0], value:el[7].replace('clicktagfromlist:')}; break;
							case 'clickcommentfromlist' : action = {command:a_tmp[0], value:el[7].replace('clickcommentfromlist:')}; break;
							case 'clickassessmentfromlist' : action = {command:a_tmp[0], value:el[7].replace('clickassessmentfromlist:')}; break;
							case 'save' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case 'deleteannotation' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case 'saveannotation' : x = a_tmp[1].split(' '); action = {command:a_tmp[0]+' '+x[0], value:x[1]}; break;
							default : x = el[7].split(' '); action = {command:x[1], value:Number(x[2])}; 
						} 
						// fill data modell
						cleanLog[j] = {
							utc: Number(el[0]), 
							phase: Number(phase), 
							date: el[1], 
							time: el[2], 
							video: Number(el[3]), 
							group: Number(el[5]), 
							user: Number(el[6]), 
							action: el[7], 
							action_details: action, //{command:, value:'',}, // xxx
							user_agent: el[8],
							flag: false // storage parameter for session detection
						};
					}
				////////////////////////////////////////////////////////////////////	
				}else if(req.type == 'scm2'){
					// filter test user
					if(el[6] < 78){
						// pre-process
						phase = getPhaseByDate(el[1]);
						
						a_tmp = el[7].split(':');
						switch(a_tmp[0]){
							case 'loadvideo' : action = {command:a_tmp[0], value:el[7].replace('loadvideo:','')}; break;
							case 'videoplayed' : action = {command:a_tmp[0], value:el[7].replace('videoplayed:','')}; break;
							case 'videopaused' : action = {command:a_tmp[0], value:el[7].replace('videopaused:','')}; break;
							case 'videoended' : action = {command:a_tmp[0], value:el[7].replace('videoended:','')}; break;
							case 'assessmentdisplaybegin' : action = {command:a_tmp[0], value:''}; break;
							case 'submitassessmenttask' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case '[call' : action = { command: a_tmp[1].replace(']',''), value:''}; break;
							case 'assessmentcorrect' : action = {command:a_tmp[0], value:''}; break;
							case 'clicktocfromlist' : action = {command:a_tmp[0], value:el[7].replace('clicktocfromlist:')}; break;
							case 'clicktagfromlist' : action = {command:a_tmp[0], value:el[7].replace('clicktagfromlist:')}; break;
							case 'clickcommentfromlist' : action = {command:a_tmp[0], value:el[7].replace('clickcommentfromlist:')}; break;
							case 'clickassessmentfromlist' : action = {command:a_tmp[0], value:el[7].replace('clickassessmentfromlist:')}; break;
							case 'save' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case 'deleteannotation' : action = {command:a_tmp[0], value:a_tmp[1]}; break;
							case 'saveannotation' : x = a_tmp[1].split(' '); action = {command:a_tmp[0]+' '+x[0], value:x[1]}; break;
							default : x = el[7].split(' '); action = {command:x[1], value:Number(x[2])}; 
						} 
						// fill data modell
						cleanLog[j] = {
							utc: Number(el[0]), 
							phase: Number(phase), 
							date: el[1], 
							time: el[2], 
							video: Number(el[3]), 
							group: Number(el[5]), 
							user: Number(el[6]), 
							action: el[7], 
							action_details: action, //{command:, value:'',}, // xxx
							user_agent: el[8],
							flag: false // storage parameter for session detection
						};
					}
				////////////////////////////////////////////////////////////////////	
				}else if(req.type == 'iwrm'){
					var video = '?';
					if(el[4] != undefined){
						var re = /.webm/g;
						if(re.test(el[4])){
							var tmp = el[4].toString().split('.webm');
							video = tmp[0].split('videos/iwrm_')[0];
							video = video.replace('http://www.iwrm-education.de/','');
						}
					}
					if(video=='?' && el[4] != undefined){
						var re = /lecture:/g;
						if(re.test(el[4])){
							video = el[4].replace('lecture:','').split(' ')[0].replace('.webm','').replace('videos/iwrm_','');
						}else{	
							video = 'MAIN PAGE';
						}
					}
					location = geoip.lookup(el[3]) == null  ? false : geoip.lookup(el[3]);
					// 
					cleanLog[j] = {
						flag: false, // storage parameter for session detection
						utc: el[0], 
						phase: 0, 
						date: el[1], 
						time: el[2], 
						ip: el[3], 
						location: location, 
						video: video, 
						group: 0, 
						user: 0, 
						action: el[4], 
						user_agent: el[5]};
				}
				//
				j++;	
			}	
  	}
  	console.log('.....................');
  	console.log('Number of lines: '+data.length);
  	console.log('Distribution of the number of fields per row:'); 
  	console.log(new gauss.Collection(csv_amount_of_fields).distribution());
  	console.log('Empty values per field'); 
  	console.log(new gauss.Collection(csv_empty_fields).distribution());
		console.log('.....................');
  	//return; 
  	//console.log(cleanLog);
  	var fs = require('fs');
		fs.writeFile(__dirname+'/input/'+req.type+'.json', JSON.stringify(cleanLog,undefined,"\t"), function(err) {
		  if(err) {
		      console.log('Error: '+err);
		  } else {
		      console.log('The file was saved to '+__dirname+'/input/'+req.type+'.json');
		  }
		});
	});
};		
	
/*
Anonymize data
**/
anonymizeData = function(path, fields, method){
	var crypto = require('crypto');
	// get file
	var json = require(path);
	// iterate documents of the file
	var ii = 0;
	for(var i in json){
		// iterate fields that should be hashed 
		for(var j = 0; j < fields.length; j++){ 
			//console.log(json[i][fields[j]]);
			if(json[i][fields[j]] != undefined){
				json[i][fields[j]] = crypto.createHash('md5').update(json[i][fields[j]]).digest('hex');
				json[i]['id'] = i;
				ii++;	
			}
		}
	}
	// write output
	var fs = require('fs');
	fs.writeFile(path.replace(/\.([0-9a-z]+)(?:[\?#]|$)/i, '')+'_anonymized.json', JSON.stringify(json,undefined,"\t"), function(err) {
	  if(err) {
	      console.log('Error: '+err);
	  } else {
	      console.log('The file was saved to: '+path+'_anonymized');
	  }
	});
	return json;
};


/*
**/
getUserData = function(req){
	var dataset = [];
	fs.readFile(__dirname+'/input/'+req.filename, function read(err, data) {
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){ 
					for(var i = 1; i < data.length; i++){ 
						dataset[i] = {
							firstname:data[i][0],
							name:data[i][1],
							university:data[i][3],
							cours:data[i][4],
							priorgroup:data[i][5],
							GruppeP1:data[i][6],
							PeerGroup:data[i][7],
							GruppeP2:data[i][8],
							GruppeP3:data[i][9],
							experimental:data[i][10],
							role:data[i][12],
							user:data[i][13],
							culture:data[i][14]
						}; 
						//console.log(userData[i]);				
					}// end for
					var fs = require('fs');
					fs.writeFile(__dirname+'/input/scm2-users.json', JSON.stringify(dataset, null, "\t"), function(err) {
						if(err) {
								console.log('Error: '+err);
						} else {
								console.log('The file was saved to '+__dirname+'/input/scm2-users.json');
						}
					});
			});// end csv
		});// end fs
}

/*
**/
getVideoData = function(req){
	var dataset = [];
	fs.readFile(__dirname+'/input/'+req.filename, function read(err, data) {
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){ 
					for(var i = 1; i < data.length; i++){ // id,beschreibung,Personenzahl,hs, videos
						dataset[i] = {
							id: data[i][0], 
							author: data[i][1],
							institution: data[i][2],
							title: data[i][3],
							category: data[i][4],
							abstract: data[i][5],
							length: data[i][6],
							language: data[i][7],
							filename: data[i][8],
							source: data[i][9]
						}; 
						//console.log(userData[i]);				
					}// end for
					var fs = require('fs');
					fs.writeFile(__dirname+'/input/scm2-video-metadata.json', JSON.stringify(dataset, null, "\t"), function(err) {
						if(err) {
								console.log('Error: '+err);
						} else {
								console.log('The file was saved to '+__dirname+'/input/scm2-video-metadata.json');
						}
					});
			});// end csv
		});// end fs
}

/*
**/
getGroupData = function(req){
	var dataset = [];
	fs.readFile(__dirname+'/input/'+req.filename, function read(err, data) {
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){ 
					for(var i = 1; i < data.length; i++){ // id,beschreibung,Personenzahl,hs, videos
						dataset[i] = {
							id: data[i][0],
							description:data[i][1],
							persons: Number(data[i][2]),
							university:data[i][3],
							videos: data[i][4]}; 
						//console.log(userData[i]);				
					}// end for
					var fs = require('fs');
					fs.writeFile(__dirname+'/input/scm2-groups.json', JSON.stringify(dataset, null, "\t"), function(err) {
						if(err) {
								console.log('Error: '+err);
						} else {
								console.log('The file was saved to '+__dirname+'/input/scm2-groups.json');
						}
					});
			});// end csv
		});// end fs
}
















/***************************************************************************/
/*
Utils
**/
/*
toDo: implement a regEx that removes strings of a given array
**/
getVideoURL = function (id){
	var res = '';
	for(video in videoMetaData){
		if(videoMetaData[video].id == id){
			res = (videoMetaData[video].video).toString().replace('scm_','').replace('.webm','').replace('http://141.46.8.101/beta/scm-lab2/videos/','');
		}
	}
	return res;
}



Array.prototype.search = function(val) {
    for (var i=0; i < this.length; i++){
	    if (this[i] == val){
	    	return i;
	    }
	  }  
    return false;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//
exports.getVideoOfGroup = function (g){ 
	for(var i in groupData){ 
		if(groupData[i].id == g){
			return groupData[i].videos;
		}
	}
	return -1;
}

exports.getGroupIds = function(){
	var r=[];
	for(var i in groupData){
		if(groupData[i].id != undefined)
		r.push(groupData[i].id);
	}
	return r;
}


/*

**/
exports.getObjectOfUser = function(user_id, key){
	var res = -99;
	for(var i = 0; i < userData.length; i++){
		if(i == user_id && userData[i].hasOwnProperty(key)){
			res = userData[i][key];
		} 
	}
	return res;
}

exports.getObjectOfVideo = function (video_id, key){
	var res = -99;
	for(var i = 0; i < videoMetaDataOrg.length; i++){ 
		if(videoMetaDataOrg[i].id == video_id && videoMetaDataOrg[i].hasOwnProperty(key)){
			//console.log(videoMetaDataOrg[i].id +' '+ videoMetaDataOrg[i][key]);
			res = videoMetaDataOrg[i][key];
		} 
	}
	return res;
}





/*
toDo: a data interface or file is missing for that kind of information. xxx
**/
var dates = [];
dates['2013-12-05']= 1,
dates['2013-12-06']= 1, 
dates['2013-12-07']= 1, 
dates['2013-12-08']= 2, 
dates['2013-12-09']= 2, 
dates['2013-12-10']= 3, 
dates['2013-12-11']= 3;

function getPhaseByDate(d){ 	
	if(dates[d] != undefined){ 
		return dates[d];
	}else{
		return 4;
	}	
}

/*
For a given time stamp it returns the script phase with that time event occured. 
Since the timestamps of the script phases are sorted we can compare them against the given stamp.
**/
function getPhaseByUTC(stamp){
	for (var i = 0; i < phases.length; i++){
		if( stamp < phases[i]){
			return i+1;
		} 
	}
	return phases.length;
}

/***/
function test(res){
	var 
		svg_pic = require('./viz/test').getViz(),
		desc = 'nix', 
		title = 'hello';
	res.render('viz/graph', { title: title, desc: desc, svg: svg_pic});
};



			
write2file = function(filename, dataset){
	if(!filename || ! dataset){
		console.log('No data or file to write'); return;
	}
	fs.writeFile(__dirname+'/results/data/'+filename, dataset, function(err){
	 if(err) {
	      console.log(err);
	  } else {
	  	 console.log('Data generated: '+filename);
		}	
	});
}			
			
			
/***/
function plot(res, title){
	//$('#data').append('<br><br>').append(title);
	console.log(title);
	for(var t in res){ 
			//$('#data').append('<br>').append(t+': '+res[t]);
			console.log(t+': '+res[t]);
	}
};
















/***************************************************************************/
/*
Data strcutures
**/

exports.resultSet = function(arr){
	return {
		n : Object.size(arr),
		mean :  new gauss.Vector(arr).mean(),
		median  : new gauss.Vector(arr).median(),
		stdev : new gauss.Vector(arr).stdev(),
		min : new gauss.Vector(arr).min(),
		max : new gauss.Vector(arr).max(),
		sum : new gauss.Vector(arr).sum(),
		range:  new gauss.Vector(arr).range(),
		quartile: arr.length > 4 ? new gauss.Vector(arr).quantile(4) : -1,
		percentile : new gauss.Vector(arr).percentile(.68),
		varCoeff : (new gauss.Vector(arr).stdev() / new gauss.Vector(arr).mean()), //Coefficient of variation
		density : new gauss.Vector(arr).density(.25)
	};
}	

/*
Konverts object into an associative array
**/
exports.obj2arr = function(obj){ 
	return Object.keys(obj).map(function (key) {
	  return obj[key];
	});
}


exports.uniqArray = function(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
















/***************************************************************************/
/*
Modules
**/


/*
PHASE ACTIVITY DATA SET
**/
function phaseActivity(res){
	var file = 'scatter_group_phase_activity.tsv';
	var arr = []; arr[0]=[];arr[1]=[];arr[2]=[];arr[3]=[],arr[4]=[];
	
	for(var i = 0; i < cleanlog.length; i++){	
		try{
			cleanlog[i].group = userData[cleanlog[i].user]['GruppeP1'];
			if(arr[cleanlog[i].phase][cleanlog[i].group] == undefined){ 
				arr[cleanlog[i].phase][cleanlog[i].group] = 0;
			} 
			arr[cleanlog[i].phase][cleanlog[i].group]++;
		} catch(e){
			console.log(e);
			//console.log(JSON.stringify(cleanlog[i],null,4));
		}
			
	}
	
	// prepare tsv
	var dataset = "activity\tphase\tgroup\n";
	for(var phase in arr){
		for(var group in arr[phase]){
		//console.log('xx: '+arr[phase][group]+"__"+phase+"__"+group+"\n");
			dataset += arr[phase][group]+"\t"+phase+"\t"+group+"\n";
		}	
	}
	console.log(dataset);
	
	// write it
	fs.writeFile(__dirname+'/../public/vi-lab/analysis/data/'+file, dataset, function(err){
	 if(err) {
	      console.log(err);
	  } else {
	  	 console.log('Date generated: '+file);
		}	
	});
}






/*
ANNOTATIONS DATA SET
**/
function annotations(userData, videoMetaData){
	var res = {}; res['e']={}; res['k']={}; //res['video']={};
	res['e']['sumtoc'] = 0, res['e']['sumtags'] = 0,res['e']['sumassessment'] = 0, res['e']['sumcomments'] = 0;
	res['k']['sumtoc'] = 0, res['k']['sumtags'] = 0,res['k']['sumassessment'] = 0, res['k']['sumcomments'] = 0;
	
	for(var video in videoMetaData){
		video = videoMetaData[video];
		if(video.id < 201 ){ // exclude videos of test users and control group
			res['e']['sumtoc'] += video.toc.length;
			res['e']['sumtags'] += video.tags.length;
			res['e']['sumassessment'] += video.assessment.length;
			res['e']['sumcomments'] += video.comments.length;
			res['video']
		}else if(video.id > 200 && video.id < 401 ){ // exclude videos of test users and experimental group
			res['k']['sumtoc'] += video.toc.length;
			res['k']['sumtags'] += video.tags.length;
			res['k']['sumassessment'] += video.assessment.length;
			res['k']['sumcomments'] += video.comments.length;
		}
	}
	var dataset = "Gruppe\tVideo\tTags\tKapitelmarken\tKommentare\tFragen\n"
	var sum_anno = {e:0, k:0};
	for(var t in res){
		var groupp = t=='e' ? 'Experimentalgruppe' : 'Kontrollgruppe'; 
		dataset += groupp+"\t_\t"+res[t].sumtags+'\t'+res[t].sumtoc+'\t'+res[t].sumcomments+'\t'+res[t].sumassessment+'\n';
		sum_anno[t] = res[t].sumtags+res[t].sumtoc+res[t].sumcomments+res[t].sumassessment;
	}
	console.log('Annotations per experimental and control group:')
	console.log(dataset);
	console.log('');
	// write output
	write2file('bar_group_annotations.tsv', dataset);

	// Annotations per video length
	console.log('Annotations per length of all videos per group:')
	var exp_videos = "6;104;8;102;11;5;110;107;9;12;2;4;10;1;3;7";
	var con_videos = "201;202;203;204;205;206;207;208;209;210;211;212;301;302;303;304;305;306;307;308;309;310;311;312"; // 301;302;303;304;305;306;307;308;309;310;311;312
	
	var exp_total = getLength(exp_videos.split(';'));
	var con_total = getLength(con_videos.split(';'));
	console.log(exp_total.toFixed(2) + ' '+sum_anno.e+' '+ sum_anno.e / exp_total);
	console.log(con_total.toFixed(2) + ' '+sum_anno.k+' '+ sum_anno.k / con_total);
	
}


var getLength = function(arr){
		var length = 0.0;
		var core = require('./core');	
		for(var vi in arr){
			var v = core.getObjectOfVideo(arr[vi], 'length');
			length += toMin(v);
		}
		return length / 60 / 60; // in hours
	};
	
var toMin = function(s){
	var s = String(s).split(':'); 
	if( s[0] != -99 && s[0] != NaN){
		return Number(s[0])*60 + Number(s[1]);// + Number(s[0])/60; // in minutes
	} return 0;
}	


/*
CORDTRA DATA SET
**/
function cordtra(){
	
	var 	datasetPerGroup = "time\tgroup\taction\n",
				datasetPerVideo = "time\tgroup\taction\n",
				datasetPerVideoSource = "time\tgroup\taction\n"
				;
	for(var i = 0; i < cleanlog.length; i++){
		try{
			//console.log(cleanlog[i].user)
			if(userData[cleanlog[i].user]['GruppeP1'] == undefined)
				console.log(cleanlog[i].user)
			cleanlog[i].group = userData[cleanlog[i].user]['GruppeP1'];
			//console.log(cleanlog[i].group);
			
			if(cleanlog[i].utc <= 1386919016738 && cleanlog[i]['group'] != undefined && cleanlog[i]['utc'] != undefined && cleanlog[i]['action'] != undefined){
				//console.log(2222+cleanlog[i]['group']+cleanlog[i]['utc']);
				cleanlog[i].group = cleanlog[i].group.replace(' ','');
				if(cleanlog[i].group.toString().length == 1){ cleanlog[i].group = '00'+cleanlog[i].group; }
  			if(cleanlog[i].group.toString().length == 2 && cleanlog[i].group != 'k1' && cleanlog[i].group != 'k2' && cleanlog[i].group != 'e1' && cleanlog[i].group != 'e2'){ cleanlog[i].group = '0'+cleanlog[i].group; }
				
				datasetPerGroup += cleanlog[i].utc+'\t'+cleanlog[i].group+'\t'+cleanlog[i].cleanlog[i].action_details.command+'\n'; // .split(':')[0]
				datasetPerVideo += cleanlog[i].utc+'\t'+cleanlog[i].video+'\t'+cleanlog[i].cleanlog[i].action_details.command+'\n';
				datasetPerVideoSource += cleanlog[i].utc+'\t' + getVideoURL(cleanlog[i].video) + '\t'+cleanlog[i].cleanlog[i].action_details.command+'\n';
		}
		} catch(e){
			console.log(e+' Error '+cleanlog[i] + '_' +i);
		}	
	}
	// write output
	write2file('cordtra-group-time-tool.tsv', datasetPerGroup);
	write2file('cordtra-video-time-tool.tsv', datasetPerVideo);
	write2file('cordtra-video-source-time-tool.tsv', datasetPerVideoSource);
	
			/*var 
				svg_pic = require('./viz/cordtra-group-time-tool').getViz(undefined, './data/cordtra-group-time-tool.csv'),
				desc = 'nix', 
				title = 'CORDTRA-Diagram';
			res.render('viz/graph', { title: title, desc: desc, svg: svg_pic});
			*/
};




	


/*
Page calls (IWRM)
counts the number of logs related to a video. These ar no independent visits.
**/ 
function activityPerVideo(categoryOfVideo, categoryOfVideoName){
	var requestedPages = [];
	for(var i = 0; i < cleanlog.length; i++){ 
		try{
			if(cleanlog[i].video != undefined){ 
				if(isNaN(requestedPages[cleanlog[i].video+''])){
					requestedPages[cleanlog[i].video] = 1;
				}else{
					requestedPages[cleanlog[i].video]++;
				}
			}
		}catch(e){
			console.log('err'+e)
		}	
	}
	// sorting
	var t = [];
	for (var key in requestedPages){
		if(key.length>0)
		t.push({video:key, activities:requestedPages[key]});
	}
	t.sort(function (a, b) {
    if (a.activities > b.activities)
      return -1;
    if (a.activities < b.activities)
      return 1;
    return 0;
	});
	// output
	var dataset = "video\tactivities\tcategory\n";
	for (var i = 0; i < t.length; i++){ console.log(t[i].activities)
		if(t[i].activities > 0)
			dataset += t[i].video +'\t'+ t[i].activities +'\t'+categoryOfVideo[t[i].video]+'\n';
	}
	// write output
	write2file('activities-per-video.tsv', dataset);
}



/** 
* Identify independed user sessions in order to determin learning paths 
*/ 
function getSessions(){
	var tmp_session = '';
	var session_arr = [];
	// split dataset by day
	for(var i = 0; i < cleanlog.length; i++){  
		try{
			if(cleanlog[i].flag == false){
				tmp_session = cleanlog[i].user_agent+','+cleanlog[i].ip
				tmp_t = Number(cleanlog[i].utc);
				session_arr['session-'+i] = [];
				//console.log(tmp_session); 
				session_arr['session-'+i].push(cleanlog[i]);
				cleanlog[i].flag = true;
				for(var j = i; j < cleanlog.length; j++){  //if((Number(cleanlog[j].utc) - tmp_t) < 50000) console.log('kleiner')
						if(tmp_session == cleanlog[j].user_agent+','+cleanlog[j].ip && (Number(cleanlog[j].utc) - tmp_t) < 10800000  && cleanlog[j].flag == false){
							session_arr['session-'+i].push(cleanlog[j]);
//							console.log('session-'+i);
							cleanlog[j].flag = true;
						}	
						if((cleanlog[j].utc - tmp_t) > 14400000){
							break;
						}	 	
				}
			}
		}catch(e){
			console.log('err @ getSessions: '+e)
		}	
	}
	return session_arr;
	
	/*return; 	
		sum = 0;
		arr = [];
		// list logs per date
		var dataset = "date\tclicks\tvisitors\n";
		for(var date in visits_per_day){ 
			visitors = max( array( sizeof(array_unique(split(",",date["ips"]))), sizeof(array_unique(split(",",$date["ua"]))) ));
			the_date = (int) str_replace("-","",$date["date"]); 
			if(the_date > 20120900){ 
				array_push($arr, array("date" => $the_date, "clicks" => $date["count"], "visitors" => $visitors)); 
			}		
			$sum = $sum + $visitors;
		}
		$this->util->write2file("visitors.json", json_encode($arr));
		*/	
}		



/*
Assoziates categories with their videos
**/	
function getVideoCategories(json){
	var arr = [];
	// simple hash function that results in small and almost unique integers
	var loseCodeHash = function(str){ 
		if(str == undefined) 
			return;
    var hash = 0;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash += char;
    }
    return hash % 10;
	}
	// get categories
	for(var video in json.stream){
		if(json.stream[video].metadata != undefined){
			arr[json.stream[video].id] = loseCodeHash( json.stream[video].metadata[0].category ); 
			//console.log('-'+json.stream[video].id+'- '+ json.stream[video].metadata[0].category);
		}else{
			//console.log(json.stream[video].metadata);
		}
	}
	return arr;
}


/*
Assoziates categories with their videos
**/	
function getVideoCategoryName(json){
	var arr = [];
	// get categories
	for(var video in json.stream){
		if(json.stream[video].metadata != undefined){
		arr[json.stream[video].id] = json.stream[video].metadata[0].category; 
		//console.log('-'+json.stream[video].id+'- '+loseCode(json.stream[video].metadata[0].category));
		
		}
	}
	return arr;
}			

/*
The distribution of the number of activities that occurred during a single user session. The data shows how active users have been during their learning session.
**/
function sessionActivityDistribution(session_arr){
// distribution of activities
	activity_dist = [];
	for(var key in session_arr){ 
		if(isNaN(activity_dist[session_arr[key].length])){
			activity_dist[session_arr[key].length] = 1;
		}else{
			activity_dist[session_arr[key].length]++;
		}
	}
	var activity_dist_data = 'activities\tamount\n';
	for(var key in activity_dist){
		if(key > 1)
			activity_dist_data += key +'\t'+ activity_dist[key] +'\n';
	}
	// write output
	write2file('session-activity-distribution.tsv', activity_dist_data);
}


/*
sessions per Country
**/
function sessionsPerCountry(session_arr){ 
// distribution of activities
	var	countries = [],
			no_country = 0;
	
	for(var key in session_arr){
		//console.log(session_arr[key])
		if(session_arr[key].location === false){
			//console.log('no entry'); 
			no_country++;
		}else{ 
			if(session_arr[key][0] != undefined){  
			if(session_arr[key][0].location.country in countries == false){
				countries[session_arr[key][0].location.country] = 1;
			}else{
				countries[session_arr[key][0].location.country]++;
			}}
		}	
		
	}
	console.log('No country found for '+no_country+' sessions');
	// sorting
	var t = [];
	for (var key in countries){
		if(key.length>0)
		t.push({country:key, sessions:countries[key]});
	}
	t.sort(function (a, b) {
    if (a.sessions > b.sessions)
      return -1;
    if (a.sessions < b.sessions)
      return 1;
    return 0;
	});
	var dataset = 'country\tsessions\n';
	for(var key in t){
			dataset += t[key].country +'\t'+ t[key].sessions +'\n';
	}
	// write output
	write2file('sessions-per-country.tsv', dataset);
}


/*
(IWRM) CORDTRA DATA SET
**/
function simpleCordtra(){
	var 	dataset = "time\tvideo\taction\n",
				action = 'seek';
				tl = 0,
				x=0,
				lc = 0;	
	
	for(var i = 0; i < cleanlog.length; i++){
		try{
			if(cleanlog[i].video.length > 0){
				var str = cleanlog[i].action;
				
				var re = /timeline\_link\_seek:/g;
        if(re.test( str )){ action = 'timeline-link'; lc++;};

				var re = /(link\_click)\:/g;
        if(str.search(/(timeline\_link:)/g)) { action = 'link'; tl++;};

        var re = /^category:/g;
        if(re.test( str )){ action = 'category'; };
    	
        var re = /^tag:/g;
        if(re.test( str )){ action = 'tag'; };
    		
    		var re = /^lecture:/g;
        if(re.test( str )){ action = 'lecture'; };
        
        var re = /seek\_start:\_/g;
        if(re.test( str )){ action = 'seek'; };
        
        var re = /seek\_end:\_/g;
        if(re.test( str )){ action = 'seek'; };
        
        //if(cleanlog[i].video != 'MAIN PAGE')
				dataset += cleanlog[i].utc+'\t'+cleanlog[i].video+'\t'+action+'\n';
			}	
		} catch(e){
			console.log(cleanlog[i] + '_' +i);
		}	
	} console.log(tl+'__'+lc+'__'+x);
	// write output
	write2file('cordtra-video-time.tsv', dataset);
};



var node_list = [];

/*
Determine Learning Paths
**/	
function frequentPaths(session_arr, minPathLength){ 
	var	session = {},
			path = '',
			paths = [],
			paths_as_tsv = '',
			j = 0;
			// node_list = [], // global
		;
			
	for(var i in session_arr){	 
		session = session_arr[i];
		path = '';
		if(session.length > 1){
		 	for(var key = 0; key < session.length; key++){
				if(session[key].video != 'MAIN PAGE'){
					if(session[key].video.length > 3){
						path += session[key].video +',';
						node_list[session[key].video] = 1;	
					}else{
						//path += 'nav,';
						//path += session[key].action +',';
					}
				}
			}
			if(path.split(',').length > minPathLength){
				//console.log(path);
				paths.push(path.replace('MAIN PAGE,','').split(','));
				paths_as_tsv += j+' '+path.replace('MAIN PAGE,','').replace(/,/g, '-') +'\n';
				j++;

			}		
		}	
	}
	
	console.log(paths_as_tsv);
	write2file('iwrm-paths.tsv',paths_as_tsv);
	return paths;	
}



/*
output as network graph for gehphi
todo: pre calculate path weight
**/
function frequentPathsNetwork(paths, categoryOfVideo, categoryOfVideoName){ 		
	var i = 1, 
			k = 1,
			arr = [],
			nodes = 'Id,Label,Category,CategoryName\n',
			edge_list = [],
			edges = 'Source,Target,Type,Id,Label,Weight\n'
			;
	// node_list = [], // global
	// nodes
	for(var key in node_list){
		nodes += k+','+key+','+categoryOfVideo[key]+','+categoryOfVideoName[key]+'\n';
		node_list[key] = k; 
		k++;
	}
	write2file('gephi-session-paths-nodes.csv',nodes);
	// edges
	for(var l = 0; l < paths.length; l++){
		for(var ll = 0; ll < paths[l].length; ll++){
			var from = node_list[paths[l][ll]];
			var to = node_list[paths[l][ll+1]];
			if(to != undefined && to != from){
				arr[from+','+to] = arr[from+','+to] || 0;
				arr[from+','+to]++;			
			}	
		}
	}	
	for(var fromto in arr){	
				edges += fromto+',Undirected,'+i+',,'+arr[fromto]+'.0\n';
	}
	write2file('gephi-session-paths-edges.csv',edges);
}	
	
	

/*
output as integer-valued matrix
todo: code category, sort by category
**/	
function frequentPathsMatrix(paths, categoryOfVideo){ 	
	var heatmap = 'row_idx\tcol_idx\tfrom\tto\tfrom_cat\tto_cat\tdegree\n',
			heatmap_cat = 'from_cat\tto_cat\tdegree\n',
			key = '',
			key_cat = '',
			arr = [],
			arr_cat = [],
			from = '',
			to = '',
			k = 1;
			from_cat = '',
			to_cat = '',
			sorting = [],
			sort_by_name = '',
			sort_by_category = []
			;
	// numerate nodes		
	for(var key in node_list){
		node_list[key] = k;
		sort_by_name += key+',';
		sort_by_category[categoryOfVideo[key]] = sort_by_category[categoryOfVideo[key]] || [];
		sort_by_category[categoryOfVideo[key]].push(key); 
		k++;
	} 
	for(var l = 0; l < paths.length; l++){
		for(var ll = 0; ll < paths[l].length; ll++){
			from = node_list[paths[l][ll]];
			to = node_list[paths[l][ll+1]];
			if(to != undefined && to != from){ 
				from_cat = categoryOfVideo[paths[l][ll]]; 
				to_cat = categoryOfVideo[paths[l][ll+1]];
				key = from+'\t'+to+'\t'+paths[l][ll]+'\t'+paths[l][ll+1]+'\t'+from_cat+'\t'+to_cat;
				key_cat = from_cat+'\t'+to_cat;
				if(arr[key] == undefined){
					arr[key] = 1; 
				}else{
					arr[key]++;
				}
				if(arr_cat[key_cat] == undefined){
					arr_cat[key_cat] = 1; 
				}else{
					arr_cat[key_cat]++;
				}
			}	
		}
	}
	var sortt = '', sortt2='';
	for(var cat in sort_by_category){
		sort_by_category[cat].sort();
		//console.log(sort_by_category[cat]);
		sortt += sort_by_category[cat].join(',')+',';
	}
	for(var i in sortt.split(',')){
		sortt2 += node_list[sortt.split(',')[i]] +','; //console.log(sortt.split(',')[i] +'__'+node_list[sortt.split(',')[i]])
	}
	console.log(sortt2)
	for(var key in arr){ 
		heatmap += key+'\t'+arr[key]+'\n';
	}
	write2file('heatmap-matrix-paths.tsv', heatmap);
	//
	for(var key in arr_cat){ 
		heatmap_cat += key+'\t'+arr_cat[key]+'\n';
	}	
	write2file('heatmap-matrix-cat-paths.tsv', heatmap_cat);
}


	
/*
Path-time-diagram
format: [{"t":5000, "name":3}, {"t":5000, "name":2}, {"t":0, "name":2}, {"t":0, "name":1}]
**/	
function pathTime(session_arr, minPathLength){
	var	dataset = [],
			session = [],
			path = [],
			t0 = 0
			; 	
	for(var i in session_arr){	 
		session = session_arr[i];
		path = [];
		if(session.length > 1 && session != undefined){
			t0 = session[0].utc;
		 	for(var i = 0; i < session.length-1; i++){
				if(session[i].video != 'MAIN PAGE'){
					if(session[i].video.length > 3){
						path.push({t: session[i+1].utc - session[i].utc, name: session[i].video})
					}
				}else{
					t0 = session[i].utc;
				}
			}
			if(path.length > 3){
				dataset.push(path);
			}
		}
	}
	// normalize length of paths
	dataset.sort(function(a, b){
  	return (b[b.length-1].t - b[0].t) - (a[a.length-1].t - a[0].t); // ASC -> a - b; DESC -> b - a
	});
	for(var d in dataset){
		for(var i = 0; i < 100 - dataset[d].length; i++){
			//dataset[d].push({t: 0, name: ''});
		}
	}
	// write output
	write2file('path-time.json', JSON.stringify(dataset,null,4));				
	// output segment-time-diagramm
	// frequent path mining / analysis: \cite{LopezCueva2012}   \cite{Ou2008}
}	
	


/*
Path-time-diagram
format: [{"t":5000, "name":3}, {"t":5000, "name":2}, {"t":0, "name":2}, {"t":0, "name":1}]
**/	
function segmentTime(session_arr, minPathLength){
	var	dataset = [],
			session = [],
			path = [],
			t0 = 0
			; 	
	for(var i in session_arr){	 
		session = session_arr[i];
		path = [];
		if(session.length > 1 && session != undefined){
			t0 = session[0].utc;
		 	for(var i = 0; i < session.length-1; i++){
				if(session[i].video != 'MAIN PAGE'){
					if(session[i].video.length > 3){
						path.push({t: session[i+1].utc - session[i].utc, name: session[i].video})
					}
				}else{
					t0 = session[i].utc;
				}
			}
			if(path.length > 3){
				dataset.push(path);
			}
		}
	}
	// normalize length of paths
	dataset.sort(function(a, b){
  	return (b[b.length-1].t - b[0].t) - (a[a.length-1].t - a[0].t); // ASC -> a - b; DESC -> b - a
	});
	for(var d in dataset){
		for(var i = 0; i < 100-dataset[d].length; i++){
			dataset[d].push({t: 0, name: ''});
		}
	}
	// write output
	write2file('segment-time.json', JSON.stringify(dataset,null,4));				
	// output segment-time-diagramm
	// frequent path mining / analysis: \cite{LopezCueva2012}   \cite{Ou2008}
}	
			
			
