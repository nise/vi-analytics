/*

**/
var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

//
var Log = new Schema({
		utc: 							Number, 
		phase: 						Number,
		date:  						String, 
		time:  						String, 
		
		group:  					String, 
		user:  						Number, 
		user_name:  			String,
		user_gender:			String,
		user_culture:			String,
		user_session:			Number,
				
		video_id:  				String,
		video_file:  			String,
		video_length:  		String,
		video_language:  	String,
		
		action:						{
			context: String,
			action: String,
			values: Array
		},
		
		playback_time:		Number,
		
		user_agent:  			String,
		ip: 							String,
		flag: 						Boolean
	}); 
mongoose.model( 'Log', Log );		
 
