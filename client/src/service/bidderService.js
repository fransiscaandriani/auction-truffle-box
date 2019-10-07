import {
  getPedersenContract,
  getAuctionFactoryContract,
  getAuctionContract
} from "../utils/getContracts";
import JSEncrypt from "jsencrypt";
import Cryptico from "cryptico-js";

// Input bid in eth
export async function placeBid(account, web3, auctionContract, bid) {
  console.log("aucion", auctionContract);
  const auctioneerRSAPublicKey = await auctionContract.methods
    .auctioneerRSAPublicKey()
    .call();
  const fee = await auctionContract.methods.fairnessFees().call();
  const pedersen = await getPedersenContract(web3);
  const randomInt = Math.floor((Math.random * 10) ^ 8);
  const commit = await pedersen.methods.Commit(bid, randomInt).call();
  try {
    await auctionContract.methods
      .Bid(commit.cX, commit.cY)
      .send({ from: account, value: fee });
    return encrypt(bid, randomInt, auctioneerRSAPublicKey);
  } catch (e) {
    alert(`Transaction unsuccessful`);
    return null;
  }
}
async function encrypt(bid, randomInt, publicKey) {
  const object = { bid: bid, random: randomInt };
  const objectStr = JSON.stringify(object);
  const encryptionResult = Cryptico.encrypt(objectStr, publicKey);
  return encryptionResult.cipher;
}

export async function getMyBids(web3, account) {
  const auctionFactoryContract = await getAuctionFactoryContract(web3);
  var bids = [];
  const auctionAddresses = await auctionFactoryContract.methods
    .allAuctions()
    .call();
  auctionAddresses.forEach(async address => {
    const auctionContract = await getAuctionContract(web3, address);
    const bidderData = await auctionContract.methods.BidderData(account).call();
    if (bidderData[0]) {
      bids.push(address);
    }
  });
  return bids;
}

export async function revealBid(auctionContract, account, cipher) {}
