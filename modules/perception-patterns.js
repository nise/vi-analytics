/* 
	* @description returns skipped parts of the lecture 
	* 
	*/
	
	var
		gauss = require('gauss'),
		core = require('../core.js'),
		cleanlog = require('../input/scm2.json'),
		scm_user = require('../input/scm2-users.json')
		;
	
		

		// videoReception_simple
	exports.init = function (){
		
		var ar = 'date\tclose\t';
		for(var i = 500; i < 3600; i++){
			ar += i+'\t'+doo(i).toFixed(1)+'\n';
		}
		//console.log(ar);
		write2file("line-test.tsv", ar);
		//doo(240)
	
	}
	doo = function(delay){
		forward_backward = "forward\tbackward\tuser\n";
		//effort_distribution = "name\tgroup\ttotalEffort\teffortPerMinute\tvideo\tvideoLength\n";
		// loop for each user
		var t_last_time = 0,
			user_effort = {},
			the_user = '',
			video = '',
			v_last = ''
			;
		// for each user	
		for(var user_i in scm_user){ 
			the_user = scm_user[user_i]['user'];	 
			x=0; y=0; last_time=0;
			// loop through the log 
			for(var i=0; i < cleanlog.length; i++) {
				user = cleanlog[i]['user']; 
				video = cleanlog[i]['video']; 
				// if the entry is from the user
				if(user == user_i){ 
					// get actions 
					s = String(cleanlog[i]['action']).split(" "); // at SCM = 5, at IWRM = 4   /// ??? 
					t = cleanlog[i]['utc']; // time stamp
					ii = 0; 
					tmp = [];
					for (var j = 0; j < s.length; j++){ 
						if( ! isNaN(s[j]) ){ 
							tmp[ii] = Math.ceil(s[j]); 
							ii++;
						}
					}
					// correct logging bug for action 'videoplayed'
					if(tmp[0] == undefined && v_last == video){
						tmp[0] = Number(t - t_last_time) + Number(last_time);
						//console.log(tmp[0]+ ' ' +cleanlog[i]['action']);
					}
					// determine forward backward distribution
					diff = tmp[0] - last_time; //console.log(tmp[0] +' '+ last_time);
					t_diff = (t - t_last_time) / 1000; // convert utc milliseconds in seconds
					//console.log(tmp[0] +'  '+ (tmp[0] - last_time));
					// forward - playback
					if(diff != undefined && diff > 0 && Math.abs(Math.abs(t_diff) - Math.abs(diff)) < delay ){ //if its real playback time, not a forward jump, then:
						x += diff;
						if(the_user in user_effort == false){ user_effort[the_user] = 0; }
						user_effort[the_user] += t_diff; // ?? xxx
					} // backward jumps
					else if( diff <= 0 && diff != undefined){
						y += Math.abs(diff);//tmp[0];
					}
					// remender playback position and time stamp
					last_time = tmp[0];
					t_last_time = t;
					v_last = video;
					// write to log
					forward_backward += x+'\t'+y+'\t'+ the_user + "\n";
				}//}
			}	
		}
		//console.log(forward_backward);
		//write2file("forward-backward-dist.tsv", forward_backward);
		
		var l = 0,
		a = [];
		for (var k in user_effort){
			a[l] = user_effort[k];	l++;
		}
		//console.log(new gauss.Vector(a).mean())
	return new gauss.Vector(a).median();
		/*
		foreach(user_effort as the_user => xx){
					group = getGroupOfUser(scm_user, the_user);
					vlength = scriptData->getVideoLengthOfGroup(group) * 60;
					video = scriptData->getVideoOfGroup2(group);
					// output: name, group, total time effort, total effort per video length, video
					effort_distribution .= "the_user\tgroup\t".xx."\t" . round(xx / vlength,2) ."\tvideo\tvlength\n";
		}		
		//
		util->write2file("user-effort.tsv", effort_distribution);	
		*/
	}
