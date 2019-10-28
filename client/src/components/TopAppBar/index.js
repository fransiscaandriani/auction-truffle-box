import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import { Link } from "react-router-dom";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white",
    textDecoration: "none"
  },
  link: {
    textDecoration: "none"
  },
  button: {
    color: "white"
  }
}));

export default function ButtonAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Link to="/auctions" className={classes.title}>
            <Typography variant="h6">Blind Auction</Typography>
          </Link>
          <Link to="/my-auctions" className={classes.link}>
            <Button className={classes.button}>My Bids</Button>
          </Link>
        </Toolbar>
      </AppBar>
    </div>
  );
}
