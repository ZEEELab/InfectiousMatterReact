import React, { useEffect, useRef } from 'react';
import { Typography } from '@material-ui/core';
const Matter = require('matter-js');
const Viva = require('vivagraphjs');
var { InfectiousMatter, AgentStates, ContactGraph } = require('../InfectiousMatter/simulation.js');

InfectiousMatter.prototype.migrate_event = function(residences, num_visitors) {
    return () => {
        for (let i=0; i < num_visitors; i++) {
            let temp_agent = Matter.Common.choose(this.agents);
            if (temp_agent.migrating) continue;
            temp_agent.migrating = true;

            let temp_dest = Matter.Common.choose(residences);
            let agent_home = temp_agent.home || temp_agent.location;

            temp_agent.home_state = {position: temp_agent.body.position, velocity: temp_agent.body.velocity};

            temp_agent.location.migrate_to(temp_dest, temp_agent, function(agent) {
                    //update bounds...
                    agent.body.plugin.wrap = temp_dest.bounds;
                    Matter.Body.setPosition(agent.body, temp_dest.get_random_position());
                    agent.body.frictionAir = temp_dest.friction;
                }
            );
            
            this.add_event( {
                time: this.simulation_params.sim_time_per_day, 
                callback: function() {
                    temp_agent.location.migrate_to(agent_home, temp_agent, function(agent) {
                    //update bounds...
                        agent.body.plugin.wrap = agent_home.bounds;
                        Matter.Body.setPosition(agent.body, agent_home.get_random_position());
                        Matter.Body.setVelocity(agent.body, agent.home_state.velocity);
                        agent.body.frictionAir = agent_home.friction;
                        agent.migrating = false;
                    });
                }
            });

        }
    };
};

const InfectiousMatterSimulation = ({InfectiousMatterRef, InfectiousMatterAPI}) => {
    const sim_div = useRef(null);


    useEffect(() => {

        let world_params = {
            num_residences: 1,
            residence_options: [],
            pop_size: 20,
            num_to_infect: 2,
            num_visitors: 0,
            residence_size: 250,
            residence_padding: 20
        
        };
        
        let simulation_params = {
            sim_time_per_day: 1000,
            agent_size: 3,
            link_lifetime: 200,
        };
        simulation_params.link_lifetime = 7*simulation_params.sim_time_per_day;
        
        var infection_params = {
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
            movement_scale: 0.8,
        };
  
        let default_simulation_colors = {
            viva_colors: [0x9370DBff, 0x00FF00ff, 0xFFFF00ff, 0xFFA500ff, 0x0000FFff, 0xA9A9A9ff, 0xFF00FFff, 0x00CED1ff,0x98FB98ff, 0xCD853Fff],
            matter_colors: ["mediumpurple", "lime", "yellow", "orange", "blue", "darkgrey", "fuchsia", "darkturquoise", "palegreen", "peru"]
        }

        
        console.log('here')
        InfectiousMatterRef.current = new InfectiousMatter(false, simulation_params, infection_params, default_simulation_colors);
        InfectiousMatterRef.current.setup_renderer(sim_div.current);
        InfectiousMatterRef.current.setup_matter_env()        


        
        let res_prop = {
            type: "residence", 
            friction: 0.02,
            bounds: {
                min: {
                    x: 10,
                    y: 10,
                },
                max: {
                    x: 150,
                    y: 150,
                }
            }
        };

        let res_prop2 = {
            type: "residence", 
            friction: 0.02,
            bounds: {
                min: {
                    x: 180,
                    y: 180,
                },
                max: {
                    x: 320,
                    y: 320,
                }
            }
        };

        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_residence', payload:{residence_props: res_prop}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_residence', payload:{residence_props: res_prop2}});

        let temp_res = InfectiousMatterRef.current.locations[0];
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: temp_res, num_agents: 100}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'infect_random_agents', payload:{num_agents: 2}});
        
        temp_res = InfectiousMatterRef.current.locations[1];
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: temp_res, num_agents: 100}});

        InfectiousMatterRef.current.add_event({time: 1000, callback: InfectiousMatterRef.current.migrate_event(InfectiousMatterRef.current.locations, ), recurring: true });
    })

    return (
        <div ref={sim_div} style={{height:500, width:500}}>

        </div>
    );

};

export default InfectiousMatterSimulation;
export {AgentStates, ContactGraph};
