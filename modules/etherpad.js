/*
description: evaluate etherpad

**/



exports.init = function(config){
	
	// check wheter this analysis can be performed, read config file of loaded data set
	if( config.etherpad == undefined || config.etherpad === -1){
		console.log('Error in module ANNOTATIONS: Required dataset "etherpad" not fond');
		return;
	}
	
	// do analysis
	var core = require('../core');
	var pad = require('../'+ config.etherpad ).etherpad; // "./input/etuscript/videos.json"
	var users = require( '../'+ config.users );

	var 
		obj = {},
		all_pads = [],
		phase_end = 1415276614874;//1414822441793
		;
	
	var getUsersOfGroup = function(group){
		var groupUsers = [];
		for(var u in users){
			if( users.hasOwnProperty(u) ){
				//console.log( group, users[u].groups )
				if(  users[u].groups.indexOf( group.toString() ) > -1){  
					groupUsers.push( users[u].username );
				}
			}
		}
		
		return groupUsers;
	}
		

	for(var i = 0; i < pad.length; i++){
		obj = {
			phase : pad[i].group[0],
			group : pad[i].group,
			users : getUsersOfGroup( pad[i].group ),
			solution : pad[i].text.html
		}; //console.log( getUsersOfGroup( pad[i].group ))
		all_pads.push( obj);
	}// end for 
	
//	console.log(all_pads)
	
	// print output
	var out = '';
	for(var k in all_pads){
		if(all_pads.hasOwnProperty(k)){
			out += "<h2>GROUP: "+all_pads[k].group+"</h2>";
			out += 'PHASE: '+all_pads[k].phase + ',' +'  USER:' +all_pads[k].users.toString().replace(/,/g,'; ') + "<br><br>";
			out += all_pads[k].solution.replace(/,/g,'').replace("<!DOCTYPE HTML><html><body>",'').replace("</body></html>",'') + "\n";
			out += "\n\n";
		}
	
	}
	console.log(out)
	


	



} // end module
