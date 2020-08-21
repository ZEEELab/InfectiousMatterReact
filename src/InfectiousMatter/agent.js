var uniqid = require("uniqid");

//TODO: Add multiple graphs, and subscribe events to them
//TODO: 

function Agent(body) {
	this.track_all_contacts = true;
	this.state = undefined;
	this.body = body;
	this.interaction_callback = undefined;
	this.uuid = uniqid();
	this.viva_color = undefined;

	this.location = undefined;
	this.home = undefined;
	this.cohorts = [];
	this.color = undefined;
	this.home_state = {};
	this.migrating = false;
	this.masked = false;
}

Agent.prototype.add_body = function(body) {
	this.body = body;
}

Agent.prototype.register_interaction_callback = function (interaction_callback) {
	this.interaction_callback = interaction_callback;
}

Agent.prototype.handle_agent_contact = function(other_agent) {
	this.interaction_callback(other_agent);
}

Agent.prototype.draw_mask = function(ctx, agent_size) {
	ctx.fillStyle = "#FFFFFF";
	ctx.strokeStyle="#000000";
	ctx.lineWidth = 1;
	ctx.fillRect(this.body.position.x-agent_size, this.body.position.y, agent_size*2, agent_size-1);
	ctx.strokeRect(this.body.position.x-agent_size, this.body.position.y, agent_size*2, agent_size-1);
	ctx.stroke()

}

module.exports = Agent;
