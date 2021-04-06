import React, { useRef, useEffect, useReducer, useState, useLayoutEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Zoom from '@material-ui/core/Zoom';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { InfectiousMatter } from '../InfectiousMatter/simulation.js';
import InfectiousMatterSimulation, { AgentStates, ContactGraph } from './InfectiousMatterSimulation.js';
//import InfectiousMatterContactGraph from './InfectiousMatterContactGraph.js';
//import InfectiousMatterPlot from './InfectiousMatterPlot.js';
import Matter from 'matter-js';
import Slider from '@material-ui/core/Slider';
import BylineComponent from '../InfectiousMatter/LayoutComponents/byline.js';
import Link from '@material-ui/core/Link';

import { Scrollama, Step } from 'react-scrollama';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 0,
    minWidth: 800,
    position: 'relative',
  },
  headingPanel: {
    height: "100vh",
    minHeight: "600px",
    marginTop: "50vh",
  },
  contentPanel: {
    height: "100vh",
    minHeight: "200px",
  },
  subPanel: {
    height: "20vh",
    minHeight:300,
  },
  introFooter: {
    marginTop: "10vh",
  },
  stickyContent: {
    position: "sticky",
    top: 0,
  },
  sim_paper: {
    height: 160,
    width: 760,
    textAlign: 'center'
  }
}));

InfectiousMatter.prototype.mask_transmission_props = { self_protection: 0.05, others_protection: 0.5 };

//agent_a is always a susceptable exposed to an infected (agent_b)
InfectiousMatter.prototype.calc_prob_infection = function (agent_a_body, agent_b_body) {
  let default_infection_prob = this.infection_params.per_contact_infection;
  if (agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
    return default_infection_prob * (1 - this.mask_transmission_props.self_protection) * (1 - this.mask_transmission_props.others_protection);
  else if (agent_a_body.agent_object.masked && !agent_b_body.agent_object.masked)
    return default_infection_prob * (1 - this.mask_transmission_props.self_protection);
  else if (!agent_a_body.agent_object.masked && agent_b_body.agent_object.masked)
    return default_infection_prob * (1 - this.mask_transmission_props.others_protection);
  else if (!agent_a_body.agent_object.masked && !agent_b_body.agent_object.masked)
    return default_infection_prob;
}

const InfectiousMatterAPI = (InfectiousMatterRef, action) => {
  if (action.type == 'setup_environment') {
    InfectiousMatterRef.current.setup_renderer(action.payload.sim_div.current);
    InfectiousMatterRef.current.setup_matter_env();
  }
  if (action.type == 'update_infection_params') {
    if (action.payload.per_contact_infection) {
      InfectiousMatterRef.current.infection_params.per_contact_infection = action.payload.per_contact_infection;
    }
    if (action.payload.infectious_period_mu) {
      InfectiousMatterRef.current.infection_params.infectious_period_mu = action.payload.infectious_period_mu;
    }
  };
  if (action.type == 'update_mask_transmission_params') {
    if (action.payload.self_protection) {
      InfectiousMatterRef.current.mask_transmission_props.self_protection = action.payload.self_protection;
    }
    if (action.payload.others_protection) {
      InfectiousMatterRef.current.mask_transmission_props.others_protection = action.payload.others_protection;
    }
  }
  if (action.type == 'update_movement_scale') {
    if (action.payload.movement_scale) {
      InfectiousMatterRef.current.infection_params.movement_scale = action.payload.movement_scale;
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
  if (action.type == 'add_random_agent') {
    let random_res = Matter.Common.choose(InfectiousMatterRef.current.locations);
    let new_agent = InfectiousMatterRef.current.add_agent(random_res);

    //make new agent immune
    if (Matter.Common.random(0, 1) < random_res.immunized_frac) {
      InfectiousMatterRef.current.update_org_state(new_agent, AgentStates.IMMUNE);
    };

    if (action.payload && action.payload.callback && new_agent) {
      action.payload.callback(new_agent.agent_object);
    }
  }

  if (action.type == 'remove_random_agent') {
    let random_agent = Matter.Common.choose(InfectiousMatterRef.current.agents);
    InfectiousMatterRef.current.delete_agent(random_agent);
  }
  if (action.type == 'add_agents') {
    let new_agent = null;
    if (action.payload.residence && action.payload.num_agents) {
      for (let i = 0; i < action.payload.num_agents; i++) {
        new_agent = InfectiousMatterRef.current.add_agent(action.payload.residence)
        if (Matter.Common.random(0, 1) < action.payload.residence.immunized_frac) {
          InfectiousMatterRef.current.update_org_state(new_agent, AgentStates.IMMUNE);
        };
      }
    }
    if (action.payload.callback && new_agent) {
      action.payload.callback(new_agent.agent_object);
    }
  }
  if (action.type == 'map_agents') {
    return InfectiousMatterRef.current.agents.map((agent, agent_id) => action.payload.callback(agent, agent_id));
  }
  if (action.type == 'forEach_agents') {
    InfectiousMatterRef.current.agents.forEach((agent) => action.payload.callback(agent));
  }
  if (action.type == 'map_locations') {
    return InfectiousMatterRef.current.locations.map((loc, loc_idx) => action.payload.callback(loc, loc_idx));
  }
  if (action.type == 'forEach_location') {
    InfectiousMatterRef.current.locations.forEach((loc) => action.payload.callback(loc));
  }
  if (action.type == 'infect_random_agents') {
    if (action.payload.num_agents) {
      for (let i = 0; i < action.payload.num_agents; i++) {
        let random_agent = Matter.Common.choose(InfectiousMatterRef.current.agents);
        InfectiousMatterRef.current.expose_org(random_agent.body, AgentStates.INFECTED);
      }
    }
  }

  if (action.type == 'infect_random_agent_everywhere') {
    if (action.payload.num_agents) {
      InfectiousMatterRef.current.locations.forEach((loc) => {
        let random_agents = loc.try_getting_random_residents(action.payload.num_agents * 2);
        for (let i = 0; i < action.payload.num_agents; i++) {
          InfectiousMatterRef.current.expose_org(random_agents[i].body, AgentStates.INFECTED);
        }
      });
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
    return { state_counts: InfectiousMatterRef.current.state_counts, cur_time: InfectiousMatterRef.current.cur_sim_time / InfectiousMatterRef.current.simulation_params.sim_time_per_day };
  }
  if (action.type == 'set_num_mask') {
    // get current num of people masked
    let masked_list = [];
    let unmasked_list = [];
    InfectiousMatterRef.current.agents.forEach((agent) => {
      if (agent.masked) {
        masked_list.push(agent);
      }
      else {
        unmasked_list.push(agent);
      }
    });

    let cur_num_masked = masked_list.length;
    let num_needing_masks = action.payload.num_masked - cur_num_masked;
    if (num_needing_masks > 0) {
      for (let i = 0; i < num_needing_masks; i++) {
        unmasked_list[i].masked = true;
      }
    } else if (num_needing_masks < 0) {
      for (let i = 0; i < -num_needing_masks; i++) {
        masked_list[i].masked = false;
      }
    }
  }

  if (action.type == "set_pop_size") {
    //target pop size - current pop size:
    let num_to_add = action.payload.pop_size - InfectiousMatterRef.current.agents.length;

    if (num_to_add > 0) {
      for (let i = 0; i < num_to_add; i++) {
        InfectiousMatterAPI(InfectiousMatterRef, { type: 'add_random_agent' });
      }
    } else if (num_to_add < 0) {
      for (let i = 0; i < -num_to_add; i++) {
        InfectiousMatterAPI(InfectiousMatterRef, { type: 'remove_random_agent' });
      }
    }

  };
};



const InfectiousMatterContainer = (props) => {
  const classes = useStyles();
  const InfectiousMatterRef = useRef(null);

  const [locationImmunity, setLocationImmunity] = useState([0.1, 0.3, 0.5, 0.7, 0.9]);
  const [numMasked, setNumMasked] = useState(0);
  const [popSize, setPopSize] = useState(600);

  const [maskSelfProtection, setMaskSelfProtection] = useState(0.05);
  const [maskOthersProtection, setMaskOthersProtection] = useState(0.5);
  const [movementScale, setMovementScale] = useState(2.0);

  const [perContactInfection, setPerContactInfection] = useState(0.5);
  const [infectiousPeriodMean, setInfectiousPeriodMean] = useState(5);

  const [redraw_trigger, setRedrawTrigger] = useState(0);
  const [worldReadyTrigger, setWorldReadyTrigger] = useState(0);

  /* This is a bit annoying because immunity is being changed in the setup of the simulator
  which means we have to re-draw the element, and using the API doesn't make sense for these
  kinds of actions...

  I guess the right way would be to use useEffect and trigger on locationImmunity changes.
  */
  const resetImmunity = (immunity_values) => {
    setLocationImmunity(immunity_values);
    InfectiousMatterAPI(InfectiousMatterRef, { type: 'reset_simulator' });
    setRedrawTrigger(c => c + 1);
  };


  const resetSimulation = (e) => {
    setLocationImmunity([0.1, 0.3, 0.5, 0.7, 0.9]);
    InfectiousMatterAPI(InfectiousMatterRef, { type: 'reset_simulator' });
    setRedrawTrigger(c => c + 1);
  };

  const infectAgents = (numToInfect) => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      {
        type: 'infect_random_agent_everywhere',
        payload: {
          num_agents: numToInfect
        }
      });
  };

  //TODO All simulation changes in this code...
  const onStepEnter = ({ element, data, direction }) => {    
    console.log(data);
    if (data == "infect_agents") {
      infectAgents(1);
    }
    if (data == "infect_3_agents") {
      infectAgents(3);
    }
    if (data == "movement_reinfect") {
      resetSimulation("none");
      setMovementScale(4);
    }
    if (data == "single_immunity") {
      resetImmunity([0.5, 0.5, 0.5, 0.5, 0.5]);
      setMovementScale(1.5);
    }

  };

  function handlePopSizeSliderChange(event, newValue) {
    setPopSize(newValue);
  }

  function handleMovementScaleChange(event, newValue) {
    setMovementScale(newValue);
  }

  useEffect(() => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      { type: 'update_infection_params', payload: { per_contact_infection: perContactInfection } });
  }, [perContactInfection])

  useEffect(() => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      { type: 'update_infection_params', payload: { infectious_period_mu: infectiousPeriodMean } });
  }, [infectiousPeriodMean])

  useEffect(() => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      { type: 'update_mask_transmission_params', payload: { self_protection: maskSelfProtection } });
  }, [maskSelfProtection])

  useEffect(() => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      { type: 'update_mask_transmission_params', payload: { others_protection: maskOthersProtection } });
  }, [maskOthersProtection])

  useEffect(() => {
    InfectiousMatterAPI(
      InfectiousMatterRef,
      { type: 'update_movement_scale', payload: { movement_scale: movementScale } });
  }, [movementScale])

  useEffect(() => {
    InfectiousMatterAPI(InfectiousMatterRef, { type: 'set_num_mask', payload: { num_masked: numMasked } });
  }, [numMasked]);

  useEffect(() => {
    InfectiousMatterAPI(InfectiousMatterRef, { type: 'set_pop_size', payload: { pop_size: popSize } });
    setWorldReadyTrigger(c => c + 1);
  }, [popSize]);

  return (
  <div className="App">
    <Scrollama onStepEnter={onStepEnter} debug>
      <Step data={1} key={1}>
        <Container className={classes.headingPanel}>
          <Typography variant="h2" component="h2" gutterBottom>
            Our Race Towards Herd Immunity
          </Typography>

          <BylineComponent date="April 11th, 2021" />

          <Zoom in={true}>
            <Container className={classes.introFooter}>
                <Typography variant="h5" gutterBottom>
                  A year ago, I built <Link color="inherit" href="https://infectiousmatter.com">InfectiousMatter</Link> to help folks gain an intuition for disease transmission dynamics without having to wait and
                  learn from our own mistakes. A year later, we've all unfortunately learned more than expected.
                </Typography>

                <Link color="inherit" href="https://infectiousmatter.com">
                  <img src="static/teaser.png" height="300" />
                </Link>
            </Container>
          </Zoom>

        </Container>
      </Step>

      <Step data={2} key={2}>
        <Container className={classes.contentPanel}>

          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom className={classes.contentPanel}>
              Now we have multiple vaccines being administered around the world at (all things considered) incredible speeds. We're truely racing
              towards <i>herd immunity</i>. But how fast we get there and how many lives are saved along the way depend on
              the decisions we collectively make in the next few months.
            </Typography>
          </Container>

          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom className={classes.contentPanel}>
              At the start of (and throughout) the pandemic, limiting transmission has been critical to avoiding overwhelming our
              healthcare systems. Of course that is still the case, but now we have even more to gain (or to lose) by making
              hard choices in our final push towards a return to normalcy.
            </Typography>
          </Container>
        </Container>
      </Step>

      <Step data={3} key={3}>
        <Container className={classes.stickyContent}>
          <Grid container direction="row" justify="center" className={classes.root} spacing={3}>
            <Grid item>
              <Card className={classes.sim_paper}>
                <InfectiousMatterSimulation
                  InfectiousMatterRef={InfectiousMatterRef}
                  InfectiousMatterAPI={InfectiousMatterAPI}
                  redraw_trigger={redraw_trigger}
                  setWorldReadyTrigger={setWorldReadyTrigger}
                  numMasked={numMasked}
                  locationImmunity={locationImmunity}
                  popSize={popSize}
                />
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Step>

      <Step data={"infect_agents"} key={4}>
        <Container className={classes.subPanel}>
          <Typography>
            TODO Trigger 1: Automatically infect someone in each location
          </Typography>
        </Container>
      </Step>

      <Step data={"movement_reinfect"} key={5}>
        <Container className={classes.subPanel}>
          <Typography>
            TODO Trigger 2: Show how increasing agent movement increases spread across the board
          </Typography>
        </Container>
      </Step>
      <Step data={"infect_agents"} key={12}>
        <Container className={classes.subPanel}>
          <Typography>
            and infect...
          </Typography>
        </Container>
      </Step>

      <Step data={"single_immunity"} key={6}>
        <Container className={classes.subPanel}>
          <Typography>
            TODO Trigger 3: Focus on one level of immunity (say, 50%?) -- show how it's a stochastic process
          </Typography>
        </Container>
      </Step>
      <Step data={"infect_agents"} key={17}>
        <Container className={classes.subPanel}>
          <Typography>
            trigger infecton -- 
          </Typography>
        </Container>
      </Step>
      <Step data={"single_immunity"} key={8}>
        <Container className={classes.subPanel}>
          <Typography>
            TODO Trigger 3: show how increasing number of infections increases probability of epidemic, even with higher levels of immunity
          </Typography>
        </Container>
      </Step>
      <Step data={"infect_3_agents"} key={7}>
        <Container className={classes.contentPanel}>
          <Typography>
            TODO Trigger 3: show how increasing number of infections increases probability of epidemic, even with higher levels of immunity
          </Typography>
        </Container>
      </Step>
      


    </Scrollama>

</div>)
}

export default InfectiousMatterContainer;
