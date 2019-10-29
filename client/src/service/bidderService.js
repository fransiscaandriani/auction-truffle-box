import {
  getPedersenContract,
  getAuctionFactoryContract,
  getAuctionContract
} from "../utils/getContracts";
import Cryptico from "cryptico-js";
import { getWinner } from "./auctioneerService";

// Input bid in eth
export async function placeBid(account, web3, auctionContract, bid) {
  console.log("aucion", auctionContract);
  const auctioneerRSAPublicKey = await auctionContract.methods
    .auctioneerRSAPublicKey()
    .call();
  const fee = await auctionContract.methods.fairnessFees().call();
  const pedersen = await getPedersenContract(web3);
  const randomInt = Math.floor(Math.random() * 10 ** 10);
  const commit = await pedersen.methods.Commit(bid, randomInt).call();
  try {
    await auctionContract.methods
      .Bid(commit.cX, commit.cY)
      .send({ from: account, value: web3.utils.toWei(fee) });
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

export async function getMyBids(web3, auctionFactoryContract, account) {
  var bids = [];
  const auctionAddresses = await auctionFactoryContract.methods
    .allAuctions()
    .call();
  await Promise.all(
    auctionAddresses.map(async address => {
      const auctionContract = await getAuctionContract(web3, address);
      const bidderData = await auctionContract.methods
        .BidderData(account)
        .call();
      if (bidderData[0]) {
        bids.push(address);
      }
    })
  );
  return bids;
}

export async function revealBid(auctionContract, account, cipher) {
  try {
    await auctionContract.methods.Reveal(cipher).send({ from: account });
  } catch (e) {
    alert(`Reveal bid unsuccessful`);
    console.log(e);
  }
}

export async function refund(auctionContract, account) {
  try {
    await auctionContract.methods.Withdraw().send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Refund unsuccessful`);
  }
}

export async function winnerPay(web3, auctionContract, account) {
  try {
    const bid = await auctionContract.methods.highestBid().call();
    console.log(bid);
    await auctionContract.methods
      .WinnerPay()
      .send({ from: account, value: web3.utils.toWei(bid) });
  } catch (error) {
    console.log(error);
    alert(`Winner payment unsuccessful`);
  }
}
