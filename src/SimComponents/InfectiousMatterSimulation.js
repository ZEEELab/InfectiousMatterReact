import React, { useEffect, useRef } from 'react';
import { Typography } from '@material-ui/core';
const Matter = require('matter-js');
const Viva = require('vivagraphjs');
var { InfectiousMatter, AgentStates, ContactGraph } = require('../InfectiousMatter/simulation.js');


const InfectiousMatterSimulation = ({simulation_params, infection_params, default_simulation_colors, world_params, InfectiousMatterRef, InfectiousMatterReducer}) => {
    const sim_div = useRef(null);


    useEffect(() => {
        InfectiousMatterRef.current = new InfectiousMatter(false, simulation_params, infection_params, default_simulation_colors);
        InfectiousMatterRef.current.setup_renderer(sim_div.current);
        InfectiousMatterRef.current.setup_matter_env()
    }, [])

    return (
        <div ref={sim_div} style={{height:500, width:500}}>

        </div>
    );

};

export default InfectiousMatterSimulation;
export {AgentStates, ContactGraph};
