import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import AuctionCard from "./AuctionCard";
import { getAllAuctionsData } from "../../service/auctionService";
import { getLoadedWeb3 } from "../../utils/getWeb3";
import { getAuctionFactoryContract } from "../../utils/getContracts";

const mockAuction = {
  name: "Splendid Art",
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
  const [auctionList, setAuctionList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get web3 instance.
        const web3 = await getLoadedWeb3();
        // Get All Auctions
        setIsLoading(true);
        const auctionsData = await getAllAuctionsData(web3);
        setAuctionList(auctionsData);
        setIsLoading(false);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, contract, or auctions. Check console for details.`
        );
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const renderAuctions = () => {
    if (auctionList.length > 0) {
      const auctionCards = auctionList.map(
        auction => (console.log(auction), <AuctionCard {...auction} />)
      );
      return { auctionCards };
    } else return null;
  };

  if (isLoading) {
    return null;
  }
  return (
    <div className={classes["page-container"]}>
      <Typography className={classes.title} variant="h2" component="h1">
        Auctions
      </Typography>
      {console.log(auctionList.length)}
      {renderAuctions()}
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
    </div>
  );
}

export default AuctionList;
