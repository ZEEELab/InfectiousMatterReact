import React, { useRef, useEffect, useReducer, useState, useLayoutEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Zoom from '@material-ui/core/Zoom';
import Paper from '@material-ui/core/Paper';

import Grow from '@material-ui/core/Grow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import FlashOnIcon from '@material-ui/icons/FlashOn';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { InfectiousMatter } from '../InfectiousMatter/simulation.js';
import InfectiousMatterSimulation, { AgentStates, ContactGraph } from './InfectiousMatterSimulation.js';
//import InfectiousMatterContactGraph from './InfectiousMatterContactGraph.js';
//import InfectiousMatterPlot from './InfectiousMatterPlot.js';
import Matter from 'matter-js';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';


import BylineComponent from '../InfectiousMatter/LayoutComponents/byline.js';
import Link from '@material-ui/core/Link';

import { Scrollama, Step } from 'react-scrollama';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 0,
    minWidth: 600,
  },
  Typography: {

  },
  headingPanel: {
    marginTop: "50vh",
  },
  contentPanel: {
    marginTop: "40vh",
    minHeight: "80vh",
  },
  subPanel: {
    marginTop:"10vh",
    minHeight: "20vh",
  },
  introFooter: {
    marginTop: "10vh",
  },
  stickyContent: {
    marginTop:"3vh",
    position: "sticky",
    top: 0,
    zIndex:2000,
  },
  topPadding: {
    marginTop:"15px",
  },
  sim_paper: {
    height: 160,
    width: 760,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:"1vh",
  },
  slider: {
    minWidth:150,
  },
  controlCard: {
    minWidth:300,
    padding:5,
    margin:"10vw",

  },
  sim_card:{
    minWidth:760,
    padding:3,
    zIndex:-1000,
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
  const [popSize, setPopSize] = useState(600);


  const [movementScale, setMovementScale] = useState(2.0);

  const [redraw_trigger, setRedrawTrigger] = useState(0);
  const [worldReadyTrigger, setWorldReadyTrigger] = useState(0);

  const [reveal_1, setReveal_1] = useState(false);
  const [reveal_2, setReveal_2] = useState(false);
  const [reveal_3, setReveal_3] = useState(false);


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
    resetImmunity([0.1, 0.3, 0.5, 0.7, 0.9]);
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
    if (direction == "up") return;
    console.log(data);

    if (data == "show_movement_fig") {
      setReveal_1(true)
    }
    if (data == "show_1_v_3_fig") {
      setReveal_2(true);
    }
    if (data == "show_sim") {
      resetSimulation("none");
      setMovementScale(2.0);
      setReveal_3(true);
    }
    if (data == "infect_agents") {
      infectAgents(1);
    }
    if (data == "infect_3_agents") {
      resetImmunity([0.5, 0.5, 0.5, 0.5, 0.5]);
      setMovementScale(1.5);
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
      { type: 'update_movement_scale', payload: { movement_scale: movementScale } });
  }, [movementScale])

  useEffect(() => {
    InfectiousMatterAPI(InfectiousMatterRef, { type: 'set_pop_size', payload: { pop_size: popSize } });
    setWorldReadyTrigger(c => c + 1);
  }, [popSize]);

  return (
  <div className="App">
    <Scrollama offset={0.5} onStepEnter={onStepEnter}>
      <Step data={1} key={1}>
        <Container className={classes.headingPanel}>
          <Typography variant="h2" component="h2" gutterBottom>
            Our Race Towards Herd Immunity
          </Typography>

          <BylineComponent date="April 9th, 2021" />
        </Container>
      </Step>

      <Step data={2} key={2}>
        <Container>
        <Grow in={true}>
            <Container className={classes.subPanel}>
                <Typography variant="h5" gutterBottom>
                  A year ago, I built <Link color="inherit" href="https://infectiousmatter.com">InfectiousMatter</Link> to help folks gain an intuition for disease transmission dynamics without having to wait and
                  learn from our own mistakes. A year later, we've all unfortunately learned more than expected.
                </Typography>
                  <Link color="inherit" href="https://infectiousmatter.com">
                    <img src="static/teaser.png" width="80%" />
                  </Link>
            </Container>
          </Grow>

          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom className={classes.subPanel}>
              Now we have multiple vaccines being administered around the world at incredible speeds (all things considered). We're truly racing
              towards <i>herd immunity</i>. But how fast we get there and how many lives are saved along the way depend on
              the decisions we collectively make in the next few months.
            </Typography>
          </Container>

        </Container>
  
      </Step>

      <Step data={123} key={123}>
        <Container>
          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom>
              What is herd immunity anyway? 
            </Typography>
            <Typography variant="body1" gutterBottom>
                Roughly speaking, it's the proportion of immune people needed to prevent a pathogen from spreading through a population. 
                The exact proportion depends on several details of the pathogen and the population. For SARS-CoV-2, we'll probably need to reach between 70% - 80% immune. 
                There was a <Link href="https://www.npr.org/sections/health-shots/2021/02/18/967462483/how-herd-immunity-works-and-what-stands-in-its-way">really neat interactive</Link> on NPR that goes into more detail about herd immunity that's worth checking out! 
            </Typography>

            <Typography variant="h6" gutterBottom>
                However, our extreme focus on immunization is overshadowing another major challenge. 
            </Typography>

            <Typography variant="body1" gutterBottom>
              Don't get me wrong, vaccination absolutely deserves the attention and effort it's getting right now.
              But it isn't our only hurdle left. With a large increase in infections here in Michigan and around the world,
              our ability to end disease spread by reaching herd immunity alone will be challenging. 
            </Typography>

          </Container>
        </Container>  
      </Step> 

      <Step data={"show_sim"}>
        <Container>
          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom>
              Exploring Herd Immunity
            </Typography>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              Let's use this interactive epidemic simulator to build our intuition for what herd immunity is, and what it isn't. As you scroll, you'll see a simulation appear where lots of grey balls are bouncing around in boxes. 
              These bouncing balls represent individuals, and each box represents a different independent community. If you missed the <Link href="https://infectiousmatter.com">original walk-through for InfectiousMatter</Link>, definitely check it out for a longer introduction to this kind
              of model of disease dynamics!
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              You might notice that there are different borders on some of the bouncing balls. The dark border indicates <b>Susceptible</b> individuals, while the lighter border depicts <b>Immune</b> individuals. 
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              The level of immunity in a particular community (i.e., box) is a gradient that increases as you move from the left (at 10% immune) to the far right (90% immunity). 
            </Typography>
          </Container>
        </Container>
      </Step>

      <Step data={3} key={3}>
        <Container className={classes.stickyContent}>
        <Zoom in={reveal_3}>
          <Card elevation={5} className={classes.sim_card}>
          <Grid container className={classes.root} alignItems="center" direction="column" justify="flex-start" spacing={0} margin={10}>

            <Grid item >
              <img src="static/legend.png" width={400} />
            </Grid>
            <Grid item >
                <Card className={classes.sim_paper}>

                    <InfectiousMatterSimulation
                      InfectiousMatterRef={InfectiousMatterRef}
                      InfectiousMatterAPI={InfectiousMatterAPI}
                      redraw_trigger={redraw_trigger}
                      setWorldReadyTrigger={setWorldReadyTrigger}
                      locationImmunity={locationImmunity}
                      popSize={popSize}
                    />

                </Card>
            </Grid>
          </Grid>
          </Card>

          </Zoom>

        </Container>

      </Step>

      <Step data={"infect_agents"} key={4}>
        <Container>
          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom>
              Introducing a Single Infection
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
             As you keep scrolling, you'll see a single individual turn red in each of the communities. This is an <b>Infected</b> agent that is capable of spreading infection to other susceptible individuals. 
             When infected agents recover, they retain a red border so you can easily see how big the epidemic was in each community. 
            </Typography>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              This simulation is running live in your browser window, and randomness means each time you visit the page something slightly different will happen. Hopefully you could see that the 
              pathogen doesn't really take hold in communities with high levels of immunity.
            </Typography>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              At the end of this walk-through, you'll have a chance to re-run this simulation and manipulate parameters to get a feeling for how they affect the pathogen spread!
            </Typography>

          </Container>
        </Container>


      </Step>

      <Step data={"movement_reinfect"} key={5}>
        <Container className={classes.headingPanel}>
          <Container>
          <Typography variant="h5" gutterBottom>
                Relaxed Social Distancing
              </Typography>

              <Typography variant="body1" gutterBottom className={classes.topPadding}>
                Pandemic burnout is real. And if you mix that with the nice weather, increasingly accessible vaccines, and easing restrictions, it's easy to imagine people also starting to relax their
                own cautious behaviors. 
              </Typography>

          </Container>
        </Container>
      </Step>



      <Step data={"infect_agents"} key={12}>
        <Container>
          <Container>
            <Typography variant="h5" gutterBottom className={classes.topPadding}>
              <br/>
              Now let's see what happens when we introduce a single infected individual. 
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              This time, you'll notice that more individuals ended up infected, and the pathogen might have spread in communities that were previously protected. 
            </Typography>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              That's because increasing interactions (<i>e.g.,</i> fewer masks, less social distancing) also increases the 
              amount of immunity required to protect a community. 
            </Typography>
          </Container>
        </Container>
      </Step>

      <Step data={"show_movement_fig"}>
        <Container className={classes.contentPanel}>
          <Container>
            <Typography variant="h6" gutterBottom className={classes.topPadding}>
              Illustration of Reruns
            </Typography>

            <Zoom in={reveal_1}>
              <div>
                <img src="static/normal_vs_high_movement.png" width="60%" className={classes.topPadding}/>
                <Typography variant="body1" gutterBottom className={classes.topPadding}>
                  Here I ran the first scenario (where individuals were moving <i>normally</i>) and the last one (where
                  individuals have a high rate of movement depicting relaxed social distancing) six times and stacked them up so you can
                  quickly see the differences! 
                  Notice how the level of immunity required to prevent most outbreaks shifts when social distancing is relaxed.
                </Typography>
                <Typography variant="body1" gutterBottom className={classes.topPadding}>
                  Each row is one time through the simulation you're running live in the browser. This is just meant to
                  convey the overall patterns, not be a side-by-side comparison. 
                </Typography>

              </div>
            </Zoom>
          </Container>
        </Container>
      </Step>




      <Step data={"single_immunity"} key={6}>
        <Container>
          <Container className={classes.subPanel}>
            <Typography variant="h5" gutterBottom className={classes.topPadding}>
              Focusing on Intermediate Immunity
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
             Let's slow things down and set the level of immunity to be 50% in every community. I'm doing this so you can see how 
              random chance plays a critical role in whether or not a large outbreak occurs when infections are introduced. 
          </Typography>

          </Container>
        </Container>
      </Step>
      <Step data={"infect_agents"} key={17}>
        <Container>
          <Container className={classes.topPadding}>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              When you scrolled here, we'll automatically infect a single agent in each population again. You'll hopefully see that some communities remain almost entirely untouched while others have large outbreaks. 
            </Typography>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              Remember that each community has the same amount of immunity, so the differences between outbreaks is entirely driven by chance! 
            </Typography>

            <div className={classes.subPanel}>
              <Typography variant="h5" gutterBottom >
                This is precisely why small changes in behavior can have HUGE effects on the severity of an outbreak when we are approaching herd immunity! 
              </Typography>
            </div>


          </Container>
        </Container>

      </Step>
      <Step data={"infect_3_agents"} key={8}>
      <Container>
          <Container>
            <Typography variant="h5" gutterBottom className={classes.topPadding}>
              For Example
            </Typography>

            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              Even a slight increase in the number of infections in a community can shift the balance towards larger outbreaks. 
          </Typography>

          </Container>
        </Container>
      </Step>
      <Step data={"something"} key={7}>
        <Container>
          <Container>
            <Typography variant="body1" gutterBottom className={classes.topPadding}>
              When we start with 3 infected individuals instead of 1, notice how the outbreaks are larger and more consistent. 
            </Typography>
          </Container>
        </Container>
      </Step>



      <Step data={"show_1_v_3_fig"}>
        <Container className={classes.contentPanel}>
          <Container>
            <Typography variant="h6" gutterBottom className={classes.topPadding}>
              Illustration of Reruns
            </Typography>

            <Zoom in={reveal_2}>
              <div>
                <img src="static/1_vs_3_infections.png" width="60%" className={classes.topPadding}/>
                <Typography variant="body1" gutterBottom className={classes.topPadding}>
                  In this visualization, I fixed the proportion of immune individuals at 50% and either infected a single 
                  individual, or 3 individuals. I did this six times, and stacked them up again to help see the overall pattern.
                  </Typography>
                  <Typography variant="body1" gutterBottom className={classes.topPadding}>

                  You can see that even a small change in the number of infections leads to larger and more frequent 
                  outbreaks. For example, notice how many populations completely avoided outbreaks on the left!
                </Typography>
              </div>
            </Zoom>
          </Container>
        </Container>
      </Step>






      <Step>
      <Container className={classes.subPanel}>
        <Container>
          <Typography variant="h4" gutterBottom color="secondary">
            Takeaway
          </Typography>
          <Typography variant="h6" gutterBottom className={classes.topPadding}>
            Vaccination absolutely works as a way to reduce the number and severity of disease outbreaks. But it isn't the only 
            ingredient needed to stop a pandemic. 
          </Typography>

          <Typography variant="h6" gutterBottom className={classes.topPadding}>
            As we rapidly approach herd immunity, controling the spread of outbreaks that are ongoing and preventing new ones from starting will be critical. 
            As you've now seen first hand, small effects are amplified when we're close to herd immunity, and that can 
            help us get back to normal faster — or not. 
          </Typography>
          <Typography variant="body1" gutterBottom className={classes.topPadding}>
            And don't forget to keep scrolling to rerun this simulation with more control!
          </Typography>
        </Container>
      </Container>
      </Step>

      <Step>
    <Container>
      <Container>
      <Card className={classes.controlCard}>
      <List component="div" dense> 
        <ListSubheader> Population Settings</ListSubheader>
        <ListItem>
          <ListItemText>Individual Movement</ListItemText>
          <ListItemSecondaryAction className={classes.slider}>
          <Slider
                value={movementScale}
                valueLabelDisplay="off"
                onChange={handleMovementScaleChange}
                step={0.25}
                min={0}
                max={10}
              />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider/>

        <ListSubheader>Reset Population</ListSubheader>
        <ListItem>
          <ListItemText primary="Reset With Immunity Gradient" secondary="(10% - 90%)"></ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => {resetSimulation()}} color="primary">
              <ReplayIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>

        <ListItem>
          <ListItemText>Reset All To 50% Immunity</ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => {resetImmunity([0.5, 0.5, 0.5, 0.5, 0.5])}} color="primary">
              <ReplayIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>

        <ListItem>
          <ListItemText>Reset All To 80% Immunity</ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => {resetImmunity([0.8, 0.8, 0.8, 0.8, 0.8])}} color="primary">
              <ReplayIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider/>

        <ListSubheader>Infection Actions</ListSubheader>
        <ListItem>
          <ListItemText primary="Infect One Individual" secondary="per population"></ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={()=>{infectAgents(1)}} color="secondary">
              <FlashOnIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="Infect Two Individuals" ></ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={()=>{infectAgents(2)}} color="secondary">
              <FlashOnIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="Infect Three Individuals"></ListItemText>
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={()=>{infectAgents(3)}} color="secondary">
              <FlashOnIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      </Card>
    </Container>
    </Container>
      </Step>
      <Step>
      <Container className={classes.subPanel}>
      
      </Container>
      </Step>
    </Scrollama>
    
</div>)
}

export default InfectiousMatterContainer;
