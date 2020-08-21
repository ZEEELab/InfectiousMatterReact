import React, {useEffect, useState, useReducer} from 'react';
import Plot from 'react-plotly.js'; //TODO: use bundles to limit the size of this app
import {AgentStates} from '../InfectiousMatter/simulation.js';
import Agent from '../InfectiousMatter/agent.js';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

let get_fresh_traces = function() {
  let exposed = {
      x: [0],
      y: [0],
      stackgroup: 'one',
      name: "Exposed",
    marker: { color: "orange" }
  };

  let infected = {
    x: [0],
    y: [0],
    stackgroup: 'one',
    name: "Infected",
    marker: { color: "red" }
  };

  let recovered = {
    x: [0],
    y: [0],
    stackgroup: 'one',
    name: "Recovered",
    marker: { color: "green" }
  };

  let susceptible = {
      x: [0],
      y: [0],
      stackgroup: 'one',
      name: "Susceptable",
      marker: { color: "grey" }
  }
  let plot_data = [exposed, infected, recovered, susceptible];
  return plot_data;
}

let infection_layout = {
  margin: {
      l: 50,
      r: 10,
      b: 50,
      t: 10,
      pad: 10
    },
  showlegend: true,
  legend: {
      x:1,
      xanchor: 'right',
      y:1
  }, 
  xaxis: {
      title: "Days",
      rangemode: 'nonnegative'
  }, 
  yaxis: {
      title: "Count",
      rangemode: 'nonnegative'
  },
  width:500,
  height:500
};

const initial_traces = get_fresh_traces();

function reducer(state, action) {
  let new_state = [...state];
  switch (action.type) {
    case 'extend': {
      console.log(action.payload);
      new_state[0].x.push(action.payload.cur_time);
      new_state[0].y.push(action.payload.cur_state_counts[AgentStates.EXPOSED]);

      new_state[1].x.push(action.payload.cur_time);
      new_state[1].y.push(action.payload.cur_state_counts[AgentStates.S_INFECTED] + action.payload.cur_state_counts[AgentStates.A_INFECTED]);

      new_state[2].x.push(action.payload.cur_time);
      new_state[2].y.push(action.payload.cur_state_counts[AgentStates.RECOVERED]);

      new_state[3].x.push(action.payload.cur_time);
      new_state[3].y.push(action.payload.cur_state_counts[AgentStates.SUSCEPTIBLE]);

      // new_state[1].push(action.payload.state_counts[AgentStates.S_INFECTED] + action.state_counts[AgentStates.A_INFECTED]);
      // new_state[2].push(action.payload.state_counts[AgentStates.RECOVERED]);
      // new_state[3].push(action.payload.state_counts[AgentStates.SUSCEPTIBLE]);
      return new_state;
    }
    default: {

    }
  }
}

const InfectiousMatterPlot = ({InfectiousMatterRef, InfectiousMatterAPI}) => {

  const [plotTraces, dispatchTraces] = useReducer(reducer, initial_traces);
  const [plotRevision, setPlotRevision] = useState(0);
  let plot_data = get_fresh_traces();
  let plot_layout = infection_layout;

  const update_traces = () => {
    let api_return = InfectiousMatterAPI(InfectiousMatterRef, {type:'get_state_counts'});
    dispatchTraces({type: 'extend', payload:{cur_time: api_return.cur_time, cur_state_counts: api_return.state_counts}});
    setPlotRevision(p => p+1);
  };

  useEffect( () => {
    const interval = setInterval( ()=> {
      update_traces();
    }, 100);

    return () => clearInterval(interval);
  }, [])

  return (
    <Plot
      data={plotTraces}
      layout={{...plot_layout, datarevision:plotRevision}}
    />   
  );
};

export default InfectiousMatterPlot;
