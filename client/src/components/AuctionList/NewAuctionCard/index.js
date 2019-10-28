import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
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
  },
  iconHover: {
    "&:hover": {
      color: "#3f51b5"
    },
    fontSize: "10em",
    marginLeft: "30%"
  }
});

function NewAuctionCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Link to={"/new-auction/"} className={classes.link}>
        <CardContent>
          <Icon className={classes.iconHover} color="action">
            add_circle
          </Icon>
        </CardContent>
      </Link>
    </Card>
  );
}

export default NewAuctionCard;
