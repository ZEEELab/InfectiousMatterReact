import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {InfectiousMatter, AgentStates, ContactGraph} from '../InfectiousMatter/simulation.js';
const Matter = require('matter-js');
const Viva = require('vivagraphjs');


const InfectiousMatterSimulation = ({InfectiousMatterRef, InfectiousMatterAPI, redraw_trigger, setWorldReadyTrigger, numMasked}) => {
    const sim_div = useRef(null);

    const setup_world = (num_to_mask) => {
        let res_prop = {
            type: "residence", 
            friction: 0.01,
            bounds: {
                min: {
                    x: 10,
                    y: 10,
                },
                max: {
                    x: 190,
                    y: 190,
                }
            }
        };

        let res_prop2 = {
            type: "residence", 
            friction: 0.02,
            bounds: {
                min: {
                    x: 10,
                    y: 210,
                },
                max: {
                    x: 190,
                    y: 390,
                }
            }
        };

        let res_prop3 = {
            type: "residence", 
            friction: 0.02,
            bounds: {
                min: {
                    x: 210,
                    y: 10,
                },
                max: {
                    x: 390,
                    y: 190,
                }
            }
        };

        let res_prop4 = {
            type: "residence", 
            friction: 0.02,
            bounds: {
                min: {
                    x: 210,
                    y: 210,
                },
                max: {
                    x: 390,
                    y: 390,
                }
            }
        };


        let res1 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop}});
        let res2 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop2}});
        let res3 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop3}});
        let res4 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop4}});

        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res1, num_agents: 100}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res2, num_agents: 100}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res3, num_agents: 100}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res4, num_agents: 100}});
        
        InfectiousMatterRef.current.add_event({time: 1000, callback: InfectiousMatterRef.current.new_migration_event(), recurring: true });
        
        
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_migration_link', payload: {from_location:res1.uuid, to_location:res2.uuid, num_agents:2}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_migration_link', payload: {from_location:res2.uuid, to_location:res3.uuid, num_agents:2}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_migration_link', payload: {from_location:res3.uuid, to_location:res4.uuid, num_agents:2}});
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_migration_link', payload: {from_location:res4.uuid, to_location:res1.uuid, num_agents:2}});
        
        //shuffle the agents
        Matter.Common.shuffle(InfectiousMatterRef.current.agents);
        InfectiousMatterAPI(InfectiousMatterRef, {type: 'set_num_mask', payload: {num_masked: num_to_mask}});
        console.log(num_to_mask);
    };

    useEffect(() => {

        let world_params = {
            num_residences: 1,
            residence_options: [],
            pop_size: 20,
            num_to_infect: 2,
            num_visitors: 0,
            residence_size: 100,
            residence_padding: 20
        
        };
        
        let simulation_params = {
            sim_time_per_day: 1000,
            agent_size: 4,
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
            movement_scale: 2.0,
        };
  
        let default_simulation_colors = {
            viva_colors: [0x9370DBff, 0x00FF00ff, 0xFFFF00ff, 0xFFA500ff, 0x0000FFff, 0xA9A9A9ff, 0xFF00FFff, 0x00CED1ff,0x98FB98ff, 0xCD853Fff],
            matter_colors: ["mediumpurple", "lime", "yellow", "orange", "blue", "darkgrey", "fuchsia", "darkturquoise", "palegreen", "peru"]
        }

        
        console.log('initalizing matter')

        InfectiousMatterRef.current = new InfectiousMatter(false, simulation_params, infection_params, default_simulation_colors);
        InfectiousMatterAPI(InfectiousMatterRef, {type:'setup_environment', payload:{sim_div:sim_div}});

        setup_world(numMasked);
        //InfectiousMatterAPI(InfectiousMatterRef, {type:'reset_simulator'});
        
    }, [])

    //redraw simulation if we get the triggers
    useLayoutEffect(()=> { 
        if(InfectiousMatterRef.current) {
            setup_world(numMasked);
            setWorldReadyTrigger( c => c+1);
        }
    }, [redraw_trigger])

    return (
        <div>
            <div ref={sim_div} style={{height:400, width:400}}>

            </div>
        </div>
        
    );

};

export default InfectiousMatterSimulation;
export {AgentStates, ContactGraph};
