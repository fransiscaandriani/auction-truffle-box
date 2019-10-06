import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography, Button, TextField } from "@material-ui/core";

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
          <TextField
            id="outlined-number"
            label="Your bid"
            type="number"
            className={classes.textField}
            InputLabelProps={{
              shrink: true
            }}
            margin="normal"
            variant="outlined"
          />
          <Button variant="contained" color="primary">
            {" "}
            Submit Bid{" "}
          </Button>
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
