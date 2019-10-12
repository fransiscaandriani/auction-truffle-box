import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography, Button, TextField } from "@material-ui/core";
import CipherModal from "../CipherModal";
import { placeBid } from "../../service/bidderService";
import { getLoadedWeb3 } from "../../utils/getWeb3";
import getCurrentAccount from "../../utils/getCurrentAccount";
import {
  getAuctionContract,
  getPedersenContract
} from "../../utils/getContracts";
import debounce from "lodash/debounce";
import { useParams } from "react-router";
import { prove } from "../../service/auctioneerService";

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
  const [openModal, setOpenModal] = useState(false);
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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        Best rabbit plushie ever
      </Typography>
      <div className={classes.action}>
        <img
          className={classes.image}
          src="https://pbs.twimg.com/media/DVHZv6cWsAIr4at.jpg:large"
          alt="auction-item"
        />
        <div className={classes["button-container"]}>
          <Typography className={classes.end} variant="h5">
            Auction closes in 12:12:22
          </Typography>
          {renderCipher()}
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
          {/* <Button variant="contained" color="primary" onClick={proveAuction}>
            Prove
          </Button> */}
        </div>
      </div>
      <Typography variant="body1" className={classes.description}>
        This rabbit can give you food when you are hungry, water when you are
        thristy, and money when you need it.
      </Typography>
    </Container>
  );
}

export default AuctionPage;
