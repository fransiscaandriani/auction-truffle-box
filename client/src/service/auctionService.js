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
  fairnessFees: 5000000000,
  passphrase: "abcdefgh",
  k: 10,
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
  contract.methods
    .createAuction(
      auctionData.name,
      auctionData.desc,
      auctionData.bidEndTime,
      auctionData.revealTime,
      auctionData.winnerPaymentTime,
      auctionData.maxBiddersCount,
      auctionData.fairnessFees,
      publicKey,
      auctionData.k,
      auctionData.testing
    )
    .send({
      from: account,
      value: web3.utils.toWei(auctionData.fairnessFees.toString(), "wei")
    });
}

export async function getAllAuctionsData(contract) {
  const auctionsData = [];
  const auctionsAddresses = await contract.methods.allAuctions().call();
  await Promise.all(
    auctionsAddresses.map(async address => {
      const temp = await contract.methods.getAuctionData(address).call();
      const data = { address: address, name: temp[0], desc: temp[1] };
      auctionsData.push(data);
    })
  );
  // auctionsAddresses.forEach(async function(address) {
  //   const temp = await contract.methods.getAuctionData(address).call();
  //   const data = { address: address, name: temp[0], desc: temp[1] };
  //   auctionsData.push(data);
  // });

  return auctionsData;
}

export async function getAuctionData(web3, auctionAddress, account) {
  var auctionData = {};
  const auctionFactoryContract = await getAuctionFactoryContract(web3);
  const contract = await getAuctionContract(web3, auctionAddress);

  // Name and description, stored in auction factory
  const nameDescList = await auctionFactoryContract.methods
    .getAuctionData(auctionAddress)
    .call();
  auctionData.name = nameDescList[0];
  auctionData.desc = nameDescList[1];

  // Auction related cariables
  const auctionVars = await contract.methods.AuctionData().call();
  auctionData.bidEndTime = auctionVars[0];
  auctionData.revealTime = auctionVars[1];
  auctionData.winnerPaymentTime = auctionVars[2];
  auctionData.fairnessFees = auctionVars[3];

  // Bidder related data
  const bidderVars = await contract.methods.BidderData(account).call();
  auctionData.hasbid = bidderVars[0];
  auctionData.bidderExceeds = bidderVars[1];
  auctionData.paidBack = bidderVars[2];
  auctionData.isWinner = bidderVars[3];

  return auctionData;
}
