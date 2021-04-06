import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth:300,
        minHeight:300,
    }, 
    controlls: {
      width:300,
    },
    paper: {
      height: 300,
      width: 300,
      textAlign: 'center',
    },
    sim_paper: {
      height:160,
      width:760,
      textAlign: 'center'
    },
    paperControlls: {
      minHeight: 300,
      minWidth: 300,
      textAlign: 'center',
      padding: theme.spacing(1)
    }
  }));

  const BylineComponent = (props) => {
    const classes = useStyles();

    return (
        <Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
            <Grid item>
                <Avatar src="static/lz_small.png" />
            </Grid>
            <Grid item>
                <Typography>
                    <Link color="inherit" href="https://infectiousmatter.com/index.html#about_me">Luis Zaman</Link>
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="overline" display="block">{props.date}</Typography>
            </Grid>
        </Grid>

    )
  };
export default BylineComponent;

