
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
	analysis = require('../analysis'),
	//videoMetaData = require('../input/scm2_videos.json'),
	//userData = require('../input/scm2-users.json'),
	groupData = require('../input/scm2-groups.json')
	;

exports.init = function(){
		console.log(analysis.hello);
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
			for(var user in analysis.group_user_clicks[group] ){
				participation += analysis.group_user_clicks[group][user]; 
				equal.push( analysis.group_user_clicks[group][user] ); //echo "user\n";
			
				for(var phase in analysis.actions_per_user[user]){
					tmp.push( analysis.actions_per_user[user][phase] );  // actions je user je phase
				}
				role_fullfillment.push( (new gauss.Vector(tmp)).stdev() ); 
			}
			for(var user in analysis.group_user_annotations[group]){
				annotations += Number(analysis.group_user_annotations[group][user]); 
			}
			for(var uu  in analysis.group_user_clicks_elsewhere[group]){
				clicks_elsewhere.push( analysis.group_user_clicks_elsewhere[group][uu] );
			}
			for(var uu in analysis.group_user_contributions_elsewhere[group]){
				contributions_elsewhere.push( analysis.group_user_contributions_elsewhere[group][uu] );
			}
			//for(var analysis.actions_per_day[group] as user=>num){
				//echo "user :: num\n";
			//}
			//console.log(group+' '+Object.size(analysis.group_user_clicks[group]))
			
			participation = Object.size(analysis.group_user_clicks[group])  > 0 ? ( participation / group_size ).toFixed(2) : 0; // calculate mean participation
			
			annotation  = Object.size(analysis.group_user_clicks[group]) > 0 ? ( annotations / group_size ).toFixed(2) : 0; // oder this->util->sd(annotations) ????
	 		
	 		equal = Object.size(equal) > 0 ? new gauss.Vector(equal).stdev().toFixed(2) : 0; 
	 		
	 		role_fullfillment = Object.size(role_fullfillment) > 0 && new gauss.Vector(role_fullfillment).mean() > 0 ? ( new gauss.Vector(role_fullfillment).mean() ).toFixed(2) : 0; 
			
			foreign_clicks = Object.size(clicks_elsewhere) > 0 ? ( new gauss.Vector(clicks_elsewhere).sum() / group_size ).toFixed(2) : 0;
			
			rhythm = ( Object.size(analysis.actions_per_day[group]) / group_size ).toFixed() ; // / group_size  ??
			
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
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["rhythm"] += sizeof(analysis.actions_per_day[group]);
			perVideoInteractions[this->scriptData->getVideoOfGroup2(group)]["foreigncontributions"] += foreign_contributions;
			*/	
			}
		}	
	}
	// prio calculus for mean and mx
	var rows = out.split('\n');
	var x = [];
	for(var i=0; i < rows.length-1; i++){
		var row = String(rows[i]).split('\t');
		for(var j = 1; j < row.length; j++){
			if(j in x == false ){ x[j] = [];}
			x[j][i] = Number(row[j]);
		}
	} 
	s = "group\tparticipation\tannotations\tequal\trole\tforeign\trhythm\tforeigncontributions\n"
	s += 'max'+'\t'+ new gauss.Vector(x[1]).max() +'\t'+ new gauss.Vector(x[2]).max() +'\t'+ new gauss.Vector(x[3]).max() +'\t'+ new gauss.Vector(x[4]).max() +'\t'+ new gauss.Vector(x[5]).max() +'\t'+ new gauss.Vector(x[6]).max() +'\t'+ new gauss.Vector(x[7]).max() +'\n';	
	s += 'mean'+'\t'+ new gauss.Vector(x[1]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[2]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[3]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[4]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[5]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[6]).mean().toFixed(2) +'\t'+ new gauss.Vector(x[7]).mean().toFixed(2) +'\n';	
	//s += 'median'+'\t'+ new gauss.Vector(x[1]).median().toFixed(2) +'\t'+ new gauss.Vector(x[2]).median().toFixed(2) +'\t'+ new gauss.Vector(x[3]).median().toFixed(2) +'\t'+ new gauss.Vector(x[4]).median().toFixed(2) +'\t'+ new gauss.Vector(x[5]).median().toFixed(2) +'\t'+ new gauss.Vector(x[6]).median().toFixed(2) +'\t'+ new gauss.Vector(x[7]).median().toFixed(2) +'\n';	
	
	out = s + out;
	console.log(out);
	console.log('');			
	// write output
	write2file('effective-group-interactions.tsv', out);

/*
Consider balanced workload among group members:
**/
console.log('Consider balanced workload among group members:')
console.log(core.resultSet(x[3]));
console.log('');
	
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
console.log('The more the values of the specific group expand towards the outside, the higher is the ‘effectiveness’ achieved by the considered variable. On the contrary, a grid that retracts towards the inside indicates low effectiveness. Regarding Calvani et al. (2010), all values/variables of effectiv group are equal or above the average of alle groups. If there are two or three values below the average we call it a more or less effective group. Groups who have more the three values below the average are less effective. ')	 
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

