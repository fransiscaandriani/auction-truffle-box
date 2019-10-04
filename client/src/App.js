import React, { Component } from "react";
import BlindAuctionContract from "./contracts/BlindAuction.json";
import getWeb3 from "./utils/getWeb3";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import AuctionList from "./components/AuctionList";
import Auction from "./components/Auction";
import TopAppBar from "./components/TopAppBar";
import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BlindAuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        BlindAuctionContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    // this.runExample();
  };

  runExample = async () => {
    const { accounts, web3, contract } = this.state;

    // Stores a given value, 5 by default.
    const _blindedBid = web3.utils.soliditySha3(10, false, "abcd");
    contract.methods
      .bid(_blindedBid)
      .send({ from: accounts[0], value: web3.utils.toWei("5") });

    // await contract.methods.set(5).send({ from: accounts[0] });
    console.log(accounts[0]);
    // Get the value from the contract to prove it worked.
    // const response = await contract.methods
    //   .bids(
    //     "0c2cfdd55a47ea9b11f4620b51a7d536a99394a2808cae18cf4928fa5bbacb50",
    //     0
    //   )
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
                <Auction />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
