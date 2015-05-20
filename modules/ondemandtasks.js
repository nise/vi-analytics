/*
description: evaluate on demand tasks

**/



exports.init = function(config){
	
	// check wheter this analysis can be performed, read config file of loaded data set
	if( config.ondemandtasks == undefined || config.ondemandtasks === -1){
		console.log('Error in module ANNOTATIONS: Required dataset "ondemandtasks" not fond');
		return;
	}
	
	// do analysis
	var core = require('../core');
	var ondemandtask = require('../'+ config.ondemandtasks ); // "./input/etuscript/videos.json"

	var 
		per_field = [], 
		field = [],
		all_fields = [],
		phase_end = 1415276614874;//1414822441793
		;
	for(var i = 0; i < ondemandtask.length; i++){
		//console.log( ondemandtask[i].contents.length )
		field = ondemandtask[i].field.split('-');
		if( field[0] in per_field == false){
			per_field[ field[0] ] = [];
		}
		
		var con = ondemandtask[i].contents.sort('updated_at');
		
		var authors = '';
		for(var author in con){
			if(con.hasOwnProperty(author)){ 
			//	if( con[author].username in authors == false){
					//authors[ con[author].username] = 0;
				//}
				authors += con[author].username + ';'; 
			}
		}
		var assignment = (ondemandtask[i].assignment).replace('{"assignment":"', '').replace(/,/g, "\;");
		var obj = { 
			assignment: assignment,//field[1], 
			field: assignment.length,
			revisions: ondemandtask[i].contents.length,
			authors : authors,
			time_effort: con[ con.length-1 ].updated_at - con[ 0 ].updated_at,
			final_result: con[ con.length-1 ].text 
		}		
		per_field[ field[0] ].push(obj);
		var tt  = core.uniqArray(obj.authors.split(';'));
		//console.log(obj.field.length, obj.field)
		//console.log(tt+ ''+obj.field.length + ", "+ obj.final_result.replace(/\n/g, "//").replace(/,/g, "\;") )	


		
		// per field
		if( assignment.length in all_fields  == false){
			all_fields[ assignment.length ] = { revisions: [], filled:0 };
		}
		all_fields[ assignment.length ].revisions.push( ondemandtask[i].contents.length ); 
		all_fields[ assignment.length ].filled++; // count groups that filled out that field
		
	}// end for 
	
	//console.log(all_fields)
	// helper function
	
	
	
	// print
	var out = 'field,num-videos,mean,median,stdev,min,max,sum,range,quartile,percentile,varCoeff,density\n';
	for(var j in all_fields){
		if(all_fields.hasOwnProperty(j)){
			out += j + "," + core.obj2arr( core.resultSet( all_fields[j].revisions ) ) +"\n";
		}
	}
	console.log(out);
	
	/*
	field,num-videos,mean,median,stdev,min,max,sum,range,quartile,percentile,varCoeff,density
80,24,6.5,4,5.212165257037297,1,20,156,19,2,4,10,10,0.8018715780057379,3,3,3,4,4,4
86,25,11.96,11,8.219391704986448,1,35,299,34,4,11,15,15,0.6872401091125792,8,8,9,10,11,12,13
390,21,7.285714285714286,4,12.947302926139656,1,63,153,62,1,4,7,6,1.7770807937838744,2,2,3,4,4
391,24,4.583333333333333,4,3.0265032995558125,1,12,110,11,2,3,7,6,0.6603279926303591,2,2,3,3,5,5
576,22,6.045454545454546,5,3.5989553121486484,1,13,133,12,3,5,10,8,0.5953159162952651,4,4,4,5,5,5

	
	*/

	out = '';
	for(var j in per_field["52a13d2e2aa9d35f24000600"]){
		if(per_field["52a13d2e2aa9d35f24000600"].hasOwnProperty(j)){
			//console.log('********************************')
			out += 'Feld:'+ per_field["52a13d2e2aa9d35f24000600"][j].field + ',' + per_field["52a13d2e2aa9d35f24000600"][j].authors.toString() +  "\n";
		} // per_field["52a13d2e2aa9d35f24000600"][j].final_result.replace(/,/g, "\,").replace(/\\n/g, "//") +
	}
	//console.log(out);


	



} // end module
