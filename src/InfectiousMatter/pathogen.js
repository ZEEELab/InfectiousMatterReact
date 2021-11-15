import { jStat } from 'jstat';

var uniqid = require("uniqid");



let _mutate_random = function(other_agent) {
	let new_color = other_agent.color_float + jStat.exponential.sample(8);
	let new_contagiousness = Math.max(Math.min(other_agent.contagiousness + jStat.normal.sample(0, 0.05), 1), 0);

	new_color = new_color % 1;
	//new_color = Math.random();

	this.color_float = new_color;
	this.contagiousness = new_contagiousness;
}

function Pathogen(color, parent, contagiousness) {
	this.parent = undefined;
	this.interaction_callback = undefined;
	this.uuid = uniqid()  ;
	this.color_float = color || Math.random();
	this.mutation_function = _mutate_random;
	this.contagiousness = contagiousness;
}

Pathogen.prototype.get_lifespan_multiplier = function() {
	// contagiousness varies between 0 - 1, 
	// (1 - contagiousness) * lifespan -> 
	return (1.01 - this.contagiousness)
}
Pathogen.prototype.get_offspring = function(mut_rate) {
	let offspring_color = this.color_float;
	let new_pathogen = new Pathogen(offspring_color);
	new_pathogen.contagiousness = this.contagiousness;
	
	if (Math.random() < mut_rate && this.mutation_function) {
		new_pathogen.mutation_function(this);
	}
	return new_pathogen;
};

export default Pathogen;
