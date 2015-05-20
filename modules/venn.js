/*
Venn Diagram
file:///home/abb/Documents/www2/vi-analytics/results/venn.html

**/


exports.init(){
	var 
		clicks = 0,
		anno = 0,
		fclicks = 0,
		fanno = 0
		;	
//	clicks: analysis.actions_per_phase[phase]++;
	for (var p in analysis.actions_per_phase){
		if (typeof analysis.actions_per_phase[p] == 'number'){
			clicks += analysis.actions_per_phase[p];
		}
	}
// annotation: analysis.annotations_per_user[user]++; 
	for(var u in analysis.annotations_per_user){ 
		if (typeof analysis.annotations_per_user[u] == 'number')
		anno += Number(analysis.annotations_per_user[u]);
	}
//	foreign clicks: analysis.group_user_clicks_elsewhere[group][user]++; 
	for(var g in analysis.group_user_clicks_elsewhere){
		for(var u in analysis.group_user_clicks_elsewhere[g]){
			fclicks += analysis.group_user_clicks_elsewhere[g][u];
		}
	}
//	foreign annotations: analysis.group_user_contributions_elsewhere[group][user]
		for(var g in analysis.group_user_contributions_elsewhere){
			for(var u in analysis.group_user_contributions_elsewhere[g]){
				fanno += analysis.group_user_contributions_elsewhere[g][u];
			}
		}
	console.log(clicks+'  '+anno+'  '+fclicks+'  '+fanno);
	console.log(clicks+'  '+anno/clicks+'  '+fclicks/clicks+'  '+fanno/clicks);
}	
