import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import Paper from "@material-ui/core/Paper";
import NewAuctionListItem from "./NewAuctionListItem";

const mockAuction = {
  name: "Mock Auction with correct public key",
  desc: "Auction for testing purposes",
  bidEndTime: 1570406400,
  revealTime: 1570416400,
  winnerPaymentTime: 1570426400,
  maxBiddersCount: 20,
  fairnessFees: 5,
  passphrase: "abcdefgh",
  testing: true
};

const mockList = [mockAuction, mockAuction, mockAuction];

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.palette.background.paper,
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)"
  },
  container: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  title: {
    width: "100%",
    flexBasis: "100%",
    textAlign: "center",
    padding: 20
  }
}));

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

function AuctionListItem(props) {
  // need auction address here to link to individual auction page
  // can show picture too
  // or use a static icon
  return (
    <ListItemLink href="#simple-list" {...props}>
      <ListItemText primary={props.name} secondary={props.desc} />
    </ListItemLink>
  );
}

export default function MyAuctions() {
  const classes = useStyles();

  function renderAuctionListItems(auctionList) {
    const lastIndex = auctionList.length - 1;
    return auctionList.map((auction, i) => {
      // use address as key
      return <AuctionListItem {...auction} key={auction.name} divider />;
    });
  }

  return (
    <div className={classes.container}>
      <Typography className={classes.title} variant="h2" component="h1">
        My Auctions
      </Typography>
      <div className={classes.root}>
        <Divider />
        <List component="nav" aria-label="my auctions list">
          {renderAuctionListItems(mockList)}
          <NewAuctionListItem />
        </List>
        <Divider />
      </div>
    </div>
  );
}
