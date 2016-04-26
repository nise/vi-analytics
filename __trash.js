

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





