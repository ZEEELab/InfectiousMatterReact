import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {InfectiousMatter, AgentStates, ContactGraph} from '../InfectiousMatter/simulation.js';
const Matter = require('matter-js');
const Viva = require('vivagraphjs');


const InfectiousMatterSimulation = ({InfectiousMatterRef, InfectiousMatterAPI, redraw_trigger, setWorldReadyTrigger, numMasked, popSize}) => {
    const sim_div = useRef(null);

    const setup_world = (num_to_mask) => {
        let res_prop1 = {
            type: "residence", 
            friction: 0.05,
            immunized_frac: 0.1,
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
        let res_prop2 = Matter.Common.clone(res_prop1);
        res_prop2.bounds.min.x = 160;
        res_prop2.bounds.max.x = 300;
        res_prop2.immunized_frac = 0.3;

        let res_prop3 = Matter.Common.clone(res_prop1);
        res_prop3.bounds.min.x = 310;
        res_prop3.bounds.max.x = 450;
        res_prop3.immunized_frac = 0.5;
        
        let res_prop4 = Matter.Common.clone(res_prop1);
        res_prop4.bounds.min.x = 460;
        res_prop4.bounds.max.x = 600;
        res_prop4.immunized_frac = 0.7;

        let res_prop5 = Matter.Common.clone(res_prop1);
        res_prop5.bounds.min.x = 610;
        res_prop5.bounds.max.x = 750;
        res_prop5.immunized_frac = 0.9;


        let res1 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop1}});
        let res2 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop2}});
        let res3 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop3}});
        let res4 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop4}});
        let res5 = InfectiousMatterAPI(InfectiousMatterRef, {type:'add_location', payload:{residence_props: res_prop5}});

        //TODO: add popSize agents...
        //let agent_callback = (t_agent) => {}
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res1, num_agents: popSize/5}});        
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res2, num_agents: popSize/5}});        
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res3, num_agents: popSize/5}});        
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res4, num_agents: popSize/5}});        
        InfectiousMatterAPI(InfectiousMatterRef, {type:'add_agents', payload:{residence: res5, num_agents: popSize/5}});        

        //shuffle the agents
        Matter.Common.shuffle(InfectiousMatterRef.current.agents);
        InfectiousMatterAPI(InfectiousMatterRef, {type: 'set_num_mask', payload: {num_masked: num_to_mask}});
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
            agent_size: 2,
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
            movement_scale: 1.0,
        };
  
        let grey_simulation_colors = {
            viva_colors: [0xA9A9A9ff, 0xA9A9A9ff, 0xA9A9A9ff, 0xA9A9A9ff, 0xA9A9A9ff, 0xA9A9A9ff, 0xA9A9A9ff],
            matter_colors: ["darkgrey","darkgrey", "darkgrey", "darkgrey", "darkgrey", "darkgrey", "darkgrey"]
        }

        
        console.log('initalizing matter')

        InfectiousMatterRef.current = new InfectiousMatter(false, simulation_params, infection_params, grey_simulation_colors);
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
            <div ref={sim_div} style={{height:160, width:'auto'}}>

            </div>
        </div>
        
    );

};

export default InfectiousMatterSimulation;
export {AgentStates, ContactGraph};
