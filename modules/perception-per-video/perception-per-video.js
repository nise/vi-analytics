/* 
* @description estimates the whatched parts of a video
* method: estimates realistic playback time by considering all user events with respect to time between their occurance
* @todo:
* 	- render plots on server side to minimize execution time
*		- add some metadata about the video
* 	- define interfaces for filtered data for groups, single users, script phases, ... 
*   - REST Interface for a heatmap that could become part of a video player timeline
*/
	
(function() {
	var PerceptionPerVideo = function() {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core')
			//logg = require( '../../input/' + core.project + '/' + core.projectConfiguration.cleanlog );
			;
			// register some hooks
			//core.registerHook('on-load', vc, 'init');//log-data-loaded
			
			
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



			// define routes
			/*app.get('/video-heatmap', function(req, res) { 
				res.sendfile('./perception-per-video.html', {root: __dirname });
			});
			
			
			app.get('/json/video-heatmap', function(req, res) { 
				console.log( )
				vc.init(req, res);
			});
*/
		//
    vc.extend({
			// videoReception_simple
			
			init : function (options, req, res){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					user_data = require("../../input/etuscript/users.json")
					Log  = mongoose.model( 'Log' ),
					matrix = [], // number of times a minute of a video has been watched by all users
					tmp = [],
					periode = 1800000,  // interval of considered inactivity
					time = [],
					users = [],
					userHited = [] // number of users that have been watching a particular minute in a video
					;	
				
				Log.find(  ) //{video_file: 'e2script_lecture1.webm'}
						.select('video_file user utc playback_time')
						.lean().exec(function (err, entries) { 
					if(err){
						console.log(err)
					}
					//
					for(var o = 0; o < user_data.length;o++){
						users[o] = Number( user_data[o].id ) ;
					} 
					for(user in users){ 
						if(users.hasOwnProperty(user)  ){ // && users[user] === users[57]	
							for(var i = 0; i < entries.length; i++){  
								if( entries[i].user === Number(user) && entries[i].playback_time !== undefined ){ 
									// init variables and arrays
									video = (entries[i].video_file).replace(/e2script_lecture/,'').replace(/.webm/,'');
									tmp[video] = tmp[video] ? tmp[video] : { time:0, utc: entries[i].utc};
									matrix[video] = matrix[video] ? matrix[video] : [];
									time[video] = Math.floor( entries[i].playback_time );
									userHited[video] = userHited[video] ? userHited[video] : []; 
							
									if( entries[i].utc - tmp[video].utc < periode ){
										for(var j = Math.floor(tmp[video].time); j < time[video]; j++){
											matrix[video][j] = matrix[video][j] ? matrix[video][j]+1 : 1;
											userHited[video][j] = userHited[video][j] ? userHited[video][j] : [];
									userHited[video][j][user] = userHited[video][j][user] ? userHited[video][j][user]+1 : 1;
										}
									}
									matrix[video][time[video]] = matrix[video][time[video]] ? matrix[video][time[video]]+1 : 1;
									userHited[video][j] = userHited[video][j] ? userHited[video][j] : [];
									userHited[video][j][user] = userHited[video][j][user] ? userHited[video][j][user]+1 : 1;
									// store some data temporally
									tmp[video].utc = entries[i].utc;
									tmp[video].time = time[video];
								} // end has playback time
							} // end for entries
						}
					}
					// output results in a format that fits the requirements of c3.js
					var video_perception_c3 = '[';
					for(var video in matrix){ //console.log((video).substr(-2))
						if(matrix.hasOwnProperty(video) && matrix[video].length > 0){
							video_perception_c3 += '{ "id":"'+video+'", "data": [ ["time","hits","userHits"],\n';
							for(var j = 1; j < 3000; j++){
								if(matrix[video][j]){
									video_perception_c3 += '['+j+','+Math.floor(matrix[video][j])+',' + Object.size(userHited[video][j]) +'],\n'
								}	
							}
							video_perception_c3 = video_perception_c3.slice(0,-2) + '\n';
							video_perception_c3 += ']},\n';
						}
					}
					video_perception_c3 = video_perception_c3.slice(0,-2) + '\n ]';
					// save to file 
					//console.log(video_perception_c3);
					core.write2file('perception-per-video.json', video_perception_c3);
					// './perception-per-video.html', {root: __dirname }
					
					
					// define routes
					options.app.get( options.path, function(req, res) { 
						res.sendfile('./perception-per-video.html', {root: __dirname });
					});
					res( "well done"  );
					
				});
			}	
	});
	return vc;
};

	exports = module.exports = PerceptionPerVideo;

})();
