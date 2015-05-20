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



/*
Annotations
**/
var videos = require("./input/etuscript/videos.json");
var anno = {comments:0, toc:0, tags:0 };
var anno_comments = [];
var anno_tags = [];
var anno_toc = [];
var anno_video = [];
var test_data = ["439","539","739"];

for(var i = 0; i < videos.length; i++){
	if(test_data.indexOf(videos[i].id) == -1){
		anno.comments += videos[i].comments.length;
		anno.tags += videos[i].tags.length; 
		anno.toc += videos[i].toc.length;
		anno_comments.push(videos[i].comments.length);
		anno_tags.push(videos[i].tags.length);
		anno_toc.push(videos[i].toc.length);
		//
		videos[i].video = String(videos[i].video).replace("http://141.46.8.101/beta/e2script/e2script_lecture","").replace(".webm","");
		
		if( videos[i].video in anno_video === false){
			anno_video[videos[i].video] = { instances:1, comments: videos[i].comments.length, toc: videos[i].toc.length, tags: videos[i].tags.length };
		}else{
			anno_video[videos[i].video].comments += videos[i].comments.length;
			anno_video[videos[i].video].toc += videos[i].toc.length;
			anno_video[videos[i].video].tags += videos[i].tags.length;
			anno_video[videos[i].video].instances++;
		}
	}	
}

var obj2arr = function(obj){ return Object.keys(obj).map(function (key) {
    return obj[key];
});}

// write output
//console.log(anno);
out = "type,n,mean,median,std,min,max,sum,range\n";
out += "comments," + obj2arr(analytics.resultSet(anno_comments)).slice(0,8) + "\n";
out += "tags," + obj2arr(analytics.resultSet(anno_tags)).slice(0,8) + "\n";
out += "chapters," + obj2arr(analytics.resultSet(anno_toc)).slice(0,8) + "\n";
//console.log(out);

out = "video,comments,toc,tags\n";
for(var a in anno_video){
	anno_video[a].comments = anno_video[a].comments/anno_video[a].instances;
  anno_video[a].tags = anno_video[a].tags/anno_video[a].instances; 
  anno_video[a].toc = anno_video[a].toc/anno_video[a].instances; 
	if(anno_video[a] != undefined)
		out += a + "," + obj2arr(anno_video[a]) + "\n";
}
//console.log(out);
