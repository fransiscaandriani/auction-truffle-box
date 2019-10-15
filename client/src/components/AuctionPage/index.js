import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography, Button, TextField } from "@material-ui/core";
import CipherModal from "../CipherModal";
import { placeBid, winnerPay, refund } from "../../service/bidderService";
import { getLoadedWeb3 } from "../../utils/getWeb3";
import getCurrentAccount from "../../utils/getCurrentAccount";
import {
  getAuctionContract,
  getPedersenContract
} from "../../utils/getContracts";
import debounce from "lodash/debounce";
import { useParams } from "react-router";
import {
  prove,
  getWinner,
  claimWinner,
  verifyAll
} from "../../service/auctioneerService";
import { getAuctionData } from "../../service/auctionService";

const useStyles = makeStyles({
  title: {
    marginTop: 40
  },
  image: {
    width: 600,
    margin: 20,
    marginLeft: 0,
    height: 300,
    objectFit: "cover"
  },
  description: {
    maxWidth: 600
  },
  action: {
    display: "flex"
  },
  "button-container": {
    display: "flex",
    flexDirection: "column",
    height: 50
  },
  input: {
    margin: 10
  },
  end: {
    margin: 20
  }
});

function AuctionPage() {
  const classes = useStyles();
  const [bid, setBid] = useState(0);
  const [account, setAccount] = useState("");
  const [auctionContract, setAuctionContract] = useState({});
  const [web3, setWeb3] = useState({});
  const [pedersen, setPedersen] = useState({});
  const [cipher, setCipher] = useState("");
  const [cipherReveal, setCipherReveal] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [auctionData, setAuctionData] = useState({});
  const [passphrase, setPassphrase] = useState("");
  const { address } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getLoadedWeb3();
        setWeb3(web3);

        const auctionContract = await getAuctionContract(web3, address);
        setAuctionContract(auctionContract);

        const pedersen = await getPedersenContract(web3);
        setPedersen(pedersen);

        const account = await getCurrentAccount(web3);
        setAccount(account);

        const newAuctionData = await getAuctionData(web3, address, account);
        setAuctionData(newAuctionData);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const debouncedSetBid = useCallback(
    debounce(value => setBid(value), 700),
    []
  );

  const placeNewBid = async () => {
    const cipher = await placeBid(
      account,
      web3,
      auctionContract,
      parseInt(bid)
    );
    if (cipher !== null) {
      setCipher(cipher);
      setOpenModal(true);
    }
  };

  const proveAuction = async () => {
    prove(web3, account, auctionContract, pedersen, "abcdefgh");
  };

  const renderCipher = () => {
    if (cipher !== "") {
      return <CipherModal open={openModal} cipherText={cipher} />;
    } else return null;
  };

  // const currentTime = Math.floor(Date.now() / 1000);
  const currentTime = 1570416450;

  /**
   * 1. determine winner button
   * 2. passphrase box
   * 3. prove button
   * 4. verify all button
   * 5. nothing
   * 6. notice message
   * 7. reveal
   * 8. pay
   * 9. refund
   */

  const renderNotice = message => {
    return <Typography variant="h6">{message}</Typography>;
  };

  const renderPassphraseBox = label => {
    return (
      <TextField
        required
        id="passphrase"
        name="passphrase"
        label={label}
        type="password"
        onChange={e => setPassphrase(e.target.value)}
        fullWidth
      />
    );
  };

  const renderDetermineWinnerButtonWithPassphrase = () => {
    const determineWinner = async () => {
      const winner = await getWinner(auctionContract, passphrase);
      claimWinner(auctionContract, winner, account);
    };

    return (
      <div>
        {renderPassphraseBox()}
        <Button onClick={determineWinner}> Determine Winner </Button>
      </div>
    );
  };

  const renderProveButtonWithPassphrase = () => {
    return (
      <div>
        {renderPassphraseBox()}
        <Button
          onClick={() =>
            prove(web3, account, auctionContract, pedersen, passphrase)
          }
        >
          Prove
        </Button>
        <Button onClick={() => verifyAll(auctionContract, account)}>
          Verify All
        </Button>
      </div>
    );
  };

  const renderAuctioneerButton = () => {
    if (
      currentTime < auctionData.revealTime ||
      currentTime > auctionData.winnerPaymentTime
    ) {
      // display nothing
      return renderNotice("No actions are available at the moment.");
    } else if (auctionData.state === "Init") {
      // display button determine winner
      // display passphrase box
      return renderDetermineWinnerButtonWithPassphrase();
    } else if (auctionData.state === "Challenge") {
      // display prove button and passphrase box beside each other
      // display verify all button
      return renderProveButtonWithPassphrase();
    }
  };

  const renderBidButtonAndInputBox = () => {
    return (
      <div>
        <TextField
          id="outlined-number"
          label="Your bid"
          type="number"
          className={classes.textField}
          InputLabelProps={{
            shrink: true
          }}
          defaultValue={1}
          margin="normal"
          variant="outlined"
          onChange={e => debouncedSetBid(e.target.value)}
          required={true}
        />
        <Button variant="contained" color="primary" onClick={placeNewBid}>
          Submit Bid
        </Button>
      </div>
    );
  };

  const isEmpty = obj =>
    Object.entries(obj).length === 0 && obj.constructor === Object;

  const renderRevealButtonWithInput = () => {
    return (
      <div>
        <label for="cipher">Cipher</label>
        <textarea
          id="cipher"
          value={cipherReveal}
          onChange={e => setCipherReveal(e.target.event)}
        ></textarea>
        <Button variant="contained" color="primary" onClick={placeNewBid}>
          Submit Bid
        </Button>
      </div>
    );
  };

  const renderPayButton = () => {
    console.log("pay button");
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => winnerPay(web3, auctionContract, account)}
      >
        Pay
      </Button>
    );
  };

  const renderClaimButton = () => {
    return (
      <Button onClick={() => refund(auctionContract, account)}>
        Claim Refund
      </Button>
    );
  };

  const renderBidderButton = () => {
    if (isEmpty(auctionData)) {
      return;
    }
    if (!auctionData.hasBid) {
      console.log("Hewllo", auctionData);
      if (currentTime > auctionData.bidEndTime) {
        // display notice that bid is closed
        return renderNotice("Bidding has been closed.");
      } else if (auctionData.bidderExceeds) {
        // display no more bids allowed
        return renderNotice("Bidding has been closed.");
      } else {
        // display bid button and input box
        return renderBidButtonAndInputBox();
      }
    } else {
      console.log("hello", auctionData);
      if (currentTime < auctionData.bidEndTime) {
        console.log(1);
        // disable bid button
        // display notice that he has already bid
        return renderNotice("You have bid for this item.");
      } else if (currentTime < auctionData.revealTime) {
        console.log(2);
        // display reveal button
        // display cipher input box
        return renderRevealButtonWithInput();
      } else if (auctionData.state !== "ValidWinner") {
        console.log(3);
        // display nothing
        // display notice bid winner is being processed
        return renderNotice("Bid winner is being processed.");
      } else if (currentTime > auctionData.winnerPaymentTime) {
        console.log(4);
        // display nothing
        // bid has expired
        return renderNotice("Bid has expired.");
      } else if (auctionData.isWinner) {
        console.log(5);
        // display pay button
        return renderPayButton();
      } else if (!auctionData.paidBack) {
        console.log(6);
        // display claim button
        return renderClaimButton();
      }
    }
  };

  const renderButton = () => {
    if (auctionData && auctionData.isAuctioneer) {
      return renderAuctioneerButton();
    } else return renderBidderButton();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        {auctionData.name}
      </Typography>
      <div className={classes.action}>
        <img
          className={classes.image}
          src="https://pbs.twimg.com/media/DVHZv6cWsAIr4at.jpg:large"
          alt="auction-item"
        />
        <div className={classes["button-container"]}>
          <Typography className={classes.end} variant="h5">
            Auction closes at 22 October 2019 09:00
          </Typography>
          {renderCipher()}
          {renderButton()}
        </div>
      </div>
      <Typography variant="body1" className={classes.description}>
        {auctionData.desc}
      </Typography>
    </Container>
  );
}

export default AuctionPage;
