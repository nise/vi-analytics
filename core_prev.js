
/*
* Loads a raw log file and converts its fields to the internal data model by follwong the given configuration file.
*
* @todo	
*				implement anymization of clear names, e.g. for data publication 
*
**/
convertLogFromCSV = function(conf, debug){ 
	
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
  		videos = require( './input/' + project + '/' + conf.videos )
  		users = require( conf.users )
  		groups = require( './input/' + project + '/' + conf.groups )
  		;
  	// drop db
  	Log.remove({}, function(err) { console.log('Log removed from database') 
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
						var playback_time = '';
						if( ['seek_start','seek_end','saveannotation comments','saveannotation toc','change_speed','saveannotation tags','timeline_link_seek'].indexOf(action.command) !== -1 ){
							playback_time = String(action.value).trim();	
						}else if( action.command === 'loadvideo'){
							playback_time = 0;
						}else if( ['clickcommentfromlist','clicktocfromlist','clicktagfromlist'].indexOf(action.command) !== -1){
							playback_time = String(action.value).split(/\ /).slice(-1)[0]; //console.log(playback_time);
						}else if( action.command === 'videoended'){
							var len = (conf.raw_field_mapping.video_length === -1 ? video.video_length : el[ conf.raw_field_mapping.video_length ]).split(':');
							playback_time = Number(len[0])*60 + Number(len[1]);
						}else{
							//console.log( '_'+action.command+'____'+action.value+'_' );
						}
							
						// fill data modell
						cleanLog[j] = {
							utc: 							Number( el[ conf.raw_field_mapping.utc ] ), 
							phase: 						getPhase( el[ conf.raw_field_mapping.utc ] ),
							date:  						String(el[ conf.raw_field_mapping.date ]), 
							time:  						String(el[ conf.raw_field_mapping.time ]), 
						
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
							playback_time: 		Number(playback_time),
						
							user_agent:  			el[ conf.raw_field_mapping.user_agent ],
							ip: 							el[ conf.raw_field_mapping.ip ],
							flag: false // storage parameter for session detection
						};
						//console.log(cleanLog[j].video_file);
						// save to Database
						new Log( cleanLog[j] ).save( function( err, todo, count ){
							if(err){
								console.log(err)
							}
						});
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
				    //
						callHook( 'log-data-loaded' );
				}
			});// end fs out
	});		
		
	});// end read fs
} // end function










































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
















/***************************************************************************/
/*
Utils
**/










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




exports.write2file = function(filename, dataset){
	if(!filename || ! dataset){
		console.log('No data or file to write'); return;
	} 
	//fs.writeFile(__dirname+'/results/data/'+filename, dataset, function(err){
	fs.writeFile('./static/data/'+filename, dataset, function(err){
	 if(err) {
	      console.log(err);
	  } else {
	  	 console.log('Data generated: '+filename);
		}	
	});
}			
			
			

















/***************************************************************************/
/*
Data strcutures
**/

exports.resultSet = function(arr, fixed){
	if(fixed == undefined){ fixed = 10; }
	return {
		n : Object.size(arr),
		mean :  new gauss.Vector(arr).mean().toFixed(fixed),
		median  : new gauss.Vector(arr).median(),
		stdev : new gauss.Vector(arr).stdev().toFixed(fixed),
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


exports.sumArray = function(a) {
    var sum = 0;
    var len = a.length;
    for(var i = 0; i < len; i++) {
    	sum += a[i];     
    }
    return sum;
}


/* 
	*Converts decimal time format into seconds 
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



// order keys of Object
function orderKeys(obj, expected) {

  var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2) return -1;
      else if (k1 > k2) return +1;
      else return 0;
  });

  var i, after = {};
  for (i = 0; i < keys.length; i++) {
    after[keys[i]] = obj[keys[i]];
    delete obj[keys[i]];
  }

  for (i = 0; i < keys.length; i++) {
    obj[keys[i]] = after[keys[i]];
  }
  return obj;
}
