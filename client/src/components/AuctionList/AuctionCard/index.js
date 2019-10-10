import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  card: {
    width: 400,
    height: 200,
    display: "inline-block",
    margin: 20,
    position: "relative"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  link: {
    textDecoration: "none"
  },
  action: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 10
    // float: "right"
  }
});

function AuctionCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2" noWrap={true}>
          {props.name}
        </Typography>
        <Typography
          variant="body2"
          component="p"
          color="textSecondary"
          noWrap={true}
        >
          {props.desc}
        </Typography>
      </CardContent>
      <CardActions className={classes.action}>
        <Link to="/auction" className={classes.link}>
          <Button size="small">View Auction</Button>
        </Link>
      </CardActions>
    </Card>
  );
}

export default AuctionCard;
