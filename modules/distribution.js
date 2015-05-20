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

	var out = "name\tgroup\ttotalEffort\teffortPerMinute\tvideo\tvideoLength\n";
	var r_out = "name,country,actions,contributions\n";
	
	for(var user in analysis.actionsPUPC){
		obj = analysis.actionsPUPC[user];
		country = ( obj.culture == 'de' ? 1 : 2 ); console.log(country);
		out += obj.user + '\t0\t' + country + '\t' + obj.actions + '\t5\t0\n';
		r_out += obj.user + ',' + country + ',' + obj.actions + ',' + obj.contributions + '\n';
	}
		
	write2file("user-activity-culture.tsv", out);
	write2file("r_user-activity-culture.csv", r_out);
		
	return out;
	
}


	
	
	

	
	
	
