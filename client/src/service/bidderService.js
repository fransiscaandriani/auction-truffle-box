import {
  getPedersenContract,
  getAuctionFactoryContract,
  getAuctionContract
} from "../utils/getContracts";
import Cryptico from "cryptico-js";
import { getWinner } from "./auctioneerService";
import { mintNFToken, transferNFToken } from "./NFTokenService";
import {
  getNFTokenMetadataContract,
  getFTokenContract
} from "../utils/getNightfall";
import { mintFToken, transferFToken, approveFToken } from "./FTokenService";

// Input bid in eth
export async function placeBid(account, web3, auctionContract, bid) {
  console.log("aucion", auctionContract);
  const auctioneerRSAPublicKey = await auctionContract.methods
    .auctioneerRSAPublicKey()
    .call();
  const fee = await auctionContract.methods.fairnessFees().call();
  const pedersen = await getPedersenContract(web3);
  const NFTokenContract = await getNFTokenMetadataContract(web3);
  const randomInt = Math.floor(Math.random() * 10 ** 10);
  console.log(randomInt);
  console.log(bid);
  const commit = await pedersen.methods.Commit(bid, randomInt).call();
  const cX = commit.cX;
  const cY = commit.cY;
  console.log(cX.toString());
  const uri = encodeURI(cX.toString() + "," + cY.toString());
  console.log(uri, "uri");
  let tokenId;
  try {
    tokenId = await mintNFToken(NFTokenContract, account, uri);
  } catch (error) {
    alert(`Minting NFToken unsuccessful`);
    console.log(error);
    return null;
  }
  console.log("tokenID", tokenId);
  if (tokenId === undefined) {
    return null;
  }

  try {
    await transferNFToken(
      NFTokenContract,
      account,
      auctionContract.options.address,
      tokenId
    );
  } catch (error) {
    alert(`Transferring NFToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await auctionContract.methods
      .Bid(tokenId)
      .send({ from: account, value: web3.utils.toWei(fee) });
    return encrypt(bid, randomInt, auctioneerRSAPublicKey);
  } catch (e) {
    alert(`Transaction unsuccessful`);
    return null;
  }
}

export async function revealBid(auctionContract, account, cipher, web3) {
  const NFTokenContract = await getNFTokenMetadataContract(web3);
  let tokenId;
  try {
    tokenId = await mintNFToken(NFTokenContract, account, cipher);
  } catch (error) {
    alert(`Minting NFToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await transferNFToken(
      NFTokenContract,
      account,
      auctionContract.options.address,
      tokenId
    );
  } catch (error) {
    alert(`Transferring NFToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await auctionContract.methods.Reveal(cipher).send({ from: account });
  } catch (e) {
    alert(`Reveal bid unsuccessful`);
    console.log(e);
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

export async function refund(auctionContract, account) {
  try {
    await auctionContract.methods.Withdraw().send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Refund unsuccessful`);
  }
}

export async function winnerPay(web3, auctionContract, account) {
  const bid = await auctionContract.methods.highestBid().call();
  console.log(bid);

  const FTokenContract = await getFTokenContract(web3);

  try {
    await mintFToken(FTokenContract, account, bid);
  } catch (error) {
    alert(`Minting FToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await approveFToken(FTokenContract, account, bid);
  } catch (error) {
    alert(`Approving FToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await transferFToken(
      FTokenContract,
      account,
      auctionContract.options.address,
      bid
    );
  } catch (error) {
    alert(`Transferring FToken unsuccessful`);
    console.log(error);
    return null;
  }

  try {
    await auctionContract.methods
      .WinnerPay()
      .send({ from: account, value: web3.utils.toWei(bid) });
  } catch (error) {
    console.log(error);
    alert(`Winner payment unsuccessful`);
  }
}
