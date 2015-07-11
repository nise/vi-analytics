////////////////////////////////////////
// E-TuScript
///////////////////////////////////////
// dump all mongodb databases: $ mongodump
// convert the dump into json: $ bsondump collection.bson > collection.json




/*
Self-assessment results
todo: 
- calculations per question
- M, SD
**/
function getSelfAssessmentResults(){
	var assess = require("./input/etuscript/mongodb/tests.json");
	var max_result = 35;
	var tests = [];

	for(var i = 0; i < assess.length; i++ ){
		if(assess[i].user === "xxx" || assess[i].user === "joe" || assess[i].user === "bob"){
			//
		}else{
			if ( assess[i].user in tests === false){
				tests[assess[i].user] = {user: assess[i].user, runs: 1, process_time: assess[i].process_time, results: (assess[i].results).reduce(function(pv, cv) { return Number(pv) + Number(cv); }, 0) };
			
			}else{
				tests[assess[i].user].runs++;
				tests[assess[i].user].process_time += assess[i].process_time;
				tests[assess[i].user].results += (assess[i].results).reduce(function(pv, cv) { return Number(pv) + Number(cv); }, 0);
			}
		}
	}
	// output
	var out = "name,runs,time_avg,results_avg\n";
	var a_runs = [], a_time = []; a_results = [];
	for(t in tests){
		out +=
		tests[t].runs +","+ 
		tests[t].process_time/tests[t].runs +","+
		tests[t].results/tests[t].runs +","+
		(tests[t].results/max_result/tests[t].runs).toFixed(2) +","+
		tests[t].user +"\n"
		;
		if(typeof tests[t].runs === "number" ){
			a_runs.push(Number(tests[t].runs));
			a_time.push(tests[t].process_time / 60000);
			a_results.push(tests[t].results);
		}
	}
	//console.log(out);
	console.log(analytics.resultSet(a_runs));
	console.log(analytics.resultSet(a_time));
	console.log(analytics.resultSet(a_results));
}



