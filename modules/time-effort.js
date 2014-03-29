	/** perception
	* @description: calculates the total time effort for watching a video and the total time effort per minute playbacktime. Data is given out per user.
	*	@param {Array} perception_per_user
	*	@param {Array} durations
	*	@returns {file} perception.tsv
	*	@usedby viz_rezeption_dist.html
	*/
	
	var
		//gauss = require('gauss'),
		core = require('../core.js'),
		analysis = require('../analysis'),
		cleanlog = require('../input/scm2.json'),
		scm_user = require('../input/scm2-users.json'),
		scm_groups = require('../input/scm2-groups.json'),
		scm_video_metadata = require('../input/scm2-video-metadata.json')
		;
	

//		
exports.init = function (){

		var ar = 'date\tclose\t';
		for(var i = 1; i < 70; i=i+1){
			//ar += i+'\t'+doo(i).toFixed(1)+'\n';
		}
		//write2file("line-test.tsv", ar);
		doo(60);
	
	}

doo = function(delay){
		
	var oout = "sepalLength\tsepalWidth\tspecies\n";

	var durations = {};
	var aufrufe = [];
	var perception_sum = 0;
	var repeatition_sum = 0;
	var eff = [];
	var group = '';
	var video = '';
	var vlength = '';
	
	
	for(var name in analysis.perception_per_user){
		if(analysis.perception_per_user.hasOwnProperty(name)){ 
		user = analysis.perception_per_user[name];
		tmp = user[0];
		last = tmp;
		arr = [];
		aufrufe[name] = 0;
		durations[name] = [];
		for(var stamp in user){
			if(user.hasOwnProperty(stamp)){
	
			if( user[stamp] <= (last + delay*60*1000)){ //i// 60 = 30 = 180000min frame  // optimal sind 50 minuten
				arr = [tmp, Number(user[stamp])];
			}else{
				durations[name].push(arr);
				aufrufe[name]++;
				tmp = Number(user[stamp]);
			}
			last = user[stamp];
			}
		}
		durations[name].push(arr);
		//oout .= "".count(durations[name])."\t". i/1000/60 ."\tx\n";
	}}
	
		//this->util->write2file("perception_distribution.tsv", oout);
		//echo oout;
		
		auf = "user\tval\n";
		for( var user in aufrufe ){
			auf += user +'\t'+ aufrufe[user] +'\n';
		}
		//write2file("pages_calls.tsv", auf);
	
		// output
		//out = "Name\tGroup\tPlaytime\tRepetitions\n";
		out = "name\tgroup\ttotalEffort\teffortPerMinute\tvideo\tvideoLength\n";
		var ii = 0;
			
	
		for(var name in durations){ //console.log(ii+' '+name)
			if(durations.hasOwnProperty(name)){
			var user = durations[name];
			sum = 0;
			for(var a = 0; a < user.length; a++){ 
				var t = (user[a][1] - user[a][0]) / 1000 / 60; // calc duration in minutes
				if(t > 0){ 
					sum += t; //echo a[1]."\t".a[0]."\t".t . "m\n";
				}
			}
			for(var i = 0; i < scm_user.length; i++){
				if(i == name){
					group = scm_user[i].GruppeP1;
				} 
			}
			for(var i = 0; i < scm_groups.length; i++){
				if(scm_groups[i].id == group){
					video = String(scm_groups[i].videos).split(';')[0];
				} 
			}

			for(var i = 0; i < scm_video_metadata.length; i++){
				if(scm_video_metadata[i].id == video){
					vlength = String(scm_video_metadata[i]['length']).split(':')[0];
//					video = String(scm_video_metadata[i]['filename']).length;
				} 
			} 
			// output: name, group, total time effort, total effort per video length, video
			out += name+"\t"+group+"\t"+ sum.toFixed(2) + "\t" + (sum / vlength).toFixed(2) + "\t"+video+"\t"+vlength+"\n"; 
			//oout += round(sum / vlength,2)."\t". i/1000/60 ."\tx\n";
			perception_sum += sum;
			repeatition_sum += sum / vlength;
			eff[ii] = sum;
			ii++;
			}
		}
		console.log('pp '+ii)
		console.log("Durchschnittliche Video Wdh.: "+ repeatition_sum / 40 );
		write2file("user-effort.tsv", out);
		//console.log(eff)
		console.log('Temporal Effort by user:');
		console.log(core.resultSet(eff));
		return core.resultSet(eff);	
	}
	
	
	

	
	
	
