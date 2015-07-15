/* 
* @description 
* todo:
* 	- differentiate colors for different dates at c3.js
*/
	
(function() {
	var Rewatching = function(app) {
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
			app.get('/rewatching', function(req, res) {
				res.sendfile('./rewatching.html', {root: __dirname });
				//vc.rewatching(res); 
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
				this.rewatching();
			},
			
			action_arr : [
				['seek_end','seek_start','timeline_link_seek','videopaused','videoplayed'], // actionsOnTimeline = 
				['save_WrittenAssessment','save_WrittenAssessment','saveannotation comments','save','saveannotation tags', 'save-fill-in'], // actionsOnAnnotation
				['change_speed'], // actionsSpeed
				['clickcommentfromlist','clicktocfromlist'], // actionsNav
				['loadvideo', 'videoended'], // actionsOthers
			],
			
			/*
			* Helper function
			**/
			getActionType : function(action){
				for(var type in this.action_arr){
					if( this.action_arr.hasOwnProperty(type) ){
						if(  this.action_arr[type].indexOf(action) !== -1 ){
							return type;
						}	
					}
				}
				return 4; // others
			},
			
			/*
			*
			**/
			rewatching : function ( callback ){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					moment = require('moment'),
					Log  = mongoose.model( 'Log' ),
					tmp = {}
					;	
				
				// fetch data from mongoose	
				Log.find().select('user utc playback_time action').lean().exec(function (err, entries) { 
					if(err){ console.log(err) }
					//
					var 
						users = [],
						user_data = require("../../input/etuscript/users.json"),
						usage_times_c3 = '{\n',
						time = Date,
						action = [],
						c=[]
						; 
 
						
					for(var o = 0; o < user_data.length;o++){
						users.push( { id: Number( user_data[o].id ), culture: user_data[o].culture } );
					}
					
					for(var user in users){ 
						if( users.hasOwnProperty(user) ){ 
							
							usage_times_c3 += '"'+ users[ user ].id+'": {"data": [\n ["daytime","playback-time","date","action_type"],\n'
							for(var i = 0; i < entries.length; i++){ 
								//action[entries[i].action] = action[entries[i].action] ? action[entries[i].action]+1 : 1;
								if(entries[i].user === users[user].id && entries[i].playback_time !== undefined ){  
									time = Number(moment.utc(entries[i].utc).format("H")) * 60 + Number(moment.utc(entries[i].utc).format("mm"));
									usage_times_c3 += '["'+ time +'","'+ Math.floor(entries[i].playback_time/60) +'","'+ moment.utc(entries[i].utc).format("YYYY-MM-D") +'","'+ vc.getActionType( entries[i].action) +'"],\n';
								}	 
							} // end for entries
							usage_times_c3 = usage_times_c3.slice(0,-2) + '\n ]},\n';
						}	
					}
							
					usage_times_c3 = usage_times_c3.slice(0,-2) + '\n';
					usage_times_c3 +=  '}';
					//console.log(action)
					console.log(usage_times_c3);
					core.write2file('rewatching.json', usage_times_c3);
					if(callback){
						//callback.sendfile('./rewatching.html', {root: __dirname });
					}	
				});
			},
			
			
			
	});
	return vc;
};

	exports = module.exports = Rewatching;

})();
