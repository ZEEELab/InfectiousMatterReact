import React, {useRef, useReducer} from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import InfectiousMatterSimulation, {AgentStates, ContactGraph} from './InfectiousMatterSimulation.js';
import InfectiousMatterPlot from './InfectiousMatterPlot.js';
import Matter from 'matter-js';

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

const InfectiousMatterReducer = (InfectiousMatterRef, action) => {
  if (action.type == 'setup') {
    console.log('trying to')
    let res_prop = {
      type: "residence", 
      friction: 0.02,
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
    
    let res = InfectiousMatterRef.current.add_location('residence', res_prop);
    for (let i=0; i< 50; i++) {
      InfectiousMatterRef.current.add_agent(res)
    }
    let random_agent = Matter.Common.choose(InfectiousMatterRef.current.agents);
    InfectiousMatterRef.current.expose_org(random_agent.body, AgentStates.S_INFECTED);
  }

  return InfectiousMatterRef;
};

const InfectiousMatterContainer = (props) => {
  const classes = useStyles();
  const InfectiousMatterRef = useRef(null);

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

  return (
    <div className="App">
      <Grid container direction="row" justify="center" alignItems="center" className={classes.root} spacing={3}>
        <Grid item>
          <Card className={classes.paper}>
            <InfectiousMatterSimulation 
                world_params={world_params} 
                simulation_params={simulation_params} 
                infection_params={infection_params}
                default_simulation_colors={default_simulation_colors}
                InfectiousMatterRef={InfectiousMatterRef}
                InfectiousMatterReducer={InfectiousMatterReducer}
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
    </div>
  )
}

export default InfectiousMatterContainer;
