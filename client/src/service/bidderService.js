import { getPedersenContract } from "../utils/getContracts";
import JSEncrypt from "jsencrypt";
import Cryptico from "cryptico-js";

// Input bid in eth
export async function placeBid(account, web3, auctionContract, bid) {
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
  // var crypt = new JSEncrypt();
  // crypt.setKey(auctioneerRSAPublicKey);
}

async function encrypt(bid, randomInt, publicKey) {
  const object = { bid: bid, random: randomInt };
  const objectStr = JSON.stringify(object);
  const encryptionResult = Cryptico.encrypt(objectStr, publicKey);
  return encryptionResult.cipher;
}
