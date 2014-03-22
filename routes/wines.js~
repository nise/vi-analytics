var 
	mongo = require('mongodb'),
	userMgmt = require('../routes/userMgmt.js'),
	fs = require('node-fs'),
	csv = require('csv');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('winedb', server,  {safe:true});
exports.db = db;
 
db.open(function(err, db) {

  if(err) {
  		console.log(err);
      // hier stand der code für leere DBs
      
  }else{

    db.collection('script', {safe:true}, function(err, collection) {        
        console.log("The 'script' collection doesn't exist. Creating it with sample data...");
        populateScript();
        
    });
    db.collection('users', {safe:true}, function(err, collection) {        
        console.log("The 'users' collection doesn't exist. Creating it with sample data...");
        userMgmt.loadUserTable();
    });
    db.collection('groups', {safe:true}, function(err, collection) {        
        console.log("The 'groups' collection doesn't exist. Creating it with sample data...");
        userMgmt.loadGroupTable();
    });
    db.collection('videos', {safe:true}, function(err, collection) {        
        console.log("The 'videos' collection doesn't exist. Creating it with sample data...");
        if(!err){
        	//loadVideoTable();
        }
    });
    db.collection('messages', {safe:true}, function(err, collection) {        
        console.log("The 'messages' collection doesn't exist. Creating it with sample data...");
        if(!err){
         	//populateMessages();
        } 
    });
  }  
});
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAll = function(req, res) {
    db.collection('wines', function(err, collection) {
        collection.find().toArray(function(err, items) {
        console.log("wines?");
            //res.send(items);
            //res.send(JSON.stringify(items));
            
            res.type('application/json');
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.getScript = function(req, res) {
	db.collection('script', function(err, collection) {
  	collection.find().toArray(function(err, items) {
    	res.type('application/json');
		 	var 
				date = new Date(), 
				p = 3;
			if(date.getMonth() == 11){
				switch(date.getDate()){
					case 5: p=0; break;
					case 6: p=0; break;
					case 7: p=0; break;
					case 8: p=1; break;
					case 9: p=1; break;
					case 10: p=2; break;
					case 11: p=2; break;
					case 12: p=3; break;
					default : p = 3;
				}
			}
      items[0]['current_phase'] = p;
      console.log('PHASE == ' + p);
    	res.jsonp(items);  //items is the object
		});
	});
};

exports.getUsers = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.type('application/json');
            for (var i = 0; i < items.length; i++){
	            items[i].email = '<hidden>';
  	          items[i].password = '<hidden>';
  	        }  
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.getGroups = function(req, res) {
    db.collection('groups', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.type('application/json');
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.getVideos = function(req, res) {
    db.collection('videos', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.type('application/json');
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.getRelatedVideos = function(req, res) {
		var video_list = []
		var arr = (req.params.id).split(',')
    for(var i = 0, len = arr.length; i < len; i++){
    	video_list.push({id:arr[i]});
    }
    db.collection('videos', function(err, collection) {
        collection.find({ $or: video_list }).toArray(function(err, items) {
            res.type('application/json');
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.getVideoById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving video: ' + id);
    db.collection('videos', function(err, collection) {
			//        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			collection.findOne({'id':id}, function(err, item) {
      	res.send([item]);
     	});
    });
};


exports.updateVideoComments = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:{comments:video.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating video comments: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    });
}


exports.updateVideoTags = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:{tags:video.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating video tags: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    });
}
 

exports.updateVideoTOC = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:{toc:video.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating video TOC: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    });
} 

exports.updateVideoAssessment = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:{assessment:video.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating assessment: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    });
}

exports.updateUsers = function(req, res) {
    var id = req.params.id;
    var user = req.body;
    console.log('Updating users: ' + id);
    console.log(JSON.stringify(user));
    db.collection('users', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, {$set:{trace:user.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(user);
            }
        });
    });
} 


exports.getMessages = function(req, res) {
    db.collection('messages', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.type('application/json');
    				res.jsonp(items);  //items is the object
        });
    });
};

exports.addMessage = function(req, res) {
    var message = req.body;
    console.log('Adding message: ' + JSON.stringify(message));
    db.collection('messages', function(err, collection) {
        collection.insert(message.data, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
} 

exports.addVideo = function(req, res) {
    var video = req.body;
    console.log('Adding message: ' + JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.insert(video.data, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send('done');
            }
        });
    });
}

 
 
 
// examples 
exports.addWine = function(req, res) {
    var wine = req.body;
    console.log('Adding wine: ' + JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.insert(wine, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}
 
exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, wine, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating wine: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wine);
            }
        });
    });
}
 
exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
 
/*--------------------------------------------------------------------------------------------------------------------*/
 
 
// VI-SETTING
/*
1. get Widgets  => wird vom client gemeldet
2. load widgets options by type => wird vom client gefordert
3. render Form for each widget by its options 
-- woher kommen die label der Felder?
-- woher kommen die Hilfetexte der felder?
-- welche felder müssen ausgefült werden
4. make options accessible for client: GET /widget-options/[:widget]

*/ 
 
 
/* 
var schedule = require('node-schedule');
var date = new Date();
console.log(date.getYear()+'--'+date.getMonth()+'--'+date.getDay()+'--'+date.getHours()+':'+date.getMinutes());

 date = new Date(113, 11, 2, 23, 42, 0);
// 113--11--2--23:32

date=new Date();
date.setFullYear(2013,11,3,0,0,0);

var j = schedule.scheduleJob(date, function(){
	//var date = new Date();
	//console.log(date.getYear()+'--'+date.getMonth()+'--'+date.getDay()+'--'+date.getHours()+':'+date.getMinutes());
	console.log('....................The world is going to end today.');
});
*/

//var rule = new schedule.RecurrenceRule(); rule.second = 5;
//var jj = schedule.scheduleJob(rule, function(){
//    console.log('The answer to life, the universe, and everything!');
//});

 
 var populateScript = function(){
 
 
    var script = [
    {
    	current_phase : 0,
    	slides : false,
    	phases: [
    		{
    			title: "Phase 1 - Annotieren",
    			instruction: "Schauen Sie sich das Lernvideo an. Annotieren Sie Kapitelmarken und Schlüsselwörter in Abhängigkeit der Zeit. ",
    			title_k: "Aufgabe 1 - Annotieren",
    			instruction_k: "Schauen Sie sich die Lernvideos an. Annotieren Sie Kapitelmarken und Schlüsselwörter in Abhängigkeit der Zeit.",
    			seq : 0,
    			groupindex: 0,
    			widgets: [
		  			{ name: 'toc', accordion:true, annotate:true },
		  			{ name: 'tags', accordion:true, annotate:true },
		  			{ name: 'comments', accordion:true, annotate:true }
		  			// xlink, slides
		  		]	
    		},
    		{
    			title: "Phase 2 - Testfragen",
    			instruction: "Definieren Sie Testfragen, die mit Hilfe des Videos beantwortet werden können. ",
    			title_k: "Aufgabe 2 - Testfragen",
    			instruction_k: "Definieren Sie Testfragen, die mit Hilfe des jeweiligen Videos beantwortet werden können. ",
    			seq : 1,
    			groupindex: 0,
    			widgets: [
		  			{ name: 'toc', accordion:true, annotate:true },
		  			{ name: 'tags', accordion:true, annotate:true },
		  			{ name: 'comments', accordion:true, annotate:true },
		  			{ name: 'assessment', accordion:true, annotate:true }
    			]
    		},
    		{
    			title: "Phase 3 - Testdurchführung",
    			title_k: "Aufgabe 3 - Testdurchführung",
    			instruction: "Schauen Sie sich das Lernvideo ihrer Partnergruppe ('Related Videos') an und beantworten Sie die darin definierten Aufgaben.",
    			instruction_k: "Schauen Sie sich die Lernvideos noch einmal an und beantworten Sie die von anderen erstellten Aufgaben.",
    			seq : 2,
    			groupindex: 1,
    			widgets: [
		  			{ name: 'toc', accordion:true, annotate:true },
		  			{ name: 'tags', accordion:true, annotate:true },
		  			{ name: 'comments', accordion:true, annotate:true },
		  			{ name: 'assessment', accordion:true, annotate:true }
		  		]	
    		},
    		{
    			title: "Phase 4 - Diskussion & Feedback",
    			instruction: "Nutzen Sie die Gelegenheit die hinzugekommenen Lernvideos anzusehen, absolvieren Sie weitere Tests und geben Sie anderen ein Feedback zu ihren abgegebenen Lösungen (unter 'Messages'). Überarbeiten Sie gegebenenfalls die Videos.",
    			title_k: "Aufgabe 4 - Diskussion & Feedback",
    			instruction_k: "Nutzen Sie die Gelegenheit die anderen Lernvideos anzusehen, absolvieren Sie weitere Tests und geben Sie anderen ein Feedback zu ihren abgegebenen Lösungen (unter 'Messages'). Überarbeiten Sie gegebenenfalls die Videos.",
    			seq : 3,
    			groupindex: 2,
    			widgets: [
		  			{ name: 'toc', accordion:true, annotate:true },
		  			{ name: 'tags', accordion:true, annotate:true },
		  			{ name: 'comments', accordion:true, annotate:true },
		  			{ name: 'assessment', accordion:true, annotate:false }
		  		]	
    		},
    		{
    			title: "Experimentalsetting",
    			instruction: "",
    			seq : 4,
    			groupindex: 1,
    			widgets: [
		  			{ name: 'toc', accordion:true, annotate:true },
		  			{ name: 'tags', accordion:true, annotate:true },
		  			{ name: 'comments', accordion:true, annotate:true },
		  			{ name: 'assessment', accordion:true, annotate:true }
		  		]	
    		}
    	]
    }
    
    ];

    db.collection('script', function(err, collection) {
        collection.remove();
         console.log("Removed script");
    });
    db.collection('script', function(err, collection) {
        collection.insert(script, {safe:true}, function(err, result) {});
    });
 
};



/***************************************************/
/* VIDEO MGMT */

	var videos = [];

/* Load user data from csv file. Insert data into database **/
loadVideoTable = function(){
	
	// read file
	fs.readFile(__dirname+'/videos.csv', function read(err, data) {
		csv().from.string(data, {comment: '#'} )
			.to.array( function(data){
				//console.log(data);
				// groups = [];
				var fileformat = 'webm';
				var remote_server = 'http://141.46.8.101/beta/scm-lab2/';
				// define group for each line
				for(var i = 1; i < data.length; i++){
					//console.log(data[i]);
					var v = {
						id : data[i][0],
						metadata:[{
							author: data[i][1],
							institution: data[i][2],
							title: data[i][3],
							category: data[i][4],
							abstract: data[i][5],
							length: data[i][6],
							date: "2013/12/04",
							weight: 0,
							source: data[i][8],
						}],
						progress : "",
						video: remote_server+'videos/'+data[i][7]+'.'+fileformat, //"http://127.0.0.1/video_warehouse_management_systeme.webm",
						thumbnail: 'img/video-icons/'+data[i][7]+'.png',
						tags:[],
						comments:[],
						assessment:[],
						toc:[],
						links:[]
					};
					//console.log(JSON.stringify(v));
					//console.log('..................');
					videos.push(v);
					
				}// end for
				// insert into database   
				db.collection('videos', function(err, collection) {
				    collection.remove();
				    console.log("Removed videos");
				});
				db.collection('videos', function(err, collection) {
				    collection.insert(videos, {safe:true}, function(err, result) {});
				    console.log("Added videos");
				});	
			});// end read
	});// end csv
};
	var videosxxx = [
	
			{
				"id" : "5294bc22985254e831000002",
				"metadata":[{
					"author": "Prof. Peter Greistorfer (Universität Graz)",
					"institution": "Universität Graz, Österreich",
					"title": "Grundlagen der Produktion und Logistik (A)",
					"category": "Grundlagen",
					"abstract": "--",
					"length": 42.53,
					"date": "2011/07/01",
					"weight": 1
				}],
				"progress" : "",
				"video": "http://127.0.0.1/video2.webm",
				"comments":[],
				"tags": [
					{"tagname":"drought","occ":[10]},
					{"tagname":"El Nino","occ":[20]},
					{"tagname":"La Nina","occ":[30]},
					{"tagname":"unguaged catchments","occ":[40]},
					{"tagname":"copula modelling","occ":[50]},
					{"tagname":"dendrohydrology","occ":[60]},
					{"tagname":"Ethiopia","occ":[10]}
				],
				"comments": [
					{"comment":"hallo welt", "start":"65","author":"thum.daniel","author":"1", "date":"2013-01-03 13:01:46"}			
				],
				"assessment":[],
				"toc": [
    		  {"label":"Outline","duration":1,"start":"64.200","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"1. Introduction","duration":1,"start":"98.640","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"2. Objectives","duration":1,"start":"195.960","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"3. Study Area","duration":1,"start":"324.080","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"4. Data and Methodology","duration":1,"start":"490.800","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"5. Results","duration":1,"start":"1329.800","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"6. Conclusions","duration":1,"start":"1730.160","author":"1", "date":"2013-01-03 13:01:46"},
    		  {"label":"References","duration":1,"start":"1805.000","author":"1", "date":"2013-01-03 13:01:46"}
				],
				"links":[
					{"type":"cycle","x":50,"y":88,"duration":"15.5","start":"00:01:21","id":"Hydrological droughts","seek":"00:19:36","duration2":"00:44:55","target":"cullmann","author":"1", "date":"2013-01-03 13:01:46"},
					{"type":"cycle","x":50,"y":88,"duration":"10","start":"00:03:21","id":"Ungauged catchment","seek":"00:49:29","duration2":"00:51:10","target":"saliha2","author":"1", "date":"2013-01-03 13:01:46"}
				]
			},
			{
				"id" : "2",
				"metadata":[{
					"author": "Prof. Dr. Eric Demaine (MIT)",
					"institution": "MIT, USA",
					"title": "Dynamic Graphs",
					"category": "Waste Water",
					"abstract": "This lecture iM.",
					"length": 80,
					"date": "2012/10/01",
					"weight": 5
				}],
				"progress" : "",
				"video": "http://127.0.0.1/video_graphen.webm",
				"tags":[{"tagname":"Ethiopia","occ":[0]}],
				"comments":[
					{"comment":"hallo welt", "start":"65","author":"thum.daniel","author":"1", "date":"2013-01-03 13:01:46"}			
				],
				"assessment":[ {
        "title": "%7B%22question%22%3A%22hello%22%2C%22answ%22%3A%5B%7B%22id%22%3A%22answ96%22%2C%22answ%22%3A%22e%22%2C%22questiontype%22%3A%22mc%22%7D%2C%7B%22id%22%3A%22answ62%22%2C%22answ%22%3A%22eeee%22%2C%22questiontype%22%3A%22mc%22%7D%5D%2C%22correct%22%3A%5B%5D%7D",
        "start": "2.54128",
        "author": "1",
        "date": "1386149521026"
      }],
				"toc":[],
				"links":[]
			},
			{
				"id" : "3",
				"metadata":[{
					"author": "Moritz Roidl (TU Darmstadt)",
					"institution": "Technische Universität Darmstadt",
					"title": "Warehouse-Management-Systeme",
					"category": "SCM",
					"abstract": "This lecture iM.",
					"length": 80,
					"date": "2012/10/01",
					"weight": 5
				}],
				"progress" : "",
				"video": "http://127.0.0.1/video_warehouse_management_systeme.webm",
				"tags":[],
				"comments":[
				{"comment":"hallo welt", "start":"65","author":"thum.daniel","author":"1", "date":"2013-01-03 13:01:46"}			
				],
				"assessment":[],
				"toc":[],
				"links":[]
			}
		];
		




/* 
* message types: // test result / feedback / mail
**/
var populateMessages = function(){
   
	var messages = [
    {
    	from : '1',
    	to : 'mix',
    	date : '1385849659158',
    	type : 'mail',
    	read : false, 
    	replied: false,
    	title : 'hello world',
    	content : 'nice world here'
    }
   ];
    	
	db.collection('messages', function(err, collection) {
      collection.remove();
      console.log("Removed messages");
  });
  db.collection('messages', function(err, collection) {
      collection.insert(messages, {safe:true}, function(err, result) {});
      console.log("Added messages");
  });
};  
