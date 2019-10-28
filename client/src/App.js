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
import MyAuctions from "./components/MyAuctions";
import {
  createAuction,
  getAllAuctionsData,
  getAuctionData
} from "./service/auctionService";
import {
  getMyBids,
  revealBid,
  refund,
  winnerPay
} from "./service/bidderService";
import "./App.css";
import {
  getWinner,
  claimWinner,
  prove,
  generateChallenges,
  verifyAll
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

    // const auctionData = await getAllAuctionsData(contract, [
    //   "0x3156bd1b8d109a42191a45d2c4e3f954e0ab3580"
    // ]);
    // console.log(auctionData);

    // console.log(auctionData);
    // await contract.methods
    //   .placeBid(account, "x1155aB8e49E82e1284d88588F8ea813f016bF95f")
    //   .send({ from: account });

    // const auctionAddresses = await contract.methods.allAuctions().call();
    // console.log(auctionAddresses);
    // const mybids = await getMyBids(web3, account);
    // console.log(mybids.length);

    // const address = await createAuction(account, web3, contract);
    // console.log(address);
    // (async () => {
    const pedersen = await getPedersenContract(web3);
    console.log("pedersen", pedersen);

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
      "0x3156BD1b8D109A42191a45D2C4E3f954E0aB3580"
    );

    const auctionData = await getAuctionData(
      web3,
      "0x3156BD1b8D109A42191a45D2C4E3f954E0aB3580",
      account
    );
    console.log(auctionData);
    // await winnerPay(web3, auction, account);
    // await verifyAll(auction, account);
    // const commitWinner = await pedersen.methods.Commit(10, 162039573).call();
    // console.log(commitWinner);
    // console.log(commitWinner.cX, commitWinner.cY);

    // const commitChallenged = await pedersen.methods.Commit(4, 162039573).call();
    // console.log(commitChallenged.cX, commitChallenged.cY);
    // const commitDelta = await pedersen.methods
    //   .CommitDelta(
    //     commitWinner.cX,
    //     commitWinner.cY,
    //     commitChallenged.cX,
    //     commitChallenged.cY
    //   )
    //   .call();
    // console.log(commitDelta.cX, commitDelta.cY);

    // const commitResult = await pedersen.methods
    //   .ecAdd(
    //     commitDelta.cX,
    //     commitDelta.cY,
    //     "11582721786250466536461455673042417570779959094161799545099454013177462646649",
    //     "4376788553144475931241665342625658969219286226788971703303863113738637119360"
    //   )
    //   .call();
    // console.log(commitResult);
    // const correct = await pedersen.methods
    //   .Verify("49918876", "8869815", commitResult.cX3, commitResult.cY3)
    //   .call();
    // console.log(correct);

    const winner = await getWinner(auction, "abcdefgh");
    console.log(winner);

    // const states = await auction.methods.states().call();
    // console.log(states);

    // const bidder = await auction.methods.bidders(account).call();
    // console.log(bidder);
    // claimWinner(auction, winner, account);
    const auctionWinner = await auction.methods.winner().call();
    console.log("winner: ", auctionWinner);
    // const cipher =
    //   "aMf+5EM9jxSl6x+iafaGmJyrQzqXZvzdO64VDCF6lssb2nXcfK4aUboEdoJHhEJnGsYYF1eMww/uPO8yGk/h+OcqGigEFrb4NhZzzuHT3m9yaIQzVOKQgnIebljsKwQXebRQiaOR+PdrhttGXO5HSH6/HB3qtvM2QTx65ByXsxM=?uiZ1nD1GMlXVPclSeGke2KSkzTy0fHTWv1jWzyV5qjRoPfE7vkUJsOf9EbEFwDor";
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
              <Route path="/my-auctions">
                <TopAppBar />
                <MyAuctions />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
