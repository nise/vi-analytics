/*
* name: pre post test 
* description: 

*/


(function() {
	var PrePostTest = function(app) {
  //"use strict";
		
		var 
			vc = {},
			gauss = require('gauss'),
			core = require('../../core'),
			jp = require('jsonpath')
			;
			
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

			init: function(){
				var data = require( '../../input/' + core.project + '/pre-post-results.json');
				var user = jp.query(data, '$..user');
				var task0 = jp.query(data, '$..user_results..Task0[?(@.value==1)]');
				
				console.log(task0);
			}
			
	});
	return vc;
};

	exports = module.exports = PrePostTest;

})();			

