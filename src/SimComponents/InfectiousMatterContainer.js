import React, {useRef, useEffect, useReducer, useState, useLayoutEffect} from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { InfectiousMatter} from '../InfectiousMatter/simulation.js';
import InfectiousMatterSimulation, {AgentStates, ContactGraph} from './InfectiousMatterSimulation.js';
import InfectiousMatterContactGraph from './InfectiousMatterContactGraph.js';
import InfectiousMatterMigrationTable from './InfectiousMatterMigrationTable';
import InfectiousMatterVirPlot from './InfectiousMatterVirPlot';
import InfectiousMatterPlot from './InfectiousMatterPlot.js';
import Matter from 'matter-js';
import Slider from '@material-ui/core/Slider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import MaterialTable from 'material-table';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 0,
    minWidth:1200
  },
  controlls: {
    width:600,
  },
  paper: {
    minHeight: 400,
    minWidth: 400,
    textAlign: 'center',
  },
  paperControlls: {
    minHeight: 400,
    minWidth: 400,
    textAlign: 'center',
    padding: theme.spacing(2)
  }
}));

InfectiousMatter.prototype.mask_transmission_props = { self_protection:0.05, others_protection:0.5};

InfectiousMatter.prototype.calc_prob_infection = function(agent_a_body, agent_b_body) {

}

//agent_a is always a susceptable exposed to an infected (agent_b)
InfectiousMatter.prototype.calc_prob_infection = function(agent_a_body, agent_b_body) {
  let default_infection_prob = this.infection_params.per_contact_infection;
  
  if(this.infection_params.use_pathogen_contagiousness) {
    default_infection_prob = agent_b_body.agent_object.pathogen.contagiousness;
  }
  if(agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
      return default_infection_prob * (1-this.mask_transmission_props.self_protection) * (1-this.mask_transmission_props.others_protection);
  else if (agent_a_body.agent_object.masked &&! agent_b_body.agent_object.masked)
      return default_infection_prob * (1-this.mask_transmission_props.self_protection);
  else if (!agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
      return default_infection_prob * (1-this.mask_transmission_props.others_protection);
  else if (!agent_a_body.agent_object.masked &&! agent_b_body.agent_object.masked)
      return default_infection_prob;
}

const InfectiousMatterAPI = (InfectiousMatterRef, action) => {
  if (action.type == 'setup_environment') {
    InfectiousMatterRef.current.setup_renderer(action.payload.sim_div.current);
    InfectiousMatterRef.current.setup_matter_env();
  }
  if (action.type == 'update_mask_transmission_params') {
    if(action.payload.self_protection) {
      InfectiousMatterRef.current.mask_transmission_props.self_protection = action.payload.self_protection;
    }
    if(action.payload.others_protection) {
      InfectiousMatterRef.current.mask_transmission_props.others_protection = action.payload.others_protection;
    }
  }
  if (action.type == 'update_movement_scale') {
    if(action.payload.movement_scale) {
      InfectiousMatterRef.current.infection_params.movement_scale = action.payload.movement_scale;
    }
  }
  if (action.type == 'update_pathogen_mut_prob') {
    if (action.payload.pathogen_mut_prob != undefined) {
      InfectiousMatterRef.current.infection_params.pathogen_mut_prob = action.payload.pathogen_mut_prob;
    }
  }
  if (action.type == 'reset_simulator') {
    InfectiousMatterRef.current.clear_simulator();
    InfectiousMatterRef.current.setup_matter_env();
  }
  if (action.type == 'add_location') {
    let res = InfectiousMatterRef.current.add_location('residence', action.payload.residence_props)
    return res;
  }
  if (action.type == 'add_agents') {
    let new_agent = null;
    if (action.payload.residence && action.payload.num_agents) {
      for (let i=0; i< action.payload.num_agents; i++) {
        new_agent = InfectiousMatterRef.current.add_agent(action.payload.residence)
      }
    }
    if (action.payload.callback && new_agent) {
      action.payload.callback(new_agent.agent_object); 
    }
  }
  if (action.type == 'map_agents') {
    return InfectiousMatterRef.current.agents.map( (agent, agent_id) => action.payload.callback(agent, agent_id));
  }
  if (action.type == 'forEach_agents') {
    InfectiousMatterRef.current.agents.forEach( (agent) => action.payload.callback(agent));
  }
  if (action.type == 'map_locations') {
    return InfectiousMatterRef.current.locations.map( (loc, loc_idx) => action.payload.callback(loc, loc_idx));
  }
  if (action.type == 'forEach_location') {
    InfectiousMatterRef.current.locations.forEach( (loc) => action.payload.callback(loc));
  }
  if (action.type == 'infect_random_agents') {
    if(action.payload.num_agents) {
      for(let i=0; i< action.payload.num_agents; i++) {
        let random_agent = Matter.Common.choose(InfectiousMatterRef.current.agents);
        InfectiousMatterRef.current.expose_org(random_agent.body, AgentStates.INFECTED);
      }
    }
  } 
  if (action.type == 'get_migration_links') {
    return InfectiousMatterRef.current.get_migration_links();
  }
  if (action.type == 'add_migration_link') {
    InfectiousMatterRef.current.add_migration_link(action.payload.from_location, action.payload.to_location, action.payload.num_agents)
  }
  if (action.type == 'clear_migration_links') {
    InfectiousMatterRef.current.migration_graph.clear();
  }
  if (action.type == 'remove_migration_link') {
    InfectiousMatterRef.current.remove_migration_link(action.payload.from_location, action.payload.to_location)
  }
  if (action.type == 'get_state_counts') {
    return {state_counts: InfectiousMatterRef.current.state_counts, cur_time: InfectiousMatterRef.current.cur_sim_time/ InfectiousMatterRef.current.simulation_params.sim_time_per_day};
  }
  if (action.type == 'set_num_mask') {
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
    //TODO: This crashes if num_to_mask is greater tha pop
    let cur_num_masked = masked_list.length;
    let num_needing_masks = Math.min(action.payload.num_masked - cur_num_masked, InfectiousMatterRef.current.agents.length);
    if (num_needing_masks > 0) {
      for(let i=0; i< num_needing_masks; i++) {
        unmasked_list[i].masked = true;
      }
    } else if (num_needing_masks < 0) {
      for(let i=0; i<-num_needing_masks; i++) {
        masked_list[i].masked = false;
      }
    }
    /*
    if (num_needing_masks > 0){
      for (let i=0; i < num_needing_masks; i++){
        let agent_to_mask = Matter.Common.choose(unmasked_list);
        if (agent_to_mask.masked == false){
          agent_to_mask.masked = true;
        }
      }
    }
    else if(num_needing_masks < 0){
      for (let i=0; i < -num_needing_masks; i++){
        let agent_to_unmask = Matter.Common.choose(masked_list);
        if (agent_to_unmask) {
          agent_to_unmask.masked=false;
        }
      }
    }
    */
  }
  if (action.type == 'update_infection_params') {
    if(action.payload.per_contact_infection) {
      InfectiousMatterRef.current.infection_params.per_contact_infection = action.payload.per_contact_infection;
    }
    if(action.payload.infectious_period_mu) {
      InfectiousMatterRef.current.infection_params.infectious_period_mu = action.payload.infectious_period_mu;
    }
  }
  if (action.type == 'update_agent_lifespan') {
    if(action.payload.agent_lifespan) {
      InfectiousMatterRef.current.simulation_params.agent_lifespan = action.payload.agent_lifespan;
    }
  }
};



const InfectiousMatterContainer = (props) => {
  const classes = useStyles();
  const InfectiousMatterRef = useRef(null);
  const [numMasked, setNumMasked] = useState(0);
  const [maskSelfProtection, setMaskSelfProtection] = useState(0.05);
  const [maskOthersProtection, setMaskOthersProtection] = useState(0.5);
  const [movementScale, setMovementScale] = useState(2.0);
  const [pathogenMutProb, setPathogenMutProb] = useState(0.5);

  const [agentLifespan, setAgentLifespan] = useState(50);
  const [perContactInfection, setPerContactInfection] = useState(0.5);
  const [infectiousPeriodMean, setInfectiousPeriodMean] = useState(5);

  const [redraw_trigger, setRedrawTrigger] = useState(0);
  const [worldReadyTrigger, setWorldReadyTrigger] = useState(0);

  const resetSimulation = (e) => {
    InfectiousMatterAPI(InfectiousMatterRef, {type: 'reset_simulator'});
    setRedrawTrigger(c=>c+1);
  }
  const infectAgent = (e) => {
    InfectiousMatterAPI(
      InfectiousMatterRef, 
      {
        type: 'infect_random_agents', 
        payload: {
          num_agents: 1
        }
      });
  }

  function handleNumMaskedSliderChange(event, newValue){
    setNumMasked(newValue);
  }
  function handleMaskSelfProtectionChange(event, newValue) {
    setMaskSelfProtection(newValue);
  }
  function handleMaskOthersProtectionChange(event, newValue) {
    setMaskOthersProtection(newValue);
  }
  function handleMovementScaleChange(event, newValue) {
    setMovementScale(newValue);
  }
  function handlePerContactInfectionChange(event, newValue) {
    setPerContactInfection(newValue);
  }

  function handleInfectiousPeriodMean(event, newValue) {
    setInfectiousPeriodMean(newValue);
  }  

  function handleAgentLifespanChange(event, newValue) {
    setAgentLifespan(newValue);
  }

  function handlePathogenMutProbChange(event, newValue) {
    setPathogenMutProb(newValue);
  }

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef, 
      {type: 'update_mask_transmission_params', payload: {self_protection: maskSelfProtection}});
  }, [maskSelfProtection])

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef,
      {type: 'update_pathogen_mut_prob', payload: {pathogen_mut_prob: pathogenMutProb}});
  }, [pathogenMutProb]);

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef, 
      {type: 'update_mask_transmission_params', payload: {others_protection: maskOthersProtection}});
  }, [maskOthersProtection])

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef, 
      {type: 'update_movement_scale', payload: {movement_scale: movementScale}});
  }, [movementScale])

  useEffect( () => {
    InfectiousMatterAPI(InfectiousMatterRef, {type: 'set_num_mask', payload: {num_masked: numMasked}});
  }, [numMasked])

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef, 
      {type: 'update_infection_params', payload: {per_contact_infection: perContactInfection}});
  }, [perContactInfection])

  useEffect( () => {
    InfectiousMatterAPI (
      InfectiousMatterRef, 
      {type: 'update_infection_params', payload: {infectious_period_mu: infectiousPeriodMean}});
    }, [infectiousPeriodMean])

    useEffect( () => {
      InfectiousMatterAPI (
        InfectiousMatterRef,
        {type: 'update_agent_lifespan', payload: {agent_lifespan: agentLifespan}});
    }, [agentLifespan])

  return (
    <div className="App">
      <Grid container direction="row" justify="center" className={classes.root} spacing={3}>
        <Grid item>
        <Card className={classes.paper}>
          <InfectiousMatterSimulation 
            InfectiousMatterRef={InfectiousMatterRef}
            InfectiousMatterAPI={InfectiousMatterAPI}
            redraw_trigger={redraw_trigger}
            setWorldReadyTrigger={setWorldReadyTrigger}
            numMasked={numMasked}
          />
        </Card>
        </Grid>
        <Grid item>
          <Card className={classes.paper}>
            <InfectiousMatterContactGraph                 
              InfectiousMatterRef={InfectiousMatterRef}
              InfectiousMatterAPI={InfectiousMatterAPI} 
              worldReadyTrigger={worldReadyTrigger}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container direction="row" justify="center" className={classes.root} spacing={3}>
        <Grid item>
          <Card className={classes.paper}>
          <InfectiousMatterPlot                 
            InfectiousMatterRef={InfectiousMatterRef}
            InfectiousMatterAPI={InfectiousMatterAPI}
            redraw_trigger={redraw_trigger}
          />
          </Card>
        </Grid>

        <Grid item>
          <Card className={classes.paper}>
            <InfectiousMatterVirPlot
              InfectiousMatterRef={InfectiousMatterRef}
              InfectiousMatterAPI={InfectiousMatterAPI}
              redraw_trigger={redraw_trigger}
            />
          </Card>
        </Grid>
      </Grid>

      <Grid container direction="row" justify="center" className={classes.root} spacing={10}>
        <Grid item >
        <Card className={classes.paper}>
          <List>
          <ListSubheader disableSticky={true}>World Settings</ListSubheader>
      
          <ListItem>
            <ListItemText id="Movement" primary="Movement Scale" />
            <Slider
              value={movementScale}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="on"
              onChange={handleMovementScaleChange}
              step={0.25}
              min={0}
              max={10}
            />
          </ListItem>

          <ListItem>
            <ListItemText id="lifespan" primary="Agent Lifespan" />
              <Slider
                value={agentLifespan}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="on"
                onChange={handleAgentLifespanChange}
                step={5}
                min={5}
                max={200}
              />
          </ListItem>

          <ListSubheader disableSticky={true}>Infection Settings</ListSubheader>
          <ListItem>
            <ListItemText id="infectiousPeriod" primary="Mean Infectious Days" />
              <Slider
                value={infectiousPeriodMean}
                aria-labelledby="continuous-slider"
                onChange={handleInfectiousPeriodMean}
                valueLabelDisplay="on"
                min={3}
                max={12}
                step={0.1}
              />
          </ListItem>
          <ListItem>
            <ListItemText id="Masks" primary="Number Masked" />
              <Slider
                value={numMasked}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="on"
                onChange={handleNumMaskedSliderChange}
                step={1}
                min={0}
                max={630}
              />
          </ListItem>
          <ListItem>
            <ListItemText id="infectionRate" primary="Prob. Infection"/>
              <Slider
                value={perContactInfection}
                aria-labelledby="continuous-slider"
                onChange={handlePerContactInfectionChange}
                valueLabelDisplay="on"
                min={0}
                max={1}
                step={0.01}
              />
            </ListItem>
            <ListItem>
            <ListItemText id="pathogenMutProb" primary="Pathogen Mutation Rate"/>
              <Slider
                value={pathogenMutProb}
                aria-labelledby="discrete-slider"
                onChange={handlePathogenMutProbChange}
                valueLabelDisplay="on"
                min={0.00}
                max={1.0}
                step={0.1}
              />
            </ListItem>

          <ListItem>
            <Grid container direction="row" spacing={3}>
              <Grid item>
                <Button variant="contained" onClick={resetSimulation}>Reset</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={infectAgent}>
                  Infect Random Agent
                </Button>
              </Grid>
            </Grid>
          </ListItem>

          <ListSubheader disableSticky={true}>Mask Settings</ListSubheader>
          <ListItem>
            <ListItemText id="selfProtection" primary="Self Protection"/>
              <Slider
                value={maskSelfProtection}
                aria-labelledby="continuous-slider"
                onChange={handleMaskSelfProtectionChange}
                valueLabelDisplay="on"
                min={0}
                max={1}
                step={0.01}
              />
            </ListItem>
          <ListItem>
            <ListItemText id="othersProtection" primary="Others Protection" />
              <Slider
                value={maskOthersProtection}
                aria-labelledby="continuous-slider"
                onChange={handleMaskOthersProtectionChange}
                valueLabelDisplay="on"
                min={0}
                max={1}
                step={0.01}
              />
          </ListItem>
        </List>
      </Card>
        </Grid>
        
      <Grid item className={classes.controlls}>
        <InfectiousMatterMigrationTable             
          InfectiousMatterRef={InfectiousMatterRef}
          InfectiousMatterAPI={InfectiousMatterAPI}
          worldReadyTrigger={worldReadyTrigger}
        />
      </Grid>
    </Grid>
    </div>
  )
}

export default InfectiousMatterContainer;
