
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

var 
	gauss = require('gauss'),
	core = require('../core'),
	cleanlog = require('../input/scm2.json'),
	videoMetaData = require('../input/scm2_videos.json'),
	userData = require('../input/scm2-users.json'),
	groupData = require('../input/scm2-groups.json')
	;

exports.init = function(){
	// data preparation
	var
		actions_per_phase = [],
		actions_per_user = [],
		actions_per_group = [],
		actions_per_day = [],
		annotations_per_user = [],
		cordtra = [],
		intra_group_comparison = [],
		annotationtype_per_phase = [],
		group_user_clicks = [],
		group_user_annotations = [],
		group_user_clicks_elsewhere = [],
		group_user_contributions_elsewhere = [],
		perception_per_user = [],
		// xxx this needs to be more flexible # UI
		action_filter = [0,'save','deleteannotation','saveannotation','loadvideo','videoplayed','videopaused','videoended','assessmentdisplaybegin','submitassessmenttask','[call','assessmentcorrect','clicktocfromlist','clicktagfromlist','clickcommentfromlist','clickassessmentfromlist','seek_start','seek_end', 'saveannotation toc','saveannotation assessment','saveannotation toc','saveannotation toc'],
		annotation_filter = [0,'save','deleteannotation','saveannotation','submitassessmenttask', 'saveannotation toc','saveannotation assessment','saveannotation toc','saveannotation tag'],
		
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
			video = core.getVideoOfGroup(group).split(';')[0];
			// get video in use
			video_use = cleanlog[i].video; 	
			
			// destilate value actions
			if(action_filter.search(action) > 0 ){ // XXX BUG das array ist nicht sortiert ... z.b, ist das laden eines Videos kein beitrag
			
				
				if(annotation_filter.search(action) > 0){
					// total annotations per user and group
					if (group in user_annotations == false){ user_annotations[group] = {}; }
					if (user in user_annotations[group] == false){ user_annotations[group][user] = 0; }
					user_annotations[group][user]++;
					//
					if (user in annotations_per_user == false){ annotations_per_user[user] = 0; }
					annotations_per_user[user]++;
					
					// total annotation (value actions) per group and user
					if (group in group_user_annotations == false){ group_user_annotations[group] = {}; }
					if (user in group_user_annotations[group] == false){ group_user_annotations[group][user] = 0; }
					group_user_annotations[group][user]++; 
					
					// contributions at other groups video
					if(video_use != "" && video != "" && video != video_use ){
						if (group in group_user_contributions_elsewhere == false){ group_user_contributions_elsewhere[group] = {}; }
						if (user in group_user_contributions_elsewhere[group] == false){ group_user_contributions_elsewhere[group][user] = 0; }
						group_user_contributions_elsewhere[group][user]++;
					}	
				}	 
				
					
				
				// compare group members
				if (group in intra_group_comparison == false){ intra_group_comparison[group] = {}; }
				if (user in intra_group_comparison[group] == false){ intra_group_comparison[group][user] = 0; } 
				intra_group_comparison[group][user]++;
				
				// total actions per group and script phase
				if (group in actions_per_group == false){ actions_per_group[group] = {}; }
				if (phase in actions_per_group[group] == false){ actions_per_group[group][phase] = 0; }
				actions_per_group[group][phase]++;
				
				
			}
		
			// total actions per group, user and day
			if (group in actions_per_day == false){ actions_per_day[group] = {}; }
			if (cleanlog[i].date in actions_per_day[group] == false){ actions_per_day[group][String(cleanlog[i].time).split(':')[0]] = 1; }
//			actions_per_day[group][cleanlog[i].time] = 1; 
			
			// total actions per user and script phase
			if (user in actions_per_user == false){ actions_per_user[user] = {}; }
			if (phase in actions_per_user[user] == false){ actions_per_user[user][phase] = 0; }
			actions_per_user[user][phase]++;
			
			// total actions per phase
			if (phase in actions_per_phase == false){ actions_per_phase[phase] = 0; }
			actions_per_phase[phase]++;
			
			// contributions per group phase
			if (phase in annotationtype_per_phase == false){ annotationtype_per_phase[phase] = {}; }
			if (action in annotationtype_per_phase[phase] == false){ annotationtype_per_phase[phase][action] = 0; }
			annotationtype_per_phase[phase][action]++;
			
			// total actions per group and user
			if (group in group_user_clicks == false){ group_user_clicks[group] = {}; }
			if(user in group_user_clicks[group] == false){ group_user_clicks[group][user] = 0; }
			group_user_clicks[group][user]++; 
			
			// total actions in other videos
			if(video_use != "" && video != "" && video != video_use){
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
		groups = core.getGroupIds();	
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
			
			// per video output  XXX BUGY: Die Daten müssen alle neu berechnet werden, und zwar je Video, nicht je Gruppe! Gruppen haben sich ja nachweislich nicht nur mit einem Video befasst.
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


	var atpp = 'from_cat\tto_cat\tdegree\n';
	for(var phase in annotationtype_per_phase){
		for(var action in annotationtype_per_phase[phase]){
			if(action_filter.search(action) == false){console.log(action); break;}
			atpp += action_filter.search(action) +'\t'+phase+'\t'+annotationtype_per_phase[phase][action]+'\n';
		}
	}
	write2file('heatmap-actions-per-phase.tsv', atpp);
	//console.log(atpp);
	

/*

**/
	var 
		clicks = 0,
		anno = 0,
		fclicks = 0,
		fanno = 0
		;	
//	clicks: actions_per_phase[phase]++;
	for (var p in actions_per_phase){
		if (typeof actions_per_phase[p] == 'number'){
			clicks += actions_per_phase[p];
		}
	}
// annotation: annotations_per_user[user]++; 
	for(var u in annotations_per_user){ 
		if (typeof annotations_per_user[u] == 'number')
		anno += Number(annotations_per_user[u]);
	}
//	foreign clicks: group_user_clicks_elsewhere[group][user]++; 
	for(var g in group_user_clicks_elsewhere){
		for(var u in group_user_clicks_elsewhere[g]){
			fclicks += group_user_clicks_elsewhere[g][u];
		}
	}
//	foreign annotations: group_user_contributions_elsewhere[group][user]
		for(var g in group_user_contributions_elsewhere){
			for(var u in group_user_contributions_elsewhere[g]){
				fanno += group_user_contributions_elsewhere[g][u];
			}
		}
	console.log(clicks+'  '+anno+'  '+fclicks+'  '+fanno);
	console.log(clicks+'  '+anno/clicks+'  '+fclicks/clicks+'  '+fanno/clicks);
	
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

