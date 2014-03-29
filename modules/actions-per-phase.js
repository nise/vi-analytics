/*

To visualize the amount of certain action that has been fulfiled in a certain phase data for a heatmap will be generated

file:///home/abb/Documents/www2/vi-analytics/results/heatmap-actions-per-phase.html

**/


exports.init = function(){

	var atpp = 'from_cat\tto_cat\tdegree\n';
	for(var phase in analysis.annotationtype_per_phase){
		for(var action in analysis.annotationtype_per_phase[phase]){
			if(action_filter.search(action) == false){ console.log('Unknown action: '+action); break;}
			atpp += action_filter.search(action) +'\t'+phase+'\t'+analysis.annotationtype_per_phase[phase][action]+'\n';
		}
	}
	write2file('heatmap-actions-per-phase.tsv', atpp);
	//console.log(atpp);
	
}
