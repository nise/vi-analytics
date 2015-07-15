/* 
* @description estimates the whatched parts of a video
* todo:
* 	- highlight phases
*   - forward/backward per phase
*		- map annotation to effort and pattern
* 	- calc number of breakpoints
*/
	
(function() {
	var UsageTimes = function(app) {
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
			app.get('/activities-per-daytime', function(req, res) {
				vc.activitiesPerDaytime(res); 
			});
			
			// define routes
			app.get('/activities-per-date', function(req, res) {
				vc.activitiesPerDate(res); 
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
				//this.activitiesPerDate();
			},
			
			/*
			*
			**/
			activitiesPerDaytime : function ( callback ){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					moment = require('moment'),
					Log  = mongoose.model( 'Log' ),
					tmp = {}
					;	

				Log.find(  )
						.select('utc')
						.lean().exec(function (err, entries) { 
					if(err){
						console.log(err)
					}
					//
					var 
						usage_times_c3 = '{\n',
						time = Date,
						c=[]
						; 
					
					usage_times_c3 += '"data": [["time","count"],\n'
					for(var i = 0; i < entries.length; i++){  
							time = moment.utc(entries[i].utc).format("H");// * 60 + moment.utc(entries[i].utc).format("mm");
							c[ time ] = c[ time ] ? c[ time ] + 1 : 1; 
					} // end for entries
					// further calculations
					for(t in c){
						if(c.hasOwnProperty(t)){
							usage_times_c3 += '["' + t +'","'+ c[t] + '"],\n'
						}
					}
					usage_times_c3 = usage_times_c3.slice(0,-2) + '\n';
					usage_times_c3 +=  ']}';
					
					//console.log(usage_times_c3);
					core.write2file('usage-times.json', usage_times_c3);
					if(callback){
						callback.sendfile('./activities-per-daytime.html', {root: __dirname });
					}	
				});
			},
			
			/*
			*
			**/
			activitiesPerDate : function ( callback ){ 
				var 
					core = require('../../core'),
					mongoose = require( 'mongoose' ),
					moment = require('moment'),
					Log  = mongoose.model( 'Log' ),
					tmp = {}
					;	
				Log.find(  )
						.select('utc')
						.lean().exec(function (err, entries) { 
					if(err){
						console.log(err)
					}
					//
					var 
						usage_times_c3 = '{\n',
						time = Date,
						c=[]
						; 
					
					usage_times_c3 += '"data": [["time","count"],\n'
					for(var i = 0; i < entries.length; i++){  
							time = moment.utc(entries[i].utc).format("YYYY-M-D");// * 60 + moment.utc(entries[i].utc).format("mm");
							c[ time ] = c[ time ] ? c[ time ] + 1 : 1; 
					} // end for entries
					// further calculations
					for(t in c){
						if(c.hasOwnProperty(t)){
							usage_times_c3 += '["' + t +'","'+ c[t] + '"],\n'
						}
					}
					usage_times_c3 = usage_times_c3.slice(0,-2) + '\n';
					usage_times_c3 +=  ']}';
					
					console.log(usage_times_c3);
					core.write2file('usage-times.json', usage_times_c3);
					if(callback){
						callback.sendfile('./activities-per-date.html', {root: __dirname });
					}	
				});
			}		
	});
	return vc;
};

	exports = module.exports = UsageTimes;

})();
