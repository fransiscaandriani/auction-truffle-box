import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography, Button, TextField } from "@material-ui/core";
import CipherModal from "../CipherModal";
import {
  placeBid,
  winnerPay,
  refund,
  revealBid
} from "../../service/bidderService";
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
    height: 50,
    margin: 20,
    minWidth: 500
  },
  input: {
    margin: 10
  },
  end: {
    margin: 20
  },
  buttonBox: {
    display: "flex",
    flexDirection: "column",
    width: 300
  },
  textArea: {
    height: 150,
    marginBottom: 10
  },
  lowerButton: {
    marginTop: 8
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

  const renderCipher = () => {
    if (cipher !== "") {
      return <CipherModal open={openModal} cipherText={cipher} />;
    } else return null;
  };

  // const currentTime = Math.floor(Date.now() / 1000);
  const currentTime = 1571294812;

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

  const renderNotice = (message, date = 0) => {
    if (date === 0) {
      return <Typography variant="h5">{message}</Typography>;
    } else {
      return (
        <div>
          <Typography variant="h5">{message}</Typography>
          {renderDateTime(date)}
        </div>
      );
    }
  };

  const renderDateTime = unixTime => {
    const dateTime = new Date(unixTime * 1000);
    console.log(dateTime.toLocaleTimeString());
    return (
      <Typography variant="h6" color="textSecondary">
        {dateTime.toDateString() + " " + dateTime.toLocaleTimeString()}
      </Typography>
    );
  };

  const renderPassphraseBox = () => {
    return (
      <TextField
        required
        id="passphrase"
        label="Passphrase"
        type="password"
        variant="outlined"
        margin="normal"
        onChange={e => setPassphrase(e.target.value)}
      />
    );
  };

  const renderDetermineWinnerButtonWithPassphrase = () => {
    const determineWinner = async () => {
      const winner = await getWinner(auctionContract, passphrase);
      claimWinner(auctionContract, winner, account);
    };

    return (
      <div className={classes.buttonBox}>
        {renderNotice("Determining winner to be started...")}
        {renderPassphraseBox()}
        <Button variant="contained" color="primary" onClick={determineWinner}>
          {" "}
          Determine Winner{" "}
        </Button>
      </div>
    );
  };

  const renderProveButtonWithPassphrase = () => {
    return (
      <div className={classes.buttonBox}>
        {renderNotice("Proving in progress...")}
        {renderPassphraseBox()}
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            prove(web3, account, auctionContract, pedersen, passphrase)
          }
        >
          Prove
        </Button>
        <Button
          className={classes.lowerButton}
          variant="contained"
          color="primary"
          onClick={() => verifyAll(auctionContract, account)}
        >
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
    } else {
      return renderNotice(
        "It's time for winner to pay and other bidders to refund"
      );
    }
  };

  const renderBidButtonAndInputBox = () => {
    return (
      <div className={classes.buttonBox}>
        {renderNotice("Bidding will be closed at", auctionData.bidEndTime)}
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
      <div className={classes.buttonBox}>
        {renderNotice("Reveal will be closed on", auctionData.revealTime)}
        <TextField
          required
          className={classes.textArea}
          label="Cipher"
          margin="normal"
          value={cipherReveal}
          onChange={e => setCipherReveal(e.target.value)}
          multiline={true}
          rows={7}
          variant="outlined"
        ></TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={revealBidWithCipher}
        >
          Reveal Bid
        </Button>
      </div>
    );
  };
  const revealBidWithCipher = () => {
    console.log(cipherReveal);
    revealBid(auctionContract, account, cipherReveal);
  };
  const renderPayButton = () => {
    console.log("pay button");
    return (
      <div className={classes.buttonBox}>
        {renderNotice("Congratulation! You win the auction.")}
        <Button
          variant="contained"
          color="primary"
          onClick={() => winnerPay(web3, auctionContract, account)}
        >
          Pay
        </Button>
      </div>
    );
  };

  const renderClaimButton = () => {
    return (
      <div className={classes.buttonBox}>
        {renderNotice(
          "You do not win the auction. Please refund the fee you paid to enter the auction."
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => refund(auctionContract, account)}
        >
          Claim Refund
        </Button>
      </div>
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
      } else {
        return renderNotice("Auction has ended");
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
          src="https://afremov.com/images/product/image.jpeg"
          alt="auction-item"
        />
        <div className={classes["button-container"]}>
          {/* {renderDateTime(1570416450)} */}
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
