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
		
		action:  					String,
		action_details: 	[Schema.Types.Mixed],
		playback_time:		Number,
		
		user_agent:  			[Schema.Types.Mixed],
		ip: 							String,
		flag: 						Boolean
}); 
mongoose.model( 'Log', Log );		
 
