import { jStat } from 'jstat';
import Pathogen from './pathogen.js';
import InfectiousMatterSimulation from '../SimComponents/InfectiousMatterSimulation.js';
var Matter = require('matter-js');
require('matter-wrap');
var { MatterCollisionEvents } = require('./MatterCollisionEvents.js');
Matter.use('matter-wrap', MatterCollisionEvents);

Matter._seed = 2;
Math.random = Matter.Common.random;
jStat._random_fn = Matter.Common.random;

var assert = require('assert');
// module aliases
let _Viva = require('vivagraphjs');
var ContactGraph = new _Viva.Graph.graph();

var Location = require('./location.js');
var Cohort = require('./cohort.js');
var EventQueue = require('./event_queue.js');

var Agent = require('./agent.js');

let colormap = require('colormap')
let colors = colormap( {
    colormap: 'chlorophyll',
    nshades: 9,
    format: 'hex',
    alpha: 1
});

let pathogen_colors = colormap({
    colormap: 'portland',
    nshades: 15,
    format: 'hex',
    alpha: 1
})

let interpolate = require('color-interpolate');
let pathogen_color_range = interpolate(['white']);

var AgentStates = {
    SUSCEPTIBLE: 0,
    INFECTED: 1,
    RECOVERED: 2,
    size: 3
};

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Body = Matter.Body;
var Bodies = Matter.Bodies;
var Bounds = Matter.Bounds;
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;
var Events = Matter.Events;


var default_simulation_params = {
    sim_time_per_day:1000,
    agent_size: 3,
    link_lifetime: 3000,
    pathogen_mut_prob: 0.3,
    agent_lifespan: 50,
};

var default_infection_params = {
    per_contact_infection: 0.5, 

    incubation_period_mu: 5,
    incubation_period_sigma: 3,
    
    infectious_period_mu: 7,
    infectious_period_sigma: 4,
    fraction_asymptomatic: 0.2,
    
    asymptomatic_infectious_period_mu: 1.5,
    asymptomatic_infectious_period_sigma: 1.5,

    fraction_seek_care: 0.5,
    fraction_isolate: 0.2,
    time_to_seek_care: 2.5,
    movement_scale: 0.2,
    use_pathogen_contagiousness: true
};

var default_simulation_colors = {
    viva_colors: [0x8B008Bff, 0x00FF00ff, 0xFFFF00ff, 0xFFA500ff, 0x0000FFff, 0xA9A9A9ff, 0xFF00FFff, 0x00CED1ff,0x98FB98ff, 0xCD853Fff],
    matter_colors: ["darkmagenta", "lime", "yellow", "orange", "blue", "darkgrey", "fuchsia", "darkturquoise", "palegreen", "peru"]
}

function InfectiousMatter(run_headless, simulation_params, infection_params, simulation_colors) {   
    this.simulation_params = Matter.Common.extend(default_simulation_params, simulation_params);
    this.infection_params = Matter.Common.extend(default_infection_params, infection_params);
    this.simulation_colors = Matter.Common.extend(default_simulation_colors, simulation_colors);
    this.matter_world = World.create() 
    this.headless = run_headless || false;
    this.pathogen_color_range = pathogen_color_range;    

    console.log("creating infectious matter environment!");

    this.matter_engine = Engine.create({
      positionIterations: 15, 
      velocityIterations: 15,
      constraintIterations: 10,
    });

    this.matter_engine.world.gravity.y = 0.00;
    this.event_queue = new EventQueue();
    this.migration_graph = new _Viva.Graph.graph()


}

InfectiousMatter.prototype.setup_renderer = function(div_ref) {
    let _div = div_ref;

    this.matter_render = Render.create({
        element: _div,
        engine: this.matter_engine,
        options: {
            height: _div.offsetHeight,
            width: _div.offsetWidth,
            background: 'rgba(229,229,229)',
            wireframes: false
        }
    });

    var mouse = Mouse.create(this.matter_render.canvas);
    
    this.mouseConstraint = MouseConstraint.create(this.matter_engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.1,
            render: {
                visible: true
            }
        }
    });
    
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    this.matter_render.mouse = mouse;  
    World.add(this.matter_engine.world, this.mouseConstraint);
    
    Render.run(this.matter_render);
    Engine.run(this.matter_engine);
}

InfectiousMatter.prototype.run_headless = function(timelimit) {
	timelimit = timelimit || 30;

	if(this.run_headless) {
        for(let t=0; t<timelimit*this.simulation_params.sim_time_per_day; t++) {
			//console.log("updating " + this.cur_sim_time);
			//console.log(this.state_counts);
	        this.event_queue.run_events_fired(this.cur_sim_time, 500);

            let temp_agent = Matter.Common.choose(this.agents);

            //console.log(temp_agent.body.position);

            Engine.update(this.matter_engine, 1000 / 60);
            this.cur_sim_time = this.matter_engine.timing.timestamp;
        }
	}
}


InfectiousMatter.prototype.setup_matter_env = function() {
    ContactGraph.clear();
    this.locations = [];
    
    this.migration_graph.clear();
    this.location_uuid_hash = {};

    this.agents = [];
    this.cohorts = [];
    this.cur_sim_time = 0;
    this.state_counts = [];
    this.matter_engine.timing.timestamp = 0;

    for (let i=0; i<AgentStates.size; i++){
        this.state_counts.push(0);
    }

   
    
    //Engine.run(this.matter_engine);
    //Render.run(this.matter_render);

    if(!this.headless) {
	    Events.on(this.matter_render, "beforeRender", (e) => {
	        this.cur_sim_time = e.timestamp;
	        this.event_queue.run_events_fired(this.cur_sim_time, 500);
	    });

	    Events.on(this.matter_render, "afterRender", (e) => {
	        let ctx = this.matter_render.context;
	        
	        if(ctx) {
	            //todo: refactor to callback
	            for (let i=0; i< this.locations.length; i++) {
	                this.locations[i].draw_borders(ctx);
                } 
                this.agents.forEach( (agent) => {
                    if(agent.masked){
                        agent.draw_mask(ctx, this.simulation_params.agent_size);
                    }
                });
	        }
	    });
    }

    this.add_event({time: 100, callback: this.pulse_orgs_event(), recurring:true, stale:false})

};

InfectiousMatter.prototype.update_org_state = function(org, new_state) {
    let old_state = org.agent_object.state;
    org.agent_object.state = new_state;

    if( typeof old_state !== 'undefined') this.state_counts[old_state] -= 1;
    
    this.state_counts[new_state] += 1;

    org.render.lineWidth = 3;
    let stroke_color = org.render.strokeStyle;
    let viva_node_color;

    //todo: refactor to callback?
    //refactor to event!
    switch(new_state) {
        case AgentStates.INFECTED:
            stroke_color = "red";
            viva_node_color = 0xFF0000ff;
            break;
            stroke_color = "red";
            viva_node_color = 0xFF0000ff;

            break;
        case AgentStates.RECOVERED:
            stroke_color = "blue";
            viva_node_color = 0xFFFFFFff;
            break;
        case AgentStates.SENSITIVE:
            org.render.lineWidth = 0;
            break;
        };

    org.render.strokeStyle = stroke_color;
    return org;
    //viva_graphics.getNodeUI(org.agent_object.node.id).color = viva_node_color;
};

InfectiousMatter.prototype.add_location = function(name, location_properties) {
    let new_location = new Location(name);
    new_location.border_color = location_properties.border_color;
    new_location.set_bounds(location_properties.bounds);
    new_location.friction = location_properties.friction;
    new_location.type = location_properties.type || 'none';

    new_location.home_color = this.simulation_colors.matter_colors[this.locations.length];
    new_location.viva_node_color = this.simulation_colors.viva_colors[this.locations.length];

    this.locations.push(new_location);
    this.location_uuid_hash[new_location.uuid] = new_location;
    return new_location;
};

InfectiousMatter.prototype.add_cohort = function() {
    let new_cohort = new Cohort();
    this.cohorts.push(new_cohort);
    return new_cohort;
};

InfectiousMatter.prototype.assign_cohort = function(org, cohort) {
    cohort.add_agent(org.agent_object);
};

InfectiousMatter.prototype.expose_org = function(org, eventual_infected_state, infecting_agent) {
    if (infecting_agent && infecting_agent.pathogen){ 
        org.agent_object.pathogen = infecting_agent.pathogen.get_offspring(this.simulation_params.pathogen_mut_prob);
    } else {
        org.agent_object.pathogen = new Pathogen(0.5, 'root', this.infection_params.per_contact_infection);
    }
    this.update_org_state(org, AgentStates.INFECTED);
    if (this.post_infection_callback) this.post_infection_callback(org.agent_object, infecting_agent);

    let days_to_recover = Math.max(jStat.exponential.sample(1/this.infection_params.infectious_period_mu), 3);
    let time_left = (org.agent_object.birthtime + org.agent_object.lifetime) - this.cur_sim_time

    if (org.agent_object.pathogen.get_lifespan_multiplier() * time_left < days_to_recover*this.simulation_params.sim_time_per_day) {
        let vir_death_event = {
            time: org.agent_object.pathogen.get_lifespan_multiplier() * time_left,
            callback: () => {
                this.delete_agent(org.agent_object)
            },
            stale: false
        }
        this.add_event(vir_death_event);
        org.agent_object.events.push(vir_death_event);

        var killed_masked = org.agent_object.masked;
        var killed_home = org.agent_object.home;

        //TODO: If we die by virulence, let's add a birth event here when the agent should have originally died.
        this.add_event( {
            time: time_left,
            callback: () => {
                let new_agent = this.add_agent(killed_home, AgentStates.SUSCEPTIBLE);
                new_agent.agent_object.masked = killed_masked;
            },
            stale: false
        })

    } else {
        let update_org_event = {
            time: days_to_recover*this.simulation_params.sim_time_per_day,
            callback: () => {
                this.update_org_state(org, AgentStates.RECOVERED);
                org.agent_object.pathogen = undefined;
            },
            stale: false,
        };
    
        this.add_event(update_org_event);
        org.agent_object.events.push(update_org_event);
    }





};

InfectiousMatter.prototype.register_infection_callback = function(callback) {
    this.post_infection_callback = callback;
};

InfectiousMatter.prototype._check_edge_for_removal = function(edge) {
    return () => {
        if (edge.data.timestamp < this.cur_sim_time - this.simulation_params.link_lifetime) {
            ContactGraph.removeLink(edge);
        } 
        else {
            this.add_event( {
                time:(this.cur_sim_time + this.simulation_params.link_lifetime) - edge.data.timestamp,
                callback: this._check_edge_for_removal(edge), 
                stale: false
            }); 
        }
    };
};

InfectiousMatter.prototype.calc_prob_infection = function(agent_a_body, agent_b_body) {
    if(this.infection_params.use_pathogen_contagiousness)
        return agent_b_body.agent_object.pathogen.contagiousness;
    else
        return this.infection_params.per_contact_infection;
}

InfectiousMatter.prototype._default_interaction_callback  = function(this_agent_body) {
    return (
        (other_agent) => {
            if (other_agent.state == AgentStates.INFECTED  && 
                this_agent_body.agent_object.state == AgentStates.SUSCEPTIBLE) {

                if (Matter.Common.random(0, 1) < this.calc_prob_infection(this_agent_body, other_agent.body)) {
                    //we're going to infect this org so 
                    //now we have to pick which state...

                    this.expose_org(this_agent_body, AgentStates.INFECTED, other_agent);
                    //this.`post_infection_callback`(this_agent.agent_object, other_agent);
                }
            }
            assert(other_agent.uuid && this_agent_body.agent_object.uuid)

            var this_edge = ContactGraph.hasLink(this_agent_body.agent_object.uuid, other_agent.uuid) || ContactGraph.hasLink(other_agent.uuid, this_agent_body.agent_object.uuid);
            if (this_edge){
                this_edge.data.timestamp = this.cur_sim_time;
            } else {
                assert(ContactGraph.hasNode(this_agent_body.agent_object.uuid) && ContactGraph.hasNode(this_agent_body.agent_object.uuid));
                this_edge = ContactGraph.addLink(this_agent_body.agent_object.uuid, other_agent.uuid, {origin:this_agent_body.agent_object.uuid, timestamp:this.cur_sim_time});
                this.add_event( {
                    time: this.simulation_params.link_lifetime+1, 
                    callback: this._check_edge_for_removal(this_edge),
                    stale: false
                });
            }

        }
    );
};

InfectiousMatter.prototype.add_agent = function(home_location, agent_state=AgentStates.SUSCEPTIBLE) {

    assert(home_location && home_location.get_random_position);

    let loc = home_location.get_random_position();
    //let new_agent_body = 
    let new_agent_body = Bodies.circle(loc.x, loc.y, this.simulation_params.agent_size, {plugin: {wrap: home_location.bounds}});
    new_agent_body.render.fillStyle = home_location.home_color || "black";
    new_agent_body.strokeStyle = "black";
    new_agent_body.lineWidth = 2;

    new_agent_body.agent_object = new Agent(new_agent_body);
    new_agent_body.frictionAir = home_location.friction;
    new_agent_body.friction = 0;
    new_agent_body.restitution = 1.1;
    new_agent_body.agent_object.home = home_location;
    new_agent_body.agent_object.viva_color = home_location.viva_node_color
    new_agent_body.agent_object.lifetime = jStat.exponential.sample(1/(this.simulation_params.agent_lifespan*this.simulation_params.sim_time_per_day));
    new_agent_body.agent_object.birthtime = this.cur_sim_time;
    new_agent_body.node = ContactGraph.addNode(new_agent_body.agent_object.uuid, {agent_object:new_agent_body.agent_object, viva_color:home_location.viva_node_color});

    home_location.add_agent(new_agent_body.agent_object);
    this.agents.push(new_agent_body.agent_object);
    this.update_org_state(new_agent_body, agent_state);

    new_agent_body.agent_object.register_interaction_callback(this._default_interaction_callback(new_agent_body, this.get_prob_of_infection));


    new_agent_body.onCollide( (pair) => {
        if (pair.bodyA === new_agent_body && pair.bodyB.agent_object) {
            pair.bodyA.agent_object.handle_agent_contact(pair.bodyB.agent_object);

        } else if (pair.bodyB === new_agent_body && pair.bodyA.agent_object) {
            pair.bodyB.agent_object.handle_agent_contact(pair.bodyA.agent_object)
        }
    });

    World.add(this.matter_engine.world, new_agent_body);
    
    // #### HANDLE BIRTH AND DEATH EVENTS ####
    //Death Event
    let agent_birth_death_event = {
        time: new_agent_body.agent_object.lifetime,
        callback: this._death_birth(new_agent_body.agent_object),
        recurring:false,
        stale:false
    };

    this.add_event(agent_birth_death_event);
    new_agent_body.agent_object.events.push(agent_birth_death_event);

    return(new_agent_body);
};

InfectiousMatter.prototype._death_birth = function(agent_to_remove) {
    return () => {
        let home_loc = agent_to_remove.home;
        let masked = agent_to_remove.masked;
        this.delete_agent(agent_to_remove);
        let new_agent = this.add_agent(home_loc);
        new_agent.agent_object.masked = masked;

    };
};


InfectiousMatter.prototype.delete_agent = function(an_agent) {
    an_agent.location.remove_agent(an_agent);

    this.agents = this.agents.filter(function(a) {
		return (a !== an_agent)
    });

    Matter.Composite.remove(this.matter_engine.world, an_agent.body);
    ContactGraph.removeNode(an_agent.uuid);

    this.state_counts[an_agent.state] -= 1;
    an_agent.events.forEach((event) => {event.stale = true;})
}

InfectiousMatter.prototype.add_event = function (q_item) {
    assert(q_item.time && q_item.callback);
    this.event_queue.add_event(this.cur_sim_time, q_item);
};

InfectiousMatter.prototype.set_agent_contact_callback = function (callback) {
    this.agent_contact_callback = callback;
};

InfectiousMatter.prototype.clear_simulator = function() {
    //Render.stop(this.matter_render);
    World.clear(this.matter_engine.world);
    Engine.clear(this.matter_engine);
    this.event_queue.clear_events();
}

InfectiousMatter.prototype.remove_simulator = function() {
    this.clear_simulator();
    Render.stop();

    this.matter_engine.events = {};
    this.matter_render.canvas.remove();
    this.matter_render.canvas = null;
    this.matter_render.context = null;
    this.matter_render.textures = {};

    this.matter_world = null;
    this.matter_engine = null;
    this.event_queue = null;
    this.matter_render = null;
    this.mouseConstraint = null;
}

InfectiousMatter.prototype.pulse_orgs_event = function() {
    return () => {
        if (this.agents.length > 0) {
            for (let i=0; i < 100; i++) {
                let temp_agent = Matter.Common.choose(this.agents);
                Matter.Body.applyForce(temp_agent.body, temp_agent.body.position, {
                    x:Matter.Common.random(-2e-5*this.infection_params.movement_scale, 2e-5*this.infection_params.movement_scale),
                    y:Matter.Common.random(-2e-5*this.infection_params.movement_scale, 2e-5*this.infection_params.movement_scale)
                });
            }
        }
    };
};

InfectiousMatter.prototype.get_migration_links = function() {
    let to_return = []
    this.migration_graph.forEachLink(function(link) {
        to_return.push({from_uuid:link.fromId, to_uuid:link.toId, num_agents:link.data.num_agents});
    });
    return to_return;
}
InfectiousMatter.prototype.add_migration_link = function(from_location_uuid, to_location_uuid, num_agents_per_day) {
    var existing_edge = this.migration_graph.hasLink(from_location_uuid, to_location_uuid);
    if(existing_edge) {
        existing_edge.data.num_agents = num_agents_per_day;
    } else {
        this.migration_graph.addLink(from_location_uuid, to_location_uuid, {num_agents:num_agents_per_day});
    }
};
InfectiousMatter.prototype.remove_migration_link = function(from_location_uuid, to_location_uuid) {
    var existing_edge = this.migration_graph.hasLink(from_location_uuid, to_location_uuid);
    if (existing_edge) {
        this.migration_graph.removeLink(existing_edge);
    }
};

//TODO: the migration events for new orgs goes away!!
InfectiousMatter.prototype.new_migration_event = function() {
    return () => {
        this.migration_graph.forEachLink((link) => {
            let source = this.location_uuid_hash[link.fromId];
            let dest = this.location_uuid_hash[link.toId];

            let to_migrate = source.try_getting_random_residents(link.data.num_agents);
            to_migrate.forEach( migrating_agent => {
                migrating_agent.home_state = {
                    location:source, 
                    position: {...migrating_agent.body.position}, 
                    velocity: {...migrating_agent.body.velocity}
                };

                source.migrate_to(dest, migrating_agent, function(agent) {
                    agent.body.plugin.wrap = dest.bounds;
                    Matter.Body.setPosition(agent.body, dest.get_random_position());
                    agent.body.frictionAir = dest.friction;
                    agent.migrating = true;
                });

                this.add_event( {
                    time: this.simulation_params.sim_time_per_day,
                    callback: () => {
                        dest.migrate_to(source, migrating_agent, (agent) => {
                            Matter.Body.setPosition(agent.body, migrating_agent.home_state.position);
                            agent.body.plugin.wrap = source.bounds;
                            Matter.Body.setVelocity(agent.body, migrating_agent.home_state.velocity);
                            agent.body.frictionAir = source.friction;
                            agent.migrating = false;
                        })
                    }, 
                    stale:false
                })
            } )

            //TODO: check if this link still makes sense, if not we should remove it...
        })
    }
};

export { InfectiousMatter, AgentStates, ContactGraph };
