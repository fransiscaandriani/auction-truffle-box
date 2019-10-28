import React from "react";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";

const useStyles = makeStyles(theme => ({
  circleIcon: {
    "&:hover": {
      color: "#3f51b5"
    },
    fontSize: "40px",
    marginLeft: "10%",
    width: "100%"
  }
}));

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

export default function NewAuctionListItem() {
  const classes = useStyles();

  return (
    <ListItemLink href="/new-auction">
      <ListItemIcon>
        <AddCircleIcon className={classes.circleIcon} />
      </ListItemIcon>
    </ListItemLink>
  );
}
