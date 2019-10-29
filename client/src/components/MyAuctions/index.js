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
import Grid from "@material-ui/core/Grid";

const mockAuction = {
  name: "Unique painting by Kevin Drew",
  desc:
    "The tone of the painting is muted, the style reminiscent of Monet. Each stroke had a smudging quality that rendered the image watery, like a reflection in a rippled puddle. The scene is a street, London I'll bet, the umbrella bearing pedestrians battle against rain and the red double-deckers and black cabs rumble by. It reminds me of Oxford Street, looking out of a rain-splattered window at the rivers of people that moved in each direction. Like in this painting they moved so randomly, pushing against one another, flowing, like water. Perhaps to this artist that's what we are, small drops in a sky full of rain, each one looking out and saying to ourselves “Wow, that sure is a lot of rain.”",
  bidEndTime: 1570406400,
  revealTime: 1570416400,
  winnerPaymentTime: 1570426400,
  maxBiddersCount: 20,
  fairnessFees: 5,
  passphrase: "abcdefgh",
  testing: true
};

const mockList = [mockAuction];

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
      <ListItemText
        primary={props.name}
        secondary={props.desc}
        secondaryTypographyProps={{
          variant: "body2",
          component: "p",
          noWrap: true
        }}
      />
    </ListItemLink>
  );
}

export default function MyAuctions() {
  const classes = useStyles();

  function renderAuctionListItems(auctionList) {
    return auctionList.map((auction, i) => {
      // use address as key
      return <AuctionListItem {...auction} key={auction.name} divider />;
    });
  }

  function renderMyBidsList(auctionList) {
    const lastIndex = auctionList.length - 1;
    return auctionList.map((auction, i) => {
      // use address as key
      return (
        <AuctionListItem
          {...auction}
          key={auction.name}
          divider={lastIndex !== i}
        />
      );
    });
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
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
      </Grid>
      <Grid item xs={6}>
        <div className={classes.container}>
          <Typography className={classes.title} variant="h2" component="h1">
            My Bids
          </Typography>
          <div className={classes.root}>
            <Divider />
            <List component="nav" aria-label="my auctions list">
              {renderMyBidsList(mockList)}
            </List>
            <Divider />
          </div>
        </div>
      </Grid>
    </Grid>
  );
}
