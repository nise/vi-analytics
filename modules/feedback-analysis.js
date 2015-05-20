

exports.init = function(req, result){

/*
register with meta data


*/
	var mess = require('../input/scm2_messages.json');
	
	var types = {
		mc:0, 
		solvedbyothergroupmembers:0, 
		feedback:0, 
		fillintextanswers:0,
		mccorrect:0
	};
	for(var i in mess){
		if(mess[i] == undefined){ break; }
		
		if(mess[i].type == 'test-result'){
			// Handle multiple choice answers
			if(mess[i].content != undefined && mess[i].content.correct != undefined){
				types['mc']++;
				if(mess[i].content.correct == 'true'){
					types['mccorrect']++;
				}	
			// Handle fillin text answers	
			}else if(mess[i].content != undefined && mess[i].content.correct == undefined  ){
				console.log( mess[i].from + ': ' + mess[i].content.answ[0].answ + '\n');
				types['fillintextanswers']++; // not all answers make sense ! some are double
			}
		
			// Were the user that made the test from the same group that defined the test?
			var group = getGroupOfVideo(mess[i].content.videoid);
			if(group != undefined && group != 'x'){
				//console.log('_'+ isUserOfGroup(mess[i].from, group) );
				if( ! isUserOfGroup(mess[i].from, group)){
					types['solvedbyothergroupmembers']++;
				}
			}else{
				console.log('no group found')
			}
		// handle feedback	
		}else if(mess[i].type == 'feedback'){
			types['feedback']++;
		}	 	
	}
	console.log(types);

}


/***/
getGroupOfVideo = function(video){
 	var 
 		groupData = require('../input/scm2-groups.json')
 		group_id = undefined;
 	;
 	for(var i = 0; i < groupData.length; i++){ 
 		if(String(groupData[i].videos).split(';')[0] == video){ //console.log(video+' '+String(groupData[i].videos).split(';')[0])
 			group_id = groupData[i].id; 
 			break;
 		}else if(String(groupData[i].id)[0] == 'k' && String(groupData[i].videos).split(';').search(video)){
 			group_id = groupData[i].id; 
 			break;
 		}
 	} //console.log(group_id+'  '+video);
 	return group_id;
}


/***/
isUserOfGroup = function(u, g){
	var 
		userData = require('../input/scm2-users.json')
		r = false;
		;
		for(var i = 0; i < userData.length; i++){
			if((i+1) == u && userData[i]['GruppeP1'] == u){
				r = true;
			}
		} 
		return r;
} 

Array.prototype.search = function(val) {
    for (var i=0; i < this.length; i++){
	    if (this[i] == val){
	    	return i;
	    }
	  }  
    return false;
}
 
