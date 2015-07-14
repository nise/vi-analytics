/* 
* description: statistical tests of multiple choice assessment tasks
* // dump all mongodb databases: $ mongodump
* // convert the dump into json: $ bsondump collection.bson > collection.json
* todo
*  - Item-total correlation (Trennschärfe) and the Item Homogenity needs to be calculated. See https://de.wikipedia.org/wiki/Itemanalyse#Itemschwierigkeit
* - rendering as tables, plots using c3.js
*/
	
(function() {
	var SelfAssessment = function(values) {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core.js')
			//logg = require( '../../input/' + core.project + '/' + core.projectConfiguration.cleanlog );
			;
			// register some hooks
			core.registerHook('on-load', vc, 'init');
			
			var result = function(value, callback) {
				if (callback) {
				  return callback(value);
				}
				else {
				  return value;
				}
			};
		  Object.defineProperty(vc, 'extend', {
		    /**
		     * Return a Collection extended with named functions.
		     * @param methods Object { 'functionName': function() {} }
		     */
		    value: function(methods, callback) {
		      for (var method in methods) {
		        Object.defineProperty(this, method, {
		          value: methods[method],
		          writable: true,
		          enumerable: false
		        });
		      }
		      return result(this, callback);
		    },
		    writable: true,
		    enumerable: false
		  });


		//
    vc.extend({
    
    	init : function (){
				var assess = require("../../input/etuscript/mongodb/tests.json");
				var assignments = require("../../input/etuscript/assessment.json");
				var max_result = 35;
				var maxTaskPoints = [];
				var tests = [];
				var resultPerTask = [];
				var excludedUsers = ["xxx","joe","bob"];

				// get max points per task
				for(var i = 0; i<assignments.test.length; i++){
					maxTaskPoints[i] = assignments.test[i].correct.length;
				} 

				for(var i = 0; i < assess.length; i++ ){
					if( excludedUsers.indexOf( assess[i].user ) === -1 ){ //console.log(assess[i].user_results[0]['Task-10']);
						// process data on user level
						if ( assess[i].user in tests === false){
							tests[assess[i].user] = {
								user: assess[i].user, 
								runs: 1, 
								process_time: assess[i].process_time, 
								results: (assess[i].results).reduce(function(pv, cv) { return Number(pv) + Number(cv); }, 0) 
							};
						}else{
							tests[assess[i].user].runs++;
							tests[assess[i].user].process_time += assess[i].process_time;
							tests[assess[i].user].results += (assess[i].results).reduce(function(pv, cv) { return Number(pv) + Number(cv); }, 0);
						}
					} 
					// process data on task level
					for(var k = 0; k < assess[i].results.length; k++){
						if ( resultPerTask[k] === undefined){
							resultPerTask[k] = [];
						}
						
						var sum = new gauss.Vector( assess[i].results.map(function(a){ return Number(a); }) ).sum();
						if(sum > 0){
						if( maxTaskPoints[k] === Number(assess[i].results[k])){ 
							resultPerTask[k].push( 1 );
						}else{
							resultPerTask[k].push( 0 );
						}	}
					}
				} 
				
				// output results on task level... item difficulty
				var item_analyisis = "task,correct_num,wrong_num,item_difficulty\n"
				for(var l = 0; l < resultPerTask.length; l++){
					var t = resultPerTask[l].reduce(function(countMap, word) {countMap[word] = ++countMap[word] || 1;return countMap}, {});
					item_analyisis += 'Task-'+l +','+t['1']+','+t['0']+','+( t['1'] / (t['1']+t['0']))+'\n';
				}
				console.log(item_analyisis);
				// output results on user level
				var out = "name,runs,time_avg,results_avg\n";
				var a_runs = [], a_time = []; a_results = [];
				for(t in tests){
					if( tests.hasOwnProperty(t) ){
						out +=
						tests[t].runs +","+ 
						tests[t].process_time/tests[t].runs +","+
						tests[t].results/tests[t].runs +","+
						( ( tests[t].results/max_result ) / tests[t].runs ).toFixed(2) +","+
						tests[t].user +"\n"
						;
						a_runs.push(Number(tests[t].runs));
						a_time.push(tests[t].process_time / 60000);
						a_results.push(tests[t].results);
					}	
				}
				console.log('# Individual Test-Performance.................................');
				console.log(out);
				console.log('# Test-Runs.................................');
				console.log(core.resultSet(a_runs));
				console.log('# Test-Time.................................');
				console.log(core.resultSet(a_time));				
				console.log('# Test-Results.................................');
				console.log(core.resultSet(a_results));
				console.log('.................................');
			}	
	});

return vc;
};

	exports = module.exports = SelfAssessment;

})();





