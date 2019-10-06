import { getPedersenContract } from "../utils/getContracts";
import JSEncrypt from "jsencrypt";

// Input bid in eth
export async function placeBid(account, web3, auctionContract, bid) {
  const auctioneerRSAPublicKey = await auctionContract.methods
    .auctioneerRSAPublicKey()
    .call();
  const fee = await auctionContract.methods.fairnessFees().call();
  const pedersen = await getPedersenContract(web3);
  const randomInt = Math.floor((Math.random * 10) ^ 8);
  const commit = await pedersen.methods.Commit(bid, randomInt).call();
  auctionContract.methods
    .Bid(commit.cX, commit.cY)
    .send({ from: account, value: fee });

  var crypt = new JSEncrypt();
  crypt.setKey(auctioneerRSAPublicKey);
  return encrypt(bid, randomInt, crypt);
}

async function encrypt(bid, randomInt, crypt) {
  const object = { bid: bid, random: randomInt };
  const objectStr = JSON.stringify(object);
  return crypt.encrypt(objectStr);
}
