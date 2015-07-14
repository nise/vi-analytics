/* 
* @description estimates the whatched parts of a video
* todo:
* 	- highlight phases
*   - forward/backward per phase
*		- map annotation to effort and pattern
* 	- calc number of breakpoints
*/
	
(function() {
	var VideoUsagePatterns = function(values) {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core')
			//logg = require( '../../input/' + core.project + '/' + core.projectConfiguration.cleanlog );
			;
			// register some hooks
			core.registerHook('on-load', vc, 'init');//log-data-loaded
			
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
			// videoReception_simple
			
			init : function (){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					Log  = mongoose.model( 'Log' ),
					tmp = {}
					;	
			

				Log.find( {video_file: 'e2script_lecture5.webm'} )
						.select('video_file user utc playback_time action action_details')
						.lean().exec(function (err, entries) { 
					if(err){
						console.log(err)
					}
					//
					var 
						users = [],
						user_data = require("../../input/etuscript/users.json"),
						forward_backward = 'forward\tbackward\tuser\n',
						forward_backward_c3 = '{\n',
						user_patterns = {}
						;
					for(var o = 0; o < user_data.length;o++){
						users.push( Number( user_data[o].id ) );
					}
					for(user in users){ 
						if(users.hasOwnProperty(user)  ){ // && users[user] === users[57]
							tmp = { time:0 };
							var t_last_time = 0, last_time = 0;
							var x=0,y=0; 
							forward_backward_c3 += '"'+user+'": { "data": [\n ["forward","backward"],\n';
							for(var i = 0; i < entries.length; i++){  
								if( entries[i].user === Number(user) && entries[i].playback_time !== undefined ){ 
									// determine forward backward distribution
									var diff_playback = tmp.time - entries[i].playback_time; // difference of playback time
									var diff_time = (entries[i].utc - tmp.utc) / 1000; // difference of physical time in seconds
				
									// forward - playback
									if(diff_playback < 0 && Math.abs(diff_time) - Math.abs(diff_playback) < 3){ //if its real playback time, not a forward jump, then:
										x += Math.abs( diff_playback);
									} 
									// backward jumps
									else if( diff_playback >= 0 ){
										y += Math.abs( diff_playback); 
									}
									
									forward_backward += x+'\t'+y+'\t'+ users[user] +'\n';
									forward_backward_c3 += '['+Math.floor(x)+','+Math.floor(y)+'],\n';
									tmp = {utc: entries[i].utc, time: Number(time) };
								}
								
							} // end for entries
							// further calculations
							var o = { effort: Math.floor(x/60), back: Math.floor(y/60) }; //console.log(JSON.stringify(o));
							user_patterns[user] = o;
							forward_backward_c3 = forward_backward_c3.slice(0,-2) + '\n';
							forward_backward_c3 +=  '], "user_data":' + JSON.stringify(o) +'},\n';
						}//	end hasOwnProperty
						
					}//end user
					
					
					console.log(user_patterns);
					forward_backward_c3 = forward_backward_c3.slice(0,-2) + '\n}';
					//console.log(forward_backward_c3);
					core.write2file('video-perception-forward-backward.json', forward_backward_c3);
					///core.write2file('video-perception-forward-backward.tsv', forward_backward);
					
					var pat = '';
					for (var p in user_patterns){
						if(user_patterns.hasOwnProperty(p)){
							pat += user_patterns[p].effort +'\t'+ user_patterns[p].back;
						}
					}
					
				});
			}	
	});
	return vc;
};

	exports = module.exports = VideoUsagePatterns;

})();
