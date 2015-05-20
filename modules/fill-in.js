/*


**/



exports.init = function(config){
	
	// check wheter this analysis can be performed, read config file of loaded data set
	if( config.fillin == undefined || config.fillin === -1){
		console.log('Error in module ANNOTATIONS: Required dataset "fill-ins" not fond');
	}
	
	// do analysis
	var core = require('../core');
	var fillin = require('../'+ config.fillin ); // "./input/etuscript/videos.json"

	var 
		arr = [], 
		field = [],
		all_fields = [],
		correct_values = [
			0, 
			"Einsatz technischer Hilfsmittel",
			"verbale Reize",
			"anonym",
			"aufwendiger",
			-1,
			-1,
			-1,
			-1,
			"Lurking",
			-1,
			"Anzahl und Güte der Beteiligten Sinneskanäle",
			"Synchronizität und Asynchonizität",
			"Anzahl der Empfänger (Teilnehmerkreis)",
			"Fragen, Probleme",
			"Austausch bei der Betreuung",
			"Interaktion",
			"gemeinsamen Problemverständnisses",
			"Konstruktion von Wissen",
			"eTutoren",
			"Eine",
			"Front Office",
			"bei inhaltlich schwierigen Fragen",
			"Koordinationsunterstützende Werkzeuge",
			"Kommunikationsunterstützende Werkzeuge",
			"Kooperationsunterstützende Werkzeuge",
			"Blog/Forum",
			"Kommunikation der Arbeitsergebnisse",
			"Wiki",
			"Synchrone und asynchrone Bearbeitung",
			"Wiki",
			"Spass",
			"zweckentfremdete/modifizierte Nutzung",
			"Social Presence Theory",
			"Media Richness Theory",
			"face to face",
			"Overcomplication",
			"Oversimplification",
			"Briefpost",
			"Komplexität der Aufgabe",
			"",
			"rationalen",
			"Media Synchrocity Theory"
			],
		phase_end = 1415276614874;//1414822441793
		;
	for(var i = 0; i < fillin.length; i++){
		//console.log( fillin[i].contents.length )
		field = fillin[i].field.split('-');
		if( field[0] in arr == false){
			arr[field[0]] = [];
		}
		arr[field[0]].push({ field: field[1], revisions: fillin[i].contents.length });
		
		// per field
		if( field[1] in all_fields  == false){
			all_fields[ field[1] ] = { revisions: [], filled:0, correct:0, phase_correct:0 };
		}
		all_fields[ field[1] ].revisions.push( fillin[i].contents.length ); 
		all_fields[ field[1] ].filled++;
		
		// look for correct answer
		for (var k in fillin[i].contents){
			if( fillin[i].contents.hasOwnProperty(k) ){
				if( fillin[i].contents[k].text === correct_values[ Number( field[1].replace('fillin', '') ) ] ){
					all_fields[ field[1] ].correct++;
					if( fillin[i].contents[k].updated_at <= phase_end ){
						all_fields[ field[1] ].phase_correct++;
					}
				}
			}
		}
	}
	//console.log(all_fields);
	
	
	// print
	var out = 'field,num-videos,mean,median,stdev,min,max,sum,range,quartile,percentile,varCoeff,density\n';
	for(var j in all_fields){
		if(all_fields.hasOwnProperty(j)){
			out += j + "," + core.obj2arr( core.resultSet( all_fields[j].revisions ) ) +","+ all_fields[j].correct +","+ all_fields[j].phase_correct +"\n";
		}
	}
	console.log(out);


	
	/*
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

*/


	



} // end module
