
var 
	core = require('./core'),
	cleanlog = require('./input/scm2.json'),
	videoMetaData = require('./input/scm2_videos.json'),
	userData = require('./input/scm2-users.json'),
	groupData = require('./input/scm2-groups.json')
	;

var analysis = new init();

exports.hello = analysis.hello;
exports.actions_per_phase = analysis.actions_per_phase;
exports.actions_per_user = analysis.actions_per_user;
exports.actions_per_group = analysis.actions_per_group;
exports.actions_per_day = analysis.actions_per_day;
exports.annotations_per_user = analysis.annotations_per_user;
exports.cordtra = analysis.cordtra;
exports.intra_group_comparison = analysis.intra_group_comparison;
exports.annotationtype_per_phase = analysis.annotationtype_per_phase;
exports.group_user_clicks = analysis.group_user_clicks;
exports.group_user_annotations = analysis.group_user_annotations;
exports.group_user_clicks_elsewhere = analysis.group_user_clicks_elsewhere;
exports.group_user_contributions_elsewhere = analysis.group_user_contributions_elsewhere;
exports.perception_per_user = analysis.perception_per_user;


/*
..
**/

//exports.init = new init();

function init(){ 
	this.hello = 'hello';
	this.actions_per_phase = [];
	this.actions_per_user = [];
	this.actions_per_group = [];
	this.actions_per_day = [];
	this.annotations_per_user = [];
	this.cordtra = [];
	this.intra_group_comparison = [];
	this.annotationtype_per_phase = [];
	this.group_user_clicks = [];
	this.group_user_annotations = [];
	this.group_user_clicks_elsewhere = [];
	this.group_user_contributions_elsewhere = [];
	this.perception_per_user = [];		
	this.user_annotations = [];	
	// xxx this needs to be more flexible # UI
	action_filter = [0,'save','deleteannotation','saveannotation','loadvideo','videoplayed','videopaused','videoended','assessmentdisplaybegin','submitassessmenttask','[call','assessmentcorrect','clicktocfromlist','clicktagfromlist','clickcommentfromlist','clickassessmentfromlist','seek_start','seek_end', 'saveannotation toc','saveannotation assessment','saveannotation toc','saveannotation toc'];
	annotation_filter = [0,'save','deleteannotation','saveannotation','submitassessmenttask', 'saveannotation toc','saveannotation assessment','saveannotation toc','saveannotation tag'];
		
	
	// xxx reduce to pahse x	
	//analyse logfile
	for(var i = 0; i < cleanlog.length; i++) {
		if(cleanlog[i] == undefined){
		 	console.log('bad entry at index '+i); 
		 }else{
		 
			// retrieve actions name as long that data is not pre-processed during convertion from csv to json
			action = cleanlog[i].hasOwnProperty('action_details') ? cleanlog[i].action_details.command : '';
			phase = cleanlog[i].phase;
			user = cleanlog[i].user;
			//core.getObjectOfUser(user, 'university') == 'N' &&
			//&& core.getObjectOfUser(user, 'experimental') == 'e'
			// core.getObjectOfUser(user, 'cours') == 'IPM12'
	//		if( core.getObjectOfUser(user, 'university') == 'Z' && core.getObjectOfUser(user, 'experimental') == 'e'){
	//		if( core.getObjectOfUser(user, 'university') == 'N' && core.getObjectOfUser(user, 'experimental') == 'e'){
	//		if( core.getObjectOfUser(user, 'experimental') == 'e'){
	//		if( core.getObjectOfUser(user, 'university') == 'Z' && core.getObjectOfUser(user, 'experimental') == 'control'){
	//		if( core.getObjectOfUser(user, 'university') == 'N' && core.getObjectOfUser(user, 'experimental') == 'control'){
	//		if( core.getObjectOfUser(user, 'experimental') == 'control'){ 
	//		if( core.getObjectOfUser(user, 'cours') == 'IPM12' && core.getObjectOfUser(user, 'experimental') == 'e'){ 
	//		if( core.getObjectOfUser(user, 'cours') == 'IM13' && core.getObjectOfUser(user, 'experimental') == 'e'){ 
	//	if( core.getObjectOfUser(user, 'cours') == 'IM13'){
	//		if( core.getObjectOfUser(user, 'university') == 'Z'){
	//		if( core.getObjectOfUser(user, 'university') == 'N'){
	//	if( core.getObjectOfUser(user, 'cours') != 'IPM12' ){
	if(true){	 		 
			
				if(userData[cleanlog[i].user] != undefined){ 
					group = userData[cleanlog[i].user]['GruppeP1']; 
				}else{
					console.log('undefined group '+i)
				}	 
				// get initial video of group
				video = core.getVideoOfGroup(group).split(';')[0];
				// get video in use
				video_use = cleanlog[i].video; 	
			
			
				// total actions per group, user and day
				if (group in this.actions_per_day == false){ this.actions_per_day[group] = {}; }
				if (cleanlog[i].date in this.actions_per_day[group] == false){ this.actions_per_day[group][String(cleanlog[i].time).split(':')[0]] = 1; }
	//			this.actions_per_day[group][cleanlog[i].time] = 1; 
			
				// total actions per user and script phase
				if (user in this.actions_per_user == false){ this.actions_per_user[user] = {}; }
				if (phase in this.actions_per_user[user] == false){ this.actions_per_user[user][phase] = 0.0; }
				this.actions_per_user[user][phase]++;
			
				// total actions per phase
				if (phase in this.actions_per_phase == false){ this.actions_per_phase[phase] = 0; }
				this.actions_per_phase[phase]++;
			
				// contributions per group phase
				if (phase in this.annotationtype_per_phase == false){ this.annotationtype_per_phase[phase] = {}; }
				if (action in this.annotationtype_per_phase[phase] == false){ this.annotationtype_per_phase[phase][action] = 0; }
				this.annotationtype_per_phase[phase][action]++;
			
				// total actions per group and user
				if (group in this.group_user_clicks == false){ this.group_user_clicks[group] = {}; }
				if(user in this.group_user_clicks[group] == false){ this.group_user_clicks[group][user] = 0; }
				this.group_user_clicks[group][user]++; 
			
				// total actions in other videos
				if(video_use != "" && video != "" && video != video_use){
					if (group in this.group_user_clicks_elsewhere == false){ this.group_user_clicks_elsewhere[group] = {}; }
					if (user in this.group_user_clicks_elsewhere[group] == false){ this.group_user_clicks_elsewhere[group][user] = 0; }
					this.group_user_clicks_elsewhere[group][user]++; 
				}
				// Perception
				if (user in this.perception_per_user == false){ this.perception_per_user[user+''] = []; }
				if(typeof cleanlog[i]['utc'] == 'function'){ console.log(''+i)}
				this.perception_per_user[user].push(cleanlog[i]['utc']);	
			
				// destilate value actions
				if(action_filter.search(action) > 0 ){
			
					// destilate user contributions be means of annotations
					if(annotation_filter.search(action) > 0){
					
						/* annotations per user and group XXX war doppelt
						if (group in user_annotations == false){ user_annotations[group] = {}; }
						if (user in user_annotations[group] == false){ user_annotations[group][user] = 0; }
						user_annotations[group][user]++;
						*/
					
						// annotations per user
						if (user in this.annotations_per_user == false){ this.annotations_per_user[user] = 0; }
						this.annotations_per_user[user]++;
					
						// annotation per group and user
						if (group in this.group_user_annotations == false){ this.group_user_annotations[group] = {}; }
						if (user in this.group_user_annotations[group] == false){ this.group_user_annotations[group][user] = 0; }
						this.group_user_annotations[group][user]++; 
					
						// contributions at other groups video => does not work for one group scenarios
						if(video_use != "" && video != "" && video != video_use ){
							if (group in this.group_user_contributions_elsewhere == false){ this.group_user_contributions_elsewhere[group] = {}; }
							if (user in this.group_user_contributions_elsewhere[group] == false){ this.group_user_contributions_elsewhere[group][user] = 0; }
							this.group_user_contributions_elsewhere[group][user]++;
						}	
					} // end annotation filter	 
				
					
				
					// compare all activities of the members of a group
					if (group in this.intra_group_comparison == false){ this.intra_group_comparison[group] = {}; }
					if (user in this.intra_group_comparison[group] == false){ this.intra_group_comparison[group][user] = 0; } 
					this.intra_group_comparison[group][user]++;
				
					// actions per group and script phase
					if (group in this.actions_per_group == false){ this.actions_per_group[group] = {}; }
					if (phase in this.actions_per_group[group] == false){ this.actions_per_group[group][phase] = 0; }
					this.actions_per_group[group][phase]++;
				
				
				}// end action filter		
			}
		}	
	} 
}	
		
