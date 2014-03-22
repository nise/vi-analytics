

exports.getViz = function(dataset, filename){
	if(dataset == undefined){
		dataset = "group,time,action\n71,1358442902881,3\n71,1358446735921,4";
	}	
	var fs = require('fs'),
	d3 = require('d3');

	Array.prototype.getUnique = function(){
		 var u = {}, a = [];
		 for(var i = 0, l = this.length; i < l; ++i){
		    if(u.hasOwnProperty(this[i])) {
		       continue;
		    }
		    a.push(this[i]);
		    u[this[i]] = 1;
		 }
		 return a;
	}

	var margin = {top: 20, right: 60, bottom: 30, left: 70},
		  width = 1160 - margin.left - margin.right,
		  height = 500 - margin.top - margin.bottom,
		  range_margin = 10;
		  
	var parseDate = d3.time.format("%S");  

	var x = d3.time.scale()
		  .range([range_margin, width + range_margin]);

	var y = d3.scale.ordinal()
		  .rangeRoundBands([0, height], 1);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
		  .scale(x)
		  .orient("bottom");

	var yAxis = d3.svg.axis()
		  .scale(y)
		  .orient("left");

	var svg = d3.select("body").append("svg")
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		.append("g")
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var groupss = [];
	
	var xx = require(filename);
	//d3.csv(filename, function(error, data) {
		var data = d3.csv.parse(xx);
		data.forEach(function(d) {
			//data.sort(function(a, b) { return b.group - a.group; }); //console.log('-------------------------------'+d.time);
			d.group = d.group;
			//var gro = d.group.toString().substr(1,1) == 0 ? "a" : "b";
			groupss.push("group " + d.group.toString().substr(0,1) ); 
			d.action = d.action >= 5 ? 5 : d.action; // hack aslong no detailed actions are known
			d.time = d.time;
		});
	 
	 	groupss = groupss.getUnique().sort();
	 	
	 	x.domain(d3.extent(data, function(d) { return d.time; })).nice();

		y.domain(groupss);

		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis)
		  .append("text")
		    .attr("class", "label")
		    .attr("x", width)
		    .attr("y", -6)
		    .style("text-anchor", "end")
		    .text("time");

		svg.append("g")
		    .attr("class", "y axis")
		    .call(yAxis)
		  .append("text")
		    .attr("class", "label")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
		    .text("")
	/*
		svg.selectAll(".dot")
		  .data(data)
		  .enter().append("circle")
		    .attr("class", "dot")
		    .attr("r", function(d){ return 3.5; }) // if( d.action === "5b" || d.action === "5a"){ return 3.5;} }
		    .attr("cx", function(d) { return x(d.time);} )  
		    .attr("cy", function(d) { return y(d.group); })
		    .style("fill", function(d) { return color(d.action); });
	*/		
	
		var sym = ["square","circle","diamond","cross","circle","diamond","triangle-up"]; 	
		svg.selectAll("path")
		  .data(data)						
			.enter().append("path")
		  	.attr("transform", function(d) { return "translate(" + x(d.time) + "," + y(d.group) + ")"; })
		  	.attr("d", d3.svg.symbol().type(function(d) { return sym[d.action]; }))
		  	.style("stroke", function(d) { return color(d.action); })
		  	.style("fill","none");					

		var legend = svg.selectAll(".legend")
		    .data(color.domain())
		  .enter().append("g")
		    .attr("class", "legend")
		    .attr("transform", function(d, i) { return "translate(60," + i * 20 + ")"; });
	/*
		legend.append("rect")
		    .attr("x", width - 18)
		    .attr("width", 18)
		    .attr("height", 18)
		    .style("fill", color);
	 */ 
		  legend.append("path")
		   .attr("transform", function(d) { return "translate(" + (width - 10) + "," + 7 + ")"; })
		   .attr("d", d3.svg.symbol().type(function(d,i) { return sym[d]; }))
		   .style("stroke", function(d){ return color(d)})
		   .style("fill", "none");    
	

		var function_arr = ['0','0','0','Popcorn Maker', 'Add tag/toc/comment', 'Assessment', 'correct', 'wrong', 'ass_finish'];

		legend.append("text")
		    .attr("x", width - 24)
		    .attr("y", 9)
		    .attr("dy", ".35em")
		    .style("text-anchor", "end")
		    .text(function(d) { return function_arr[d]; });
		    
		var phases = [1358249400000, 1358708400000, 1358940600000, 1359313200000];
												
		svg.selectAll(".line").data(phases).enter().append("line").attr("class","line") // 
		  .attr("x1", function(i, d){ return x(phases[d]);})
		  .attr("y1", 10)
		  .attr("x2", function(i, d){ return x(phases[d]);})
		  .attr("y2", 450)
		  .attr("stroke-width",1)
		 	.style("stroke", "rgb(200,200,200)");
		 

});
	
