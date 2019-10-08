import Cryptico from "cryptico-js";
import { getPedersenContract } from "../utils/getContracts";
/* global BigInt */

export async function getWinner(auctionContract, passphrase) {
  const rsaKey = Cryptico.generateRSAKey(passphrase, 1024);
  const indexs = await auctionContract.methods.BiddersAddresses().call();
  console.log(indexs);
  const winner = { bid: 0 };
  await Promise.all(
    indexs.map(async index => {
      const bidder = await auctionContract.methods.bidders(index).call();
      const decrypted = decrypt(bidder.cipher, rsaKey);
      if (decrypted.bid > winner.bid) {
        winner.address = index;
        winner.bid = decrypted.bid;
        winner.random = decrypted.random;
      }
    })
  );
  return winner;
}

function decrypt(cipher, rsaKey) {
  const decryptionResult = Cryptico.decrypt(cipher, rsaKey);
  const plaintext = decryptionResult.plaintext;
  try {
    const obj = JSON.parse(plaintext);
    return obj;
  } catch (error) {
    return null;
    console.log(error);
  }
}

export async function claimWinner(auctionContract, winner, account) {
  console.log(winner.address);
  await auctionContract.methods
    .ClaimWinner(winner.address, winner.bid, winner.random)
    .send({ from: account });
}

export async function generateChallenges(K, Q, maxBid, pedersenContract) {
  const commits = [];
  const opens = [];
  const iterator = [1, 1, 1, 1, 1, 1, 1];
  Promise.all(
    iterator.map(async i => {
      console.log("inside");
      const w1 = BigInt(Math.floor(Math.random() * 10 ** 80));
      const w2 = BigInt(Q) - (BigInt(w1) - BigInt(maxBid));
      const r1 = BigInt(Math.floor(Math.random() * 10 ** 80));
      const r2 = BigInt(Math.floor(Math.random() * 10 ** 80));
      console.log("w1, w2, r1, r2", Q, w1, maxBid);
      console.log("here", pedersenContract);
      const cW1 = await pedersenContract.methods
        .Commit(w1.toString(), r1.toString())
        .call();
      const cW2 = await pedersenContract.methods
        .Commit(w2.toString(), r2.toString())
        .call();

      Array.prototype.push.apply(commits, [cW1.cX, cW1.cY, cW2.cX, cW2.cY]);
      Array.prototype.push.apply(opens, [w1, r1, w2, r2]);
    })
  );
  return { commits: commits, opens: opens };
}

async function challenge(
  account,
  bidder,
  K,
  Q,
  maxBid,
  winner,
  auctionContract,
  challenges,
  deltaChallenges
) {
  // get commits and opens
  const commits = challenges.commits;
  const opens = challenges.opens;

  // get delta commits and delta opens
  const deltaCommits = deltaChallenges.commits;
  const deltaOpens = deltaChallenges.opens;

  try {
    let blockHash = "00";
    console.log(commits.length);
    console.log(deltaCommits.length);
    await auctionContract.methods
      .ZKPCommit(bidder.address, commits, deltaCommits)
      .send({ from: account })
      .then(function(receipt) {
        // get block hash
        blockHash = blockHash + receipt.blockHash.substring(2);
      });
    //turn hexadecimal to decimal
    const challenge = blockHash.toString(16);

    const mask = 1;
    const responses = [];
    //pushing responses
    for (let i = 0, j = 0; i < K; i++, j += 4) {
      if ((challenge & mask) == 0) {
        Array.prototype.apply(responses, [
          opens[j],
          opens[j + 1],
          opens[j + 2],
          opens[j + 3]
        ]);
      } else {
        const m = opens[j] + bidder.bid;
        const n = opens[j + 1] + bidder.random;
        const z = 1;
        if (m > maxBid || m <= 0) {
          z = 2;
          m = opens[j + 2] + bidder.bid;
          n = opens[j + 3] + bidder.random;
        }
        Array.prototype.apply(responses, [m, n, z]);
      }
      mask = mask << 1;
    }

    const deltaResponses = [];
    //pushing deltaResponses
    for (let i = 0, j = 0; i < K; i++, j += 4) {
      if ((challenge & mask) == 0) {
        Array.prototype.apply(deltaResponses, [
          deltaOpens[j],
          deltaOpens[j + 1],
          deltaOpens[j + 2],
          deltaOpens[j + 3]
        ]);
      } else {
        const diff = winner.bid - bidder.bid;
        if (diff < 0) diff += Q;
        const m = deltaOpens[j] + diff;
        const n = deltaOpens[j + 1] + winner.random - bidder.random;
        const z = 1;
        if (m > maxBid || m < 0) {
          z = 2;
          m = deltaOpens[j + 2] + diff; // bidders[winnerIndex].Bid - x.Bid;
          n = deltaOpens[j + 3] + winner.random - bidder.random;
        }
        if (n < 0) n += Q;
        Array.prototype.apply(deltaResponses, [m, n, z]);
      }
      mask = mask << 1;
    }

    await auctionContract.methods
      .ZKPVerify(responses, deltaResponses)
      .send({ from: account });
  } catch (error) {
    console.log(error);
  }
}

export async function prove(web3, account, auctionContract, passphrase) {
  const winner = await getWinner(auctionContract, passphrase);
  const pedersenContract = await getPedersenContract(web3);

  // get parameter stored in auction contract
  const K = 10;
  const Q = await auctionContract.methods.Q().call();
  const maxBid = await auctionContract.methods.V().call();
  const biddersAddresses = await auctionContract.methods
    .BiddersAddresses()
    .call();
  const rsaKey = Cryptico.generateRSAKey(passphrase, 1024);

  // iterate for each bidder
  biddersAddresses.map(async bidderAddress => {
    const challenges = await generateChallenges(K, Q, maxBid, pedersenContract);
    const deltaChallenges = await generateChallenges(
      K,
      Q,
      maxBid,
      pedersenContract
    );
    if (bidderAddress != winner.address) {
      // get bidder's bid and random
      const bidder = await auctionContract.methods
        .bidders(bidderAddress)
        .call();
      const decrypted = decrypt(bidder.cipher, rsaKey);
      decrypted.address = bidderAddress;
      await challenge(
        account,
        decrypted,
        K,
        Q,
        maxBid,
        winner,
        auctionContract,
        challenges,
        deltaChallenges
      );
    }
  });

  // biddersAddresses.map(async bidderAddress => {
  //   if (bidderAddress != winner.address) {
  //     // get bidder's bid and random
  //     const bidder = await auctionContract.methods
  //       .bidders(bidderAddress)
  //       .call();
  //     const decrypted = decrypt(bidder.cipher, rsaKey);
  //     decrypted.address = bidderAddress;
  //     await challenge(
  //       account,
  //       decrypted,
  //       K,
  //       Q,
  //       maxBid,
  //       winner,
  //       auctionContract,
  //       pedersenContract
  //     );
  //   }
  // });

  console.log("proved");
}
