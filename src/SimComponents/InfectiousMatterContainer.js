import React, {useRef, useEffect, useReducer} from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { InfectiousMatter} from '../InfectiousMatter/simulation.js';
import InfectiousMatterSimulation, {AgentStates, ContactGraph} from './InfectiousMatterSimulation.js';
import InfectiousMatterPlot from './InfectiousMatterPlot.js';
import Matter from 'matter-js';
import Slider from '@material-ui/core/Slider';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minWidth:900,
  },
  paper: {
    height: 500,
    width: 500,
    textAlign: 'center'
  },
  control: {
    padding: theme.spacing(2),
  },
}));

//This feels hackish, but it's kinda nice
//agent_a is always a susceptable exposed to an infected (agent_b)
InfectiousMatter.prototype.calc_prob_infection = function(agent_a_body, agent_b_body) {
  if(agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
      return 0.2;
  else if (agent_a_body.agent_object.masked &&! agent_b_body.agent_object.masked)
      return 0.5;
  else if (!agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
      return 0.2;
  else if (!agent_a_body.agent_object.masked &&! agent_b_body.agent_object.masked)
      return 0.5;
}

const InfectiousMatterAPI = (InfectiousMatterRef, action) => {
  if (action.type == 'add_residence') {
    let res = InfectiousMatterRef.current.add_location('residence', action.payload.residence_props)
    return res;
  }
  if (action.type == 'add_agents') {
    if (action.payload.residence && action.payload.num_agents) {
      for (let i=0; i< action.payload.num_agents; i++) {
        InfectiousMatterRef.current.add_agent(action.payload.residence)
      }
    }
  }
  if (action.type == 'infect_random_agents') {
    if(action.payload.num_agents) {
      for(let i=0; i< action.payload.num_agents; i++) {
        let random_agent = Matter.Common.choose(InfectiousMatterRef.current.agents);
        InfectiousMatterRef.current.expose_org(random_agent.body, AgentStates.S_INFECTED);
      }
    }
  } 
  if (action.type == 'add_migration_link') {
    InfectiousMatterRef.current.add_migration_link(action.payload.from_location, action.payload.to_location, action.payload.num_agents)
  }
  if (action.type == 'set_num_mask') {
    let num_masked = action.payload.num_masked;
    // get current num of people masked
    let masked_list=[];
    let unmasked_list=[];
    InfectiousMatterRef.current.agents.forEach( (agent) => {
      if(agent.masked){
        masked_list.push(agent);
      }
      else{
        unmasked_list.push(agent);
      }
    });

    let cur_num_masked = masked_list.length;
    if (cur_num_masked < num_masked){
      for (let i=0; i<num_masked - cur_num_masked; i++){
        if (i>=unmasked_list.length) break;
        unmasked_list[i].masked = true;
      }
    }
    else if(cur_num_masked > num_masked){
      for (let i=0; i<cur_num_masked - num_masked; i++){
        if (i>=masked_list.length) break;
        masked_list[i].masked = false;
      }
    }
  }
};



const InfectiousMatterContainer = (props) => {
  const classes = useStyles();
  const InfectiousMatterRef = useRef(null);

  function handleSliderChange(event, newValue){
    InfectiousMatterAPI(InfectiousMatterRef, {type: 'set_num_mask', payload: {num_masked: newValue}});
  }

  return (
    <div className="App">
      <Grid container direction="row" justify="center" alignItems="center" className={classes.root} spacing={3}>
        <Grid item>
          <Card className={classes.paper}>
            <InfectiousMatterSimulation 
                InfectiousMatterRef={InfectiousMatterRef}
                InfectiousMatterAPI={InfectiousMatterAPI}
              />
          </Card>
        </Grid>
        <Grid item>
        <Card className={classes.paper}>
          <Typography>Hello</Typography>
        </Card>
        </Grid>
        <Grid item>
          <Card>
            <InfectiousMatterPlot />
          </Card>
        </Grid>
      </Grid>
      <div style={{width:'300px',margin:'100px'}}>
        <Slider
          defaultValue={0}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          onChange={handleSliderChange}
          step={1}
          marks
          min={0}
          max={100}
        />
      </div>
    </div>
  )
}

export default InfectiousMatterContainer;
