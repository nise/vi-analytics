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
file:///home/abb/Documents/www2/scm2-node/public/vi-lab/analysis/cordtra-video-time.html
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
				if(req.type == 'scm2'){
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
							flag: false
						};
					}
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
						flag: false, 
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
  	return; 
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
exports.init = function(req, result){

// PREPARE DATA	
	//convertLog({filename:'scm2.csv', type:'scm2'}); 
	//getUserData({filename:'scm2_user.csv'});
	//getGroupData({filename:'scm2_groups.csv'});
	//return;
	//convertLog({filename:'iwrm-clean.csv', type:'iwrm'}); return;

// INPUT DATA SCM
	cleanlog = require('./input/scm2.json');
	videoMetaData = require('./input/scm2_videos.json');
	userData = require('./input/scm2-users.json');
	groupData = require('./input/scm2-groups.json');


// PRE CALC
	var sessions = getSessions();
	var paths = frequentPaths(sessions, 3);
	
	
// VISUALIZATION		
//phaseActivity(userData);

pathTime(sessions, 3);	

// done:
effektiveInteractions();
// cordtra();
//annotations(userData, videoMetaData);		
	

return;
// INPUT DATA IWRM
	cleanlog = require('./iwrm.json');
	videoMetadata = require('./iwrm-data-video.json')

// PRE CALC
	var sessions = getSessions();
	var categoryOfVideo = getVideoCategories(videoMetadata);
	var categoryNameOfVideo = getVideoCategoryName(videoMetadata);
	var paths = frequentPaths(sessions, 3);

// VISUALIZATION
//	sessionActivityDistribution(sessions);
//	sessionsPerCountry(sessions)
//	simpleCordtra();		
	frequentPathsMatrix(paths, categoryOfVideo, node_list);

//pathTime(sessions, 3);	


// done:
//  frequentPathsNetwork(paths, categoryOfVideo, categoryNameOfVideo);
//	activityPerVideo(categoryOfVideo, categoryNameOfVideo);	
	
};	

/*
**/
getUserData = function(req){
	var dataset = [];
	fs.readFile(__dirname+'/input/'+req.filename, function read(err, data) {
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){ 
					for(var i = 1; i < data.length; i++){ 
						dataset[i] = {firstname:data[i][0],name:data[i][1],university:data[i][3],cours:data[i][4],priorgroup:data[i][5],GruppeP1:data[i][6],PeerGroup:data[i][7],GruppeP2:data[i][8],GruppeP3:data[i][9],experimental:data[i][10],role:data[i][12],user:data[i][13]}; 
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

/***/
function test(res){
	var 
		svg_pic = require('./viz/test').getViz(),
		desc = 'nix', 
		title = 'hello';
	res.render('viz/graph', { title: title, desc: desc, svg: svg_pic});
};






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
	for(var t in res){
		var groupp = t=='e' ? 'Experimentalgruppe' : 'Kontrollgruppe'; 
		dataset += groupp+"\t_\t"+res[t].sumtags+'\t'+res[t].sumtoc+'\t'+res[t].sumcomments+'\t'+res[t].sumassessment+'\n';	
	}
	
	// write output
	write2file('bar_group_annotations.tsv', dataset);
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




	

/*========= GROUP COLLABORATION ========================================*/
/*
@description Calculates variables of Calvani et al. (2010) model of effectiv interaction in group collaboration
* #1: Grad der Partizipation %Extent of participation amonut of active participation of group members (video reception, contributions)
* #2: Proposing attitude: amount of proposing contributions/annotations (toc, tags, comments, assessment)
* #3: Gleichmäßige Partizipation %Equal participation: relation between  
* #4: Ausmaß der Rollenausübung (je Phase) %Extent of roles/phases: variety of roles / participation in each phase of the script
* #6: Gegenseitige Wahrnehmung%Reciprocal reception: amount of perception of contents that belong to the other groups incl. answering their questions 
* #7: Rhythmus: Anzahl der Tage, an denen min. ein Mitglied der Gruppe aktiv war
* #8: Tiefe: Anzahl an Annotation von Videos anderer Gruppen. 
* #9 	(not implemented) ?Reactivity to proposals: 
* #10 (not implemented) ?Conclusiveness: zu einem ende kommen
* 
* @param
* @returns {file} interactions.tsv 
* @return interactions_per_video.tsv
*/


function effektiveInteractions(){
	// data preparation
	var
		actions = [],
		actions_per_user = [],
		actions_per_group = [],
		actions_per_day = [],
		annotations_per_user = [],
		cordtra = [],
		intra_group_comparison = [],
		group_user_clicks = [],
		group_user_annotations = [],
		group_user_clicks_elsewhere = [],
		group_user_contributions_elsewhere = [],
		perception_per_user = [],
		// xxx this needs to be make flexible
		action_filter = [0,'save','deleteannotation','saveannotation','loadvideo','videoplayed','videopaused','videoended','assessmentdisplaybegin','submitassessmenttask','[call','assessmentcorrect','clicktocfromlist','clicktagfromlist','clickcommentfromlist','clickassessmentfromlist','seek_start','seek_end'],
		user_annotations = []	
		;
				
	var matrix = new gauss.Collection(cleanlog);
	// xxx reduce to pahse x	
	//analyse logfile
	for(var i = 0; i < cleanlog.length; i++) {
		 if(cleanlog[i] == undefined){
		 	console.log('bad entry at index '+i); 
		 }else{
			// retrieve actions name as long that data is not pre-processed during convertion from csv to json
			if(cleanlog[i].hasOwnProperty('action_details')){
				action = cleanlog[i].action_details.command;
			} 
			  
			phase = cleanlog[i].phase;
			user = cleanlog[i].user;
			if(userData[cleanlog[i].user] != undefined){ 
				group = userData[cleanlog[i].user]['GruppeP1']; 
			}else{
				console.log('undefined group '+i)
			}	 
			// get initial video of group
			video = getVideoOfGroup(group);
			// get video in use
			video_use = cleanlog[i].video; 	
			
			// destilate value actions
			if(action_filter.search(action) > 0 ){
				// total annotations per user and group
				if (group in user_annotations == false){ user_annotations[group] = {}; }
				if (user in user_annotations[group] == false){ user_annotations[group][user] = 0; }
				user_annotations[''+group][user]++;
				//
				if (user in annotations_per_user == false){ annotations_per_user[user] = 0; }
				annotations_per_user[user]++; 
				
				// total annotation (value actions) per group and user
				if (group in group_user_annotations == false){ group_user_annotations[group] = {}; }
				if (user in group_user_annotations[group] == false){ group_user_annotations[group][user] = 0; }
				group_user_annotations[group][user]++; 		
				
				// cordtra // tool, time, group >> value actions // xxxx need to get exact actions
				cordtra.push([ action_filter.search(action), cleanlog[i][0], group ]);
				
				// compare group members
				if (group in intra_group_comparison == false){ intra_group_comparison[group] = {}; }
				if (user in intra_group_comparison[group] == false){ intra_group_comparison[group][user] = 0; } 
				intra_group_comparison[group][user]++;
				
				// total actions per group and script phase
				if (group in actions_per_group == false){ actions_per_group[group] = {}; }
				if (phase in actions_per_group[group] == false){ actions_per_group[group][phase] = 0; }
				actions_per_group[group][phase]++;
				
				// contributions at other groups video
				if(video_use !== "" && video !== "" && video !== video_use && action_filter.search(action) < 4){
					if (group in group_user_contributions_elsewhere == false){ group_user_contributions_elsewhere[group] = {}; }
					if (user in group_user_contributions_elsewhere[group] == false){ group_user_contributions_elsewhere[group][user] = 0; }
					group_user_contributions_elsewhere[group][user]++; 
				}
			}
		
			// total actions per group, user and day
			if (group in actions_per_day == false){ actions_per_day[group] = {}; }
			if (cleanlog[i].date in actions_per_day[group] == false){ actions_per_day[group][String(cleanlog[i].time).split(':')[0]] = 1; }
//			actions_per_day[group][cleanlog[i].time] = 1; 
			
			// total actions per user and script phase
			if (user in actions_per_user == false){ actions_per_user[user] = {}; }
			if (phase in actions_per_user[user] == false){ actions_per_user[user][phase] = 0; }
			actions_per_user[user][phase]++;
			
			// total actions
			if (phase in actions == false){ actions[phase] = 0; }
			actions[phase]++;
			
			// total actions per group and user
			if (group in group_user_clicks == false){ group_user_clicks[group] = {}; }
			if(user in group_user_clicks[group] == false){ group_user_clicks[group][user] = 0; }
			group_user_clicks[group][user]++; 
			
			// total actions in other videos
			if(video_use !== "" && video !== "" && video !== video_use){
				if (group in group_user_clicks_elsewhere == false){ group_user_clicks_elsewhere[group] = {}; }
				if (user in group_user_clicks_elsewhere[group] == false){ group_user_clicks_elsewhere[group][user] = 0; }
				group_user_clicks_elsewhere[group][user]++; 
			}
			// Perception
			if (user in perception_per_user == false){ perception_per_user[user] = ''; }
			perception_per_user[user] += cleanlog[i][0]+',';		
		
		}	
		}
	// effective group interactions
	var 
		out = '',
		groups = getGroupIds();	
		perVideoInteractions = []
			; 
	// filter some groups
	var tt = new gauss.Collection(groupData);
  // get experimental group only, constellation of the first phase
  groups = tt.find(function(e) { return e.persons < 4 }).map(function(thing) { return thing.id; }).toVector();  	
	// get control groups only
	groups = tt.find(function(e) { return e.persons === 18 }).map(function(thing) { return thing.id; }).toVector();  	
	// get control and experimental group
	groups = tt.find(function(e) { return e.persons === 18 || e.persons < 4 }).map(function(thing) { return thing.id; }).toVector();  	
	
	//	
	for(var i in groups){ 
		if(groups.hasOwnProperty(i)){
			var
				group = groups[i],
				group_size = tt.find(function(e) { return e.persons === 18 || e.persons < 4 }).map(function(thing) { return thing.persons; }).toVector()[i];
				participation = 0,
				annotations = 0,
				foreign_clicks = 0,
				foreign_contributions = 0,
				rhythm = 0,
				equal = [],
				role_fullfillment = [],
				clicks_elsewhere = [],
				contributions_elsewhere = [],
				tmp = []
				;
			if(group != undefined && typeof group == 'string'){		
			for(var user in group_user_clicks[group] ){
				participation += group_user_clicks[group][user]; 
				equal.push( group_user_clicks[group][user] ); //echo "user\n";
			
				for(var phase in actions_per_user[user]){
					tmp.push( actions_per_user[user][phase] );  // actions je user je phase
				}
				role_fullfillment.push( (new gauss.Vector(tmp)).stdev() ); 
			}
			for(var user in group_user_annotations[group]){
				annotations += Number(group_user_annotations[group][user]); 
			}
			for(var uu  in group_user_clicks_elsewhere[group]){
				clicks_elsewhere.push( group_user_clicks_elsewhere[group][uu] );
			}
			for(var uu in group_user_contributions_elsewhere[group]){
				contributions_elsewhere.push( group_user_contributions_elsewhere[group][uu] );
			}
			//for(var actions_per_day[group] as user=>num){
				//echo "user :: num\n";
			//}
			//console.log(group+' '+Object.size(group_user_clicks[group]))
			
			participation = Object.size(group_user_clicks[group])  > 0 ? ( participation / group_size ).toFixed(2) : 0; // calculate mean participation
			
			annotation  = Object.size(group_user_clicks[group]) > 0 ? ( annotations / group_size ).toFixed(2) : 0; // oder this->util->sd(annotations) ????
	 		
	 		equal = Object.size(equal) > 0 ? new gauss.Vector(equal).stdev().toFixed(2) : 0; 
	 		
	 		role_fullfillment = Object.size(role_fullfillment) > 0 && new gauss.Vector(role_fullfillment).mean() > 0 ? ( new gauss.Vector(role_fullfillment).mean() ).toFixed(2) : 0; 
			
			foreign_clicks = Object.size(clicks_elsewhere) > 0 ? ( new gauss.Vector(clicks_elsewhere).sum() / group_size ).toFixed(2) : 0;
			
			rhythm = ( Object.size(actions_per_day[group]) / group_size ).toFixed() ; // / group_size  ??
			
			foreign_contributions = Object.size(contributions_elsewhere) > 0 ? ( new gauss.Vector(contributions_elsewhere).sum() / group_size ).toFixed(2) : 0;
			
			// per group output
			out +=  String(group) +'\t'+ participation +'\t'+ annotation +'\t'+ equal +'\t'+ (role_fullfillment)  +'\t'+ foreign_clicks +'\t'+ rhythm +'\t'+ foreign_contributions +'\n';	
			// collect data to calc mean and max
			
			// per video output 
			/*
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["video"] = this->scriptData->getVideoOfGroup2(group);
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["participation"] += participation;
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["annotation"] += annotation;
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["equal"] += equal.sd();
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["role"] += role_fulfilled;
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["foreignclicks"] += foreign_clicks;
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["rhythm"] += sizeof(actions_per_day[group]);
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["foreigncontributions"] += foreign_contributions;
			*/	
			}
		}	
	}
	// prio calculus for mean and mx
	var rows = out.split('\n');
	var x = [];
	for(var i=0; i < rows.length; i++){
		var row = String(rows[i]).split('\t');
		for(var j = 1; j < row.length; j++){
			if(j in x == false ){ x[j] = [];}
			x[j][i] = Number(row[j]);
		}
	} 
	s = "group\tparticipation\tannotations\tequal\trole\tforeign\trhythm\tforeigncontributions\n"
	s += 'max'+'\t'+ new gauss.Vector(x[1]).max() +'\t'+ new gauss.Vector(x[2]).max() +'\t'+ new gauss.Vector(x[3]).max() +'\t'+ new gauss.Vector(x[4]).max() +'\t'+ new gauss.Vector(x[5]).max() +'\t'+ new gauss.Vector(x[6]).max() +'\t'+ new gauss.Vector(x[7]).max() +'\n';	
	s += 'mean'+'\t'+ new gauss.Vector(x[1]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[2]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[3]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[4]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[5]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[6]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[7]).mean().toFixed(2) +'\n';	
//	s += 'median'+'\t'+ new gauss.Vector(x[1]).median().toFixed(2) +'\t'+ new gauss.Vector(x[2]).median().toFixed(2) +'\t'+ new gauss.Vector(x[3]).median().toFixed(2) +'\t'+ new gauss.Vector(x[4]).median().toFixed(2) +'\t'+ new gauss.Vector(x[5]).median().toFixed(2) +'\t'+ new gauss.Vector(x[6]).median().toFixed(2) +'\t'+ new gauss.Vector(x[7]).median().toFixed(2) +'\n';	
	
	out = s + out;
	console.log(out)			
	// write output
	write2file('effective-group-interactions.tsv', out);
	
	// calc effectiv groups
	var mmean = out.split('\n')[2].split('\t');  console.log(mmean+'\n\n');
	var rows = out.split('\n');
	rows.shift();// remove header
	rows.shift();// remove max
	rows.shift();// remove median /arith mean
	var x = {};
	for(var i=0; i < rows.length; i++){
		var col = String(rows[i]).split('\t');
		x[col[0]] = 0;
		for(var j = 1; j < col.length; j++){
			//console.log(col[j]+'      '+Number(mmean[j]))
			if(Number(col[j]) >= Number(mmean[j])){
				x[col[0]]++;
			}
		}
	} 
console.log(x);
	
	/*
		out = "group\tparticipation\tannotations\tequal\trole\tforeign\trhythm\tforeigncontributions\n";
		for(perVideoInteractions as v){
			div = 2;
			if(v["video"] === 7 || v["video"] === 3){ 
				div = 3;
			}
			out .= v["video"]."\t".v["participation"]/div."\t".v["annotation"]/div."\t".v["equal"]/div."\t".v["role"]/div."\t".v["foreignclicks"]/div."\t".v["rhythm"]/div."\t".v["foreigncontributions"]/div."\n";
		}
	
		//echo out;
		this->util->write2file("interactions_per_video.tsv", out);	
	*/	
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
function getVideoOfGroup(g){
	for(var i in groupData){
		if(groupData[i].id == g){
			return groupData[i].videos;
		}
	}
	return -1;
}

function getGroupIds(){
	var r=[];
	for(var i in groupData){
		if(groupData[i].id != undefined)
		r.push(groupData[i].id);
	}
	return r;
}

















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
						if(tmp_session == cleanlog[j].user_agent+','+cleanlog[j].ip && (Number(cleanlog[j].utc) - tmp_t) < 14400000  && cleanlog[j].flag == false){
							session_arr['session-'+i].push(cleanlog[j]);
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
		arr[json.stream[video].id] = loseCodeHash( json.stream[video].metadata[0].category ); 
		//console.log('-'+json.stream[video].id+'- '+loseCode(json.stream[video].metadata[0].category));
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
		arr[json.stream[video].id] = json.stream[video].metadata[0].category; 
		//console.log('-'+json.stream[video].id+'- '+loseCode(json.stream[video].metadata[0].category));
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
		if(session_arr[key][0].location == false){
			//console.log('no entry'); 
			no_country++;
		}
		if(isNaN(countries[session_arr[key][0].location.country])){
			countries[session_arr[key][0].location.country] = 1;
		}else{
			countries[session_arr[key][0].location.country]++;
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
			paths = []
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
			}		
		}	
	}
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
