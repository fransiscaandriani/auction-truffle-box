import React, { useState, useCallback, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";
import debounce from "lodash/debounce";
import { createAuction } from "../../service/auctionService";
import getCurrentAccount from "../../utils/getCurrentAccount";
import { getLoadedWeb3 } from "../../utils/getWeb3";
import { getAuctionFactoryContract } from "../../utils/getContracts";

const useStyles = makeStyles(theme => ({
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3)
    }
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
    float: "right"
  }
}));

function CreateAuctionPage() {
  const classes = useStyles();
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDescription, setAuctionDescription] = useState("");
  const [bidEndDate, setBidEndDate] = useState(new Date());
  const [bidEndTime, setBidEndTime] = useState(new Date());
  const [revealDate, setRevealDate] = useState(new Date());
  const [revealTime, setRevealTime] = useState(new Date());
  const [winnerPaymentDate, setWinnerPaymentDate] = useState(new Date());
  const [winnerPaymentTime, setWinnerPaymentTime] = useState(new Date());
  const [maxBiddersCount, setMaxBiddersCount] = useState(0);
  const [fairnessFees, setFairnessFees] = useState(0);
  const [passphrase, setPassphrase] = useState("");
  const [web3, setWeb3] = useState({});
  const [auctionFactoryContract, setAuctionFactoryContract] = useState({});
  const [account, setAccount] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getLoadedWeb3();
        setWeb3(web3);

        // const getData = () =>
        //   Promise.all([
        //     getAuctionFactoryContract(web3),
        //     getCurrentAccount(web3)
        //   ]).then({
        //     function(result) {
        //       setAuctionFactoryContract(result[0]);
        //       setAccount(result[1]);
        //     }
        //   });
        // await getData();

        const auctionFactoryContract = await getAuctionFactoryContract(web3);
        setAuctionFactoryContract(auctionFactoryContract);

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

  const debouncedSetAuctionTitle = useCallback(
    debounce(value => setAuctionTitle(value), 700),
    []
  );

  const debouncedSetAuctionDescription = useCallback(
    debounce(value => setAuctionDescription(value), 700),
    []
  );

  const debouncedSetMaxBiddersCount = useCallback(
    debounce(value => setMaxBiddersCount(value), 700),
    []
  );

  const debouncedSetFairnessFees = useCallback(
    debounce(value => setFairnessFees(value), 700),
    []
  );

  const debouncedSetPassphrase = useCallback(
    debounce(value => setPassphrase(value), 700),
    []
  );

  // this function is to get the ts you use for the contract backend
  const getTimestampFromDateAndTime = (date, time) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0
    ).getTime();
  };

  const validateInputs = () => {
    const alertWrongInputs = () => alert("Please fill in with valid inputs");
    let allGood = true;
    if (
      auctionTitle === "" ||
      auctionDescription === "" ||
      maxBiddersCount <= 0 ||
      fairnessFees <= 0 ||
      passphrase === ""
    ) {
      allGood = false;
    }
    if (!allGood) alertWrongInputs();
    return allGood;
  };

  const validateTimeStamps = (
    bidEndTimeTs,
    revealTimeTs,
    winnerPaymentTimeTs
  ) => {
    const alertWrongTime = () =>
      alert(
        "Please make sure that the bid end time, reveal time and winner payment time are in correct order "
      );
    let correct = true;
    if (bidEndTimeTs >= revealTimeTs) correct = false;
    else if (revealTimeTs >= winnerPaymentTimeTs) correct = false;

    if (!correct) alertWrongTime();
    return correct;
  };

  async function handleCreateAuction() {
    const bidEndTimeTs = getTimestampFromDateAndTime(bidEndDate, bidEndTime);
    const revealTimeTs = getTimestampFromDateAndTime(revealDate, revealTime);
    const winnerPaymentTimeTs = getTimestampFromDateAndTime(
      winnerPaymentDate,
      winnerPaymentTime
    );
    console.log("a", revealTimeTs, bidEndTimeTs, winnerPaymentTimeTs);
    const allGood = validateInputs();
    const correct = validateTimeStamps(
      bidEndTimeTs,
      revealTimeTs,
      winnerPaymentTimeTs
    );
    const auctionData = {
      name: auctionTitle,
      desc: auctionDescription,
      bidEndTime: bidEndTimeTs,
      revealTime: revealTimeTs,
      winnerPaymentTime: winnerPaymentTimeTs,
      maxBiddersCount: maxBiddersCount,
      fairnessFees: fairnessFees,
      passphrase: passphrase,
      testing: true
    };
    console.log(auctionFactoryContract.options.address);
    if (allGood & correct) {
      // await fetchData();
      const address = await createAuction(
        account,
        web3,
        auctionFactoryContract,
        auctionData
      );
      if (address !== null) console.log(address);
    } else {
      return; // do nothing
    }
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <React.Fragment>
            <Typography variant="h6">Create new auction</Typography>
            <Grid item xs={12}>
              <TextField
                required
                id="auction-name"
                name="auction-name"
                label="Auction title"
                fullWidth
                onChange={e => debouncedSetAuctionTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="auction-description"
                name="auction-description"
                label="Description"
                multiline
                fullWidth
                required
                onChange={e => debouncedSetAuctionDescription(e.target.value)}
              />
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker-dialog"
                  label="Bid end date"
                  format="MM/dd/yyyy"
                  value={bidEndDate}
                  onChange={setBidEndDate}
                  KeyboardButtonProps={{
                    "aria-label": "change date"
                  }}
                />
                <KeyboardTimePicker
                  margin="normal"
                  id="auction-end-time"
                  name="auction-end-time"
                  label="Bid end time"
                  value={bidEndTime}
                  onChange={setBidEndTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time"
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  margin="normal"
                  id="auction-reveal-date"
                  label="Reveal date"
                  format="MM/dd/yyyy"
                  value={revealDate}
                  onChange={setRevealDate}
                  KeyboardButtonProps={{
                    "aria-label": "change date"
                  }}
                />
                <KeyboardTimePicker
                  margin="normal"
                  id="auction-reveal-time"
                  name="auction-reveal-time"
                  label="Reveal time"
                  value={revealTime}
                  onChange={setRevealTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time"
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  margin="normal"
                  id="winner-payment-date"
                  label="Winner payment date"
                  format="MM/dd/yyyy"
                  value={winnerPaymentDate}
                  onChange={setWinnerPaymentDate}
                  KeyboardButtonProps={{
                    "aria-label": "change date"
                  }}
                />
                <KeyboardTimePicker
                  margin="normal"
                  id="winner-payment-time"
                  name="winner-payment-time"
                  label="Winner payment time"
                  value={winnerPaymentTime}
                  onChange={setWinnerPaymentTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time"
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="max-bidders-count"
                  name="max-bidders-count"
                  label="Max bidders count"
                  type="number"
                  fullWidth
                  onChange={e => debouncedSetMaxBiddersCount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="fairness-fee"
                  name="fairness-fee"
                  label="Fairness fee"
                  type="number"
                  fullWidth
                  onChange={e => debouncedSetFairnessFees(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="passphrase"
                  name="passphrase"
                  label="Passphrase"
                  type="password"
                  onChange={e => debouncedSetPassphrase(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleCreateAuction}
                >
                  Create Auction
                </Button>
              </Grid>
            </Grid>
          </React.Fragment>
        </Paper>
      </main>
    </MuiPickersUtilsProvider>
  );
}

export default CreateAuctionPage;
