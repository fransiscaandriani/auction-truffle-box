import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useEffect } from "react";
import AuctionCard from "./AuctionCard";
import { getAllAuctionsData } from "../../service/auctionService";
import { getLoadedWeb3 } from "../../utils/getWeb3";
import { getAuctionFactoryContract } from "../../utils/getContracts";

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
  const [auctionList, setAuctionList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get web3 instance.
        const loadedWeb3 = await getLoadedWeb3();

        // Get Auction Factory contract
        const contract = await getAuctionFactoryContract(loadedWeb3);

        // Get All Auctions
        const auctionsData = await getAllAuctionsData(contract);
        setAuctionList(auctionsData);
        console.log("auctionsdata:", auctionsData);
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
      const auctionCards = auctionList.map(auction => (
        <AuctionCard {...auction} key={auction.address} />
      ));
      return auctionCards;
    } else return null;
  };

  return (
    <div className={classes["page-container"]}>
      <Typography className={classes.title} variant="h2" component="h1">
        Auctions
      </Typography>
      {renderAuctions()}
      {/* <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} />
      <AuctionCard {...mockAuction} /> */}
    </div>
  );
}

export default AuctionList;
