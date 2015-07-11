/*
* name: peer annotations
* description: Aquire measurements about the user annotations

*/

var
	core = require('../../core.js')
	;

/*
* starts module
**/
exports.init = function (){
	getAnnotationResults();	
}


/*
Annotations
**/
function getAnnotationResults(){
	// get file that contains the video data
	var videos = require( '../../input/' + core.project + '/' + core.projectConfiguration.videos );
	var anno = {comments:0, toc:0, tags:0 };
	var anno_comments = [];
	var anno_tags = [];
	var anno_toc = [];
	var anno_video = [];
	var test_data = ["439","539","739"];
	console.log('............................................')

	for(var i = 0; i < videos.length; i++){
		if(test_data.indexOf(videos[i].id) == -1 && videos.hasOwnProperty(i) ){
			anno.comments += videos[i].comments.length;
			anno.tags += videos[i].tags.length; 
			anno.toc += videos[i].toc.length;
			anno_comments.push(videos[i].comments.length);
			anno_tags.push(videos[i].tags.length);
			anno_toc.push(videos[i].toc.length);
			//
			videos[i].video = String(videos[i].video).replace("http://141.46.8.101/beta/e2script/e2script_lecture","").replace(".webm","");
			//if(videos[i].video !== String(videos[i].id).slice(0,1) ){
				console.log(videos[i].id, videos[i].video);
			//}
			if( videos[i].video in anno_video === false){
				anno_video[videos[i].video] = { instances:0, comments: 0, toc: 0, tags: 0, comments_arr: [], toc_arr: [], tags_arr: [] };
			}
			if( anno_video.hasOwnProperty(videos[i].video) ){
				anno_video[videos[i].video].comments += videos[i].comments.length;
				anno_video[videos[i].video].toc += videos[i].toc.length;
				anno_video[videos[i].video].tags += videos[i].tags.length;
				anno_video[videos[i].video].comments_arr.push(videos[i].comments.length);
				anno_video[videos[i].video].toc_arr.push(videos[i].toc.length);
				anno_video[videos[i].video].tags_arr.push(videos[i].tags.length);
				anno_video[videos[i].video].instances++;
			}
		}	
	}

	// write output
	out = "type,n,mean,median,std,min,max,sum,range\n";
	out += "comments," + core.sumArray( anno_comments ) + ',' + core.obj2arr( core.resultSet(anno_comments)).slice(1,8) + "\n";
	out += "tags," + core.sumArray( anno_tags ) + ',' + core.obj2arr( core.resultSet(anno_tags)).slice(1,8) + "\n";
	out += "chapters," + core.sumArray( anno_toc ) + ',' + core.obj2arr(  core.resultSet(anno_toc)).slice(1,8) + "\n";
	console.log(out);
	console.log('............................................')


	out = "video,comments_M,comments_SD,toc_M,toc_SD,tags_M,tags_SD\n";
	var i = 0;
	for(var a in anno_video){
		if( anno_video.hasOwnProperty(a) ){  
			var comm = core.resultSet( anno_video[a].comments_arr, 2 );
			var tagg = core.resultSet( anno_video[a].tags_arr, 2 );
			var tocc = core.resultSet( anno_video[a].toc_arr, 2 );
			out += comm.mean+','+comm.stdev + ','+tagg.mean+','+tagg.stdev +','+tocc.mean+','+tocc.stdev + "\n";
		}	
	}
	console.log(out);
	console.log('............................................');
}	


/*
*
**/
function getGropusPerPhase(){
	var groups = require( '../../input/' + core.project + '/' + core.projectConfiguration.groups );
	var res = {};
	for( var g in groups ){
		if(groups.hasOwnProperty(g)){
			var name = String(groups[g].description).replace(/Phase\ /, '');
			if ( name in res === false){
				res[ name ] = 0;
			}
				res[ name ]++; 
		}
	}
	return res;
}

