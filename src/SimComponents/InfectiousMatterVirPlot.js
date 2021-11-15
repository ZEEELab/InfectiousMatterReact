import React, {useEffect, useState, useReducer, useLayoutEffect} from 'react';
import { jStat } from 'jstat';
import Plot from 'react-plotly.js'; //TODO: use bundles to limit the size of this app
import {AgentStates} from '../InfectiousMatter/simulation.js';

let get_fresh_traces = function() {
  let contagiousness = {
    x: [],
    name: "Contagiousness",
    type: 'histogram',
    //histnorm: 'probability',
    marker: { color: "grey" }
  };
  return [contagiousness];
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
      title: "Contagiousness",
      rangemode: 'nonnegative',
  }, 
  yaxis: {
      title: "Density",
      rangemode: 'nonnegative'
  },
  width:390,
  height:390
};

const initial_traces = get_fresh_traces();

function reducer(state, action) {
  if (!state) { console.log('didnt get state');}
  let new_state = [...state];
  switch (action.type) {
    case 'set': {
      new_state[0].x = action.payload.cur_contagousness;
      new_state[0].name = "Mean Contagiousness: " + jStat.mean(action.payload.cur_contagousness).toPrecision(3)
      return new_state;
    }
    case 'extend': {
      new_state[0].x.push(action.payload.cur_time);
      new_state[0].y.push(action.payload.cur_state_counts[AgentStates.INFECTED]);

      new_state[1].x.push(action.payload.cur_time);
      new_state[1].y.push(action.payload.cur_state_counts[AgentStates.RECOVERED]);

      new_state[2].x.push(action.payload.cur_time);
      new_state[2].y.push(action.payload.cur_state_counts[AgentStates.SUSCEPTIBLE]);

      // new_state[1].push(action.payload.state_counts[AgentStates.S_INFECTED] + action.state_counts[AgentStates.A_INFECTED]);
      // new_state[2].push(action.payload.state_counts[AgentStates.RECOVERED]);
      // new_state[3].push(action.payload.state_counts[AgentStates.SUSCEPTIBLE]);
      return new_state;
    }
    case 'reset': {
        new_state = get_fresh_traces();
        return new_state;
    }
    default: {

    }
  }
}

const InfectiousMatterVirPlot = ({InfectiousMatterRef, InfectiousMatterAPI, redraw_trigger}) => {

  const [plotTraces, dispatchTraces] = useReducer(reducer, initial_traces);
  const [plotRevision, setPlotRevision] = useState(0);
  let plot_data = get_fresh_traces();
  let plot_layout = infection_layout;

  useEffect( () => {
      const update_traces = () => {
        let get_contagousness = (agent, agent_id) => {
          if (agent.pathogen)
            return agent.pathogen.contagiousness
          return undefined
        }
        let api_return = InfectiousMatterAPI(InfectiousMatterRef, {type:'map_agents', payload: {callback:get_contagousness}});
        let cur_contagousness = api_return.filter(e => e != null);
        dispatchTraces({type: 'set', payload:{cur_contagousness: cur_contagousness}});
        setPlotRevision(p => p+1);
      };

    const interval = setInterval( ()=> {
      update_traces();
    }, 600);
    return () => { clearInterval(interval);};
  }, [redraw_trigger])

  //redraw plot if we get the triggers
  useLayoutEffect(()=> { 
    if(InfectiousMatterRef.current) {
        dispatchTraces({type:'reset'});
        setPlotRevision(p => p+1);
    }
  }, [redraw_trigger])

  return (
    <Plot
      data={plotTraces}
      layout={{...plot_layout, datarevision:plotRevision}}
    />
  );
};

export default InfectiousMatterVirPlot;
