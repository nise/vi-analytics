/*


**/



exports.init = function(config){
	
	// check wheter this analysis can be performed, read config file of loaded data set
	if( config.videos == undefined || config.videos === -1){
		console.log('Error in module ANNOTATIONS: Required dataset "videos" not fond');
	}
	
	// do analysis
	var core = require('../core');
	var videos = require('../'+ config.videos ); // "./input/etuscript/videos.json"
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
	
	// print comments
	out = '';
	for(var i = 0; i < videos.length; i++){
		if(test_data.indexOf(videos[i].id) == -1){
			//console.log('*******************');
			//console.log('Video-ID: '+videos[i].id + '  -- Video-Datei Nr.:  ' + videos[i].video );
			for(var j = 0; j < videos[i].comments.length; j++ ){
				out += "CAT \t\t" + videos[i].id + "/"+ videos[i].video + Number(videos[i].comments[j].start).toFixed(2) + "\t" + (decodeURI(  ( videos[i].comments[j].comment).replace(/%3A/g,':').replace(/%2F/g, '/') ));
			}
		}
	}
	// console.log(out);
	
	// print fill_in
	out = '';
	for(var i = 0; i < videos.length; i++){
		if(test_data.indexOf(videos[i].id) == -1){
			//console.log('*******************');
			//console.log('Video-ID: '+videos[i].id + '  -- Video-Datei Nr.:  ' + videos[i].video );
			for(var j = 0; j < videos[i].comments.length; j++ ){
				out += "CAT \t\t" + videos[i].id + "/"+ videos[i].video + Number(videos[i].comments[j].start).toFixed(2) + "\t" + (decodeURI(  ( videos[i].comments[j].comment).replace(/%3A/g,':').replace(/%2F/g, '/') ));
			}
		}
	}
	// console.log(out);


	// write output, render to ejs
	
	//console.log(anno);
	out = "type,n,mean,median,std,min,max,sum,range\n";
	out += "comments," + obj2arr( core.resultSet(anno_comments)).slice(0,8) + "\n";
	out += "tags," + obj2arr( core.resultSet(anno_tags)).slice(0,8) + "\n";
	out += "chapters," + obj2arr( core.resultSet(anno_toc)).slice(0,8) + "\n";
	console.log(out);

	out = "video,comments,toc,tags\n";
	for(var a in anno_video){
		if(anno_video.hasOwnProperty(a)){
			anno_video[a].comments = anno_video[a].comments/anno_video[a].instances;
			anno_video[a].tags = anno_video[a].tags/anno_video[a].instances; 
			anno_video[a].toc = anno_video[a].toc/anno_video[a].instances; 
			if(anno_video[a] != undefined)
				out += a + "," + obj2arr(anno_video[a]) + "\n";
		}		
	}
	console.log(out);




	



} // end module
