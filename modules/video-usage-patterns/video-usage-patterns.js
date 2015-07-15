/* 
* @description estimates the whatched parts of a video
* todo:
* 	- highlight phases
*   - forward/backward per phase
*		- map annotation to effort and pattern
* 	- calc number of breakpoints
*/
	
(function() {
	var VideoUsagePatterns = function(app) {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core')
			//logg = require( '../../input/' + core.project + '/' + core.projectConfiguration.cleanlog );
			;
			// register some hooks
			core.registerHook('on-load', vc, 'init');//log-data-loaded
			
			// define routes
			app.get('/video-usage-patterns', function(req, res) { 
				res.sendfile('./video-usage-patterns.html', {root: __dirname });
			});
			
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
			
			init : function(){
				//this.usagePattern( {video_file: 'e2script_lecture1.webm'} );
				//this.usagePattern( {video_file: 'e2script_lecture2.webm'} );
				//this.usagePattern( {video_file: 'e2script_lecture3.webm'} );
				//this.usagePattern( {video_file: 'e2script_lecture4.webm'} );
				this.usagePattern( {video_file: 'e2script_lecture5.webm'} );
			},
			
			usagePattern : function ( filter ){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					Log  = mongoose.model( 'Log' ),
					tmp = {}
					;	
			

				Log.find( filter )
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
						users.push( { id: Number( user_data[o].id ), culture: user_data[o].culture } );
						
					}
					for(user in users){ 
						if(users.hasOwnProperty(user)  ){ // && users[user] === users[57]
							tmp = { time:0 };
							var t_last_time = 0, last_time = 0;
							var x=0,y=0; 
							forward_backward_c3 += '"'+users[user].id+'": { "data": [\n ["forward","backward"],\n';
							for(var i = 0; i < entries.length; i++){  
								if( entries[i].user === Number(users[user].id) && entries[i].playback_time !== undefined ){ 
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
									
									forward_backward += x+'\t'+y+'\t'+ users[user].id +'\n';
									forward_backward_c3 += '['+Math.floor(x)+','+Math.floor(y)+'],\n';
									tmp = {utc: entries[i].utc, time: entries[i].playback_time };
								}
								
							} // end for entries
							// further calculations
							var o = { 
								user: users[user].id,
								culture : users[user].culture,
								effort: Math.floor(x/60), 
								back: Math.floor(y/60) 
							}; //console.log(JSON.stringify(o));
							user_patterns[user] = o;
							forward_backward_c3 = forward_backward_c3.slice(0,-2) + '\n';
							forward_backward_c3 +=  '], "meta":' + JSON.stringify(o).toString() +'},\n';
						}//	end hasOwnProperty
						
					}//end user
					
					
					forward_backward_c3 = forward_backward_c3.slice(0,-2) + '\n}';
					//console.log(forward_backward_c3);
					core.write2file('video-perception-forward-backward.json', forward_backward_c3);
					
					
					var all=[], german = [], foreign = [];
					for( var p in user_patterns){
						if( user_patterns.hasOwnProperty(p) ){ 
							if( user_patterns[p].culture === 'ger' ){
								german.push( user_patterns[p].effort );
							}else{
								foreign.push( user_patterns[p].effort );
							}
							all.push( user_patterns[p].effort );
						}	
					}// end for
					console.log(filter);
					console.log( core.resultSet(all,2).mean, core.resultSet(german,2).mean, core.resultSet(foreign,2).mean );
					
				});
			}	
	});
	return vc;
};

	exports = module.exports = VideoUsagePatterns;

})();
