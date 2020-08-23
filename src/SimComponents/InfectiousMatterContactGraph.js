import React, {useEffect, useState, useReducer, useRef, useLayoutEffect} from 'react';
import {AgentStates, ContactGraph} from '../InfectiousMatter/simulation.js';
import Agent from '../InfectiousMatter/agent.js';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Viva from 'vivagraphjs';

let viva_layout = Viva.Graph.Layout.forceDirected(ContactGraph, {
    springLength : 15,
    springCoeff : 0.00005,
    dragCoeff : 0.01,
    gravity : -1.5
});

let viva_graphics = Viva.Graph.View.webglGraphics();


const InfectiousMatterContactGraph = ({InfectiousMatterRef, InfectiousMatterAPI, redraw_graph_trigger}) => {
    const graph_div = useRef(null);

    useEffect( ()=> {
        console.log("initalizing viva graph");
        let viva_renderer = Viva.Graph.View.renderer(ContactGraph, {
            container: graph_div.current,
            graphics: viva_graphics,
            renderLinks: true,
            layout: viva_layout,
            interactive: 'node drag'
    
        });
        viva_renderer.run();
        for (let i=0; i < 30; i++) {
            viva_renderer.zoomOut();
        }
    }, []);

    useEffect ( () => {
        const color_agent = (agent) => {
            viva_graphics.getNodeUI(agent.uuid).color = agent.viva_color;
            viva_graphics.getNodeUI(agent.uuid).size = 40;
        }

        InfectiousMatterAPI(InfectiousMatterRef, {type: 'forEach_agents', payload:{callback:color_agent}})
    }, [redraw_graph_trigger])

    return (
        <div ref={graph_div} style={{width:400, height:400}} >
        </div>
    );
};

export default InfectiousMatterContactGraph;
