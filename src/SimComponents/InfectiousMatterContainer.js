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
};

const InfectiousMatterContainer = (props) => {
  const classes = useStyles();
  const InfectiousMatterRef = useRef(null);

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
    </div>
  )
}

export default InfectiousMatterContainer;
