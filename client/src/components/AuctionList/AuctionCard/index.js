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
    display: "inline-block",
    margin: 20
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
    float: "right"
  }
});

function AuctionCard(props) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {props.title}
        </Typography>
        <Typography variant="body2" component="p" color="textSecondary">
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
