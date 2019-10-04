import React from "react";
import AuctionCard from "./AuctionCard";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const mockAuction = {
  title: "Splendid Art",
  desc: "One of a kind classic painting from 1860 era"
};

const useStyles = makeStyles({
  title: {
    textAlign: "center",
    margin: 20
  },
  "page-container": {
    paddingLeft: 50,
    paddingRight: 50
  }
});

function AuctionList() {
  const classes = useStyles();

  return (
    <div className={classes["page-container"]}>
      <Typography className={classes.title} variant="h2" component="h1">
        Auctions
      </Typography>
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
    </div>
  );
}

export default AuctionList;
