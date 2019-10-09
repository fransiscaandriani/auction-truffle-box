import React, { Component } from "react";
import Auction from "./contracts/Auction.json";
import Pedersen from "./contracts/Pedersen.json";
import { getWeb3 } from "./utils/getWeb3";
import {
  getAuctionFactoryContract,
  getAuctionContract,
  getPedersenContract
} from "./utils/getContracts";

import getCurrentAccount from "./utils/getCurrentAccount";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuctionList from "./components/AuctionList";
import AuctionPage from "./components/AuctionPage";
import TopAppBar from "./components/TopAppBar";
import CreateAuctionPage from "./components/CreateAuctionPage";
import {
  createAuction,
  getAllAuctionsData,
  getAuctionData
} from "./service/auctionService";
import { getMyBids, revealBid } from "./service/bidderService";
import "./App.css";
import {
  getWinner,
  claimWinner,
  prove,
  generateChallenges
} from "./service/auctioneerService.js";
class App extends Component {
  state = { storageValue: 0, web3: null, account: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Get the AuctionFactory contract instance.
      const instance = await getAuctionFactoryContract(web3);

      // Use web3 to get the user's account
      var account = await getCurrentAccount(web3);

      this.setState({ web3, account, contract: instance });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    this.runExample();
  };

  runExample = async () => {
    const { account, web3, contract } = this.state;

    // const auctionData = getAllAuctionsData(web3, contract);
    // console.log(auctionData)

    // const auctionData = await getAuctionData(
    //   web3,
    //   "0x3AA2CAf24E9C118fD9fe8bBE7648D8460A7CF49E",
    //   account
    // );

    // console.log(auctionData);
    // await contract.methods
    //   .placeBid(account, "0x3AA2CAf24E9C118fD9fe8bBE7648D8460A7CF49E")
    //   .send({ from: account });

    // const auctionAddresses = await contract.methods.allAuctions().call();
    // console.log(auctionAddresses);
    // const mybids = await getMyBids(web3, account);
    // console.log(mybids);

    // createAuction(account, web3, contract);

    // (async () => {
    //   const pedersen = await getPedersenContract(web3);
    //   console.log("pedersen", pedersen);

    //   const challenges = await generateChallenges(
    //     10,
    //     8231028394102943801238,
    //     19234092390412384981234091283,
    //     pedersen
    //   );
    //   console.log(challenges);
    //   await prove(web3, account, auction, pedersen, "abcdefgh");
    // })();

    const auction = await getAuctionContract(
      web3,
      "0x3AA2CAf24E9C118fD9fe8bBE7648D8460A7CF49E"
    );

    // const commit = await pedersen.methods
    //   .Commit(10000000000000, 22030291809)
    //   .call();
    // console.log(commit);

    const winner = await getWinner(auction, "abcdefgh");
    console.log(winner);

    // claimWinner(auction, winner, account);
    // const winner = await auction.methods.winner().call();
    // console.log("winner: ", winner);
    // const cipher =
    // "Xlr2A2hPnnkuRR7IewpmCSf549/rmF5Px23KBn6eChvFURgZ5bp8toPPUNzVzjkCyRUiFR6nuCCj57talhBgHox7kOlVkbP8DkVDTFzDCoTEd8UYyJ4sj5ejixZKEfG/KKbyRyvdQGZ6lo/pikqUXM3J5a71mL7p/za0EdFffGQ=?QC2jjOJ+m5MFsHf9ZbYKm3PU4kWEYBEyQZZ+x5oz7aA6YCc/wn+ix9RP0qdY2mC2";
    // revealBid(auction, account, cipher);
    // const bidderData = await auction.methods.BidderData(account).call();
    // console.log(bidderData);

    // // console.log(auction.methods.auctioneerRSAPublicKey().call());
    // console.log(
    //   auction.methods
    //     .bidders("0x23d35aC6cF2cCf7327079460B786e7aaC053C510")
    //     .call()
    // );

    // await auction.methods
    //   .Bid(commit.cX, commit.cY)
    //   .send({ from: accounts[0], value: 5000000000 });
    // await placeBid(account, web3, auction, web3.utils.toWei("5"));
    // console.log(auction.methods.bidders(account).call());

    // console.log(account);
    // Get the value from the contract to prove it worked.
    // const response = await contract.methods
    //   .bids("0x0cf10F3A684c9A4E080F34289995ff9cB3b352E0", 0)
    //   .call();
    // console.log(response);

    // Update state with the result.
    // this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Router>
          <div>
            {/* <nav>
          <ul>
            <li>
              <Link to="/auctions">Auctions</Link>
            </li>
          </ul>
        </nav> */}

            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/auctions">
                <TopAppBar />
                <AuctionList />
              </Route>
              <Route path="/auction/:address">
                <TopAppBar />
                <AuctionPage />
              </Route>
              <Route path="/new-auction">
                <TopAppBar />
                <CreateAuctionPage />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
