/* 
* @description estimates the whatched parts of a video
* 
*/
	
(function() {
	var VideoPerception = function(values) {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core.js'),
			logg = require( '../../input/' + core.project + '/' + core.projectConfiguration.cleanlog );
			;
			// register some hooks
			core.registerHook('log-data-loaded', vc, 'init');
			
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
			core : require('../../core.js'),
			init : function (){
				// filter given video
				for( var entry in logg){
					if( logg.hasOwnProperty( entry ) ){
						var vid = String(logg[entry].video).replace("http://141.46.8.101/beta/e2script/e2script_lecture","").replace(".webm","");
						
						if( vid === '2'){
						
							console.log(logg[entry] );
						}
					}
				}
	
				// extract sessions
	
				// fill gaps

			}	
	});

return vc;
};

	exports = module.exports = VideoPerception;

})();
