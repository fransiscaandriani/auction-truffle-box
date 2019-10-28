import Cryptico from "cryptico-js";
import {
  getAuctionFactoryContract,
  getAuctionContract
} from "../utils/getContracts";

const mockAuction = {
  name: "Mock Auction with correct public key",
  desc: "Auction for testing purposes",
  bidEndTime: 1570406400,
  revealTime: 1570416400,
  winnerPaymentTime: 1570426400,
  maxBiddersCount: 20,
  fairnessFees: 1,
  passphrase: "abcdefgh",
  testing: true
};

export async function createAuction(
  account,
  web3,
  contract,
  auctionData = mockAuction
) {
  const rsaKey = Cryptico.generateRSAKey(auctionData.passphrase, 1024);
  const publicKey = Cryptico.publicKeyString(rsaKey);
  let result;
  try {
    async function sendData() {
      await contract.methods
        .createAuction(
          auctionData.name,
          auctionData.desc,
          auctionData.bidEndTime,
          auctionData.revealTime,
          auctionData.winnerPaymentTime,
          auctionData.maxBiddersCount,
          auctionData.fairnessFees,
          publicKey,
          10,
          auctionData.testing
        )
        .send({
          from: account,
          value: web3.utils.toWei(auctionData.fairnessFees.toString(), "ether")
        })
        .then(function(receipt) {
          console.log(receipt);
          result = receipt.events.AuctionCreated.returnValues.auctionContract;
        });
    }
    await sendData();
    return result;
  } catch (error) {
    alert(`Transaction unsuccessful`);
    return null;
  }
}

export async function getAllAuctionsData(contract, addresses = null) {
  const auctionsData = [];
  if (addresses === null) {
    const auctionsAddresses = await contract.methods.allAuctions().call();
    await Promise.all(
      auctionsAddresses.map(async address => {
        const temp = await contract.methods.getAuctionData(address).call();
        const data = { address: address, name: temp[0], desc: temp[1] };
        auctionsData.push(data);
      })
    );
    return auctionsData;
  } else {
    await Promise.all(
      addresses.map(async address => {
        const temp = await contract.methods.getAuctionData(address).call();
        const data = { address: address, name: temp[0], desc: temp[1] };
        auctionsData.push(data);
      })
    );
    return auctionsData;
  }
}

export async function getAuctionData(web3, auctionAddress, account) {
  var auctionData = {};
  const auctionStates = [
    "Init",
    "Challenge",
    "ChallengeDelta",
    "Verify",
    "VerifyDelta",
    "ValidWinner"
  ];
  const auctionFactoryContract = await getAuctionFactoryContract(web3);
  const contract = await getAuctionContract(web3, auctionAddress);

  // Name and description, stored in auction factory
  const nameDescList = await auctionFactoryContract.methods
    .getAuctionData(auctionAddress)
    .call();
  auctionData.name = nameDescList[0];
  auctionData.desc = nameDescList[1];

  // Auction related variables
  const auctionVars = await contract.methods.AuctionData().call();
  auctionData.bidEndTime = auctionVars[0];
  auctionData.revealTime = auctionVars[1];
  auctionData.winnerPaymentTime = auctionVars[2];
  auctionData.fairnessFees = auctionVars[3];
  auctionData.state = auctionStates[auctionVars[4]];

  // Auctioneer address
  const auctioneerAddress = await contract.methods.auctioneerAddress().call();

  if (account === auctioneerAddress) {
    auctionData.isAuctioneer = true;
    return auctionData;
  } else {
    // Bidder related data
    auctionData.isAuctioneer = false;
    const bidderVars = await contract.methods.BidderData(account).call();
    auctionData.hasBid = bidderVars[0];
    auctionData.bidderExceeds = bidderVars[1];
    auctionData.paidBack = bidderVars[2];
    auctionData.isWinner = bidderVars[3];
    return auctionData;
  }
}
