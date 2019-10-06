import React, { Component } from "react";
import Auction from "./contracts/Auction.json";
import Pedersen from "./contracts/Pedersen.json";
import getWeb3 from "./utils/getWeb3";
import {
  getAuctionFactoryContract,
  getPedersenContract,
  getAuctionContract
} from "./utils/getContracts";
import getCurrentAccount from "./utils/getCurrentAccount";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuctionList from "./components/AuctionList";
import AuctionPage from "./components/AuctionPage";
import TopAppBar from "./components/TopAppBar";
import { mockAuction, createAuction, placeBid } from "./service/auctionService";
import "./App.css";

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

    // const pedersen = new web3.eth.Contract(
    //   Pedersen.abi,
    //   "0xc199662A3BB514a79889D161280290020FD41B36"
    // );
    // const commit = await pedersen.methods
    //   .Commit(10000000000000, 22030291809)
    //   .call();
    // console.log(commit);

    // Stores a given value, 5 by default.
    // const _blindedBid = web3.utils.soliditySha3(10, false, "abcd");
    // createAuction(accounts[0], web3, contract);
    const auction = await getAuctionContract(
      web3,
      "0x38a3140D0643Fd3a02768d169086DE7A71de56b0"
    );
    console.log(auction.methods.auctioneerAddress().call());

    // await auction.methods
    //   .Bid(commit.cX, commit.cY)
    //   .send({ from: accounts[0], value: 5000000000 });
    // await placeBid(account, web3, auction, web3.utils.toWei("5"));
    console.log(auction.methods.bidders(account).call());

    // const auctionContract = auction[2];
    // console.log(auction.methods.auctioneerAddress().call());

    console.log(account);
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
              <Route path="/auction">
                <TopAppBar />
                <AuctionPage />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
