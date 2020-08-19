import React, { useEffect, useRef } from 'react';
import { Typography } from '@material-ui/core';
const Matter = require('matter-js');
const Viva = require('vivagraphjs');
var { InfectiousMatter, AgentStates, ContactGraph } = require('../InfectiousMatter/simulation.js');


const InfectiousMatterSimulation = ({InfectiousMatterRef, InfectiousMatterReducer}) => {
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
        InfectiousMatterReducer(InfectiousMatterRef, {type:'setup'})
        
    })

    return (
        <div ref={sim_div} style={{height:500, width:500}}>

        </div>
    );

};

export default InfectiousMatterSimulation;
export {AgentStates, ContactGraph};
