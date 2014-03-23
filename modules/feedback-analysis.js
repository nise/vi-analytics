

exports.init = function(req, result){

/*
register with meta data


*/
	var mess = require('../input/scm2_messages.json');
	
	var types = {mc:0};
	for(var i in mess){
		if(mess[i] == undefined){ break; }
		if(mess[i].type in types == false) { types[mess[i].type] = 0;}
		types[mess[i].type]++;
		if(mess[i].type == 'feedback'){
			console.log(mess[i].content+'_'+mess[i]._id);
		}
		// fill in
		
		//
		if(mess[i].content != undefined && mess[i].content.correct != undefined){
			console.log(mess[i].content.correct);
			types['mc']++;	
		}	
	}
	console.log(types);



}
