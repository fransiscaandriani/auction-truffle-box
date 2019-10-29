import Cryptico from "cryptico-js";
import {
  getAuctionFactoryContract,
  getAuctionContract
} from "../utils/getContracts";
/* global BigInt */

export async function getWinner(auctionContract, passphrase) {
  const rsaKey = Cryptico.generateRSAKey(passphrase, 1024);
  const indexs = await auctionContract.methods.BiddersAddresses().call();
  const winner = { bid: 0 };
  await Promise.all(
    indexs.map(async index => {
      const bidder = await auctionContract.methods.bidders(index).call();
      if (bidder.cipher !== "" && bidder.cipher !== null) {
        const decrypted = decrypt(bidder.cipher, rsaKey);
        if (decrypted.bid > winner.bid) {
          winner.address = index;
          winner.bid = decrypted.bid;
          winner.random = decrypted.random;
        }
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
  }
}

export async function claimWinner(auctionContract, winner, account) {
  await auctionContract.methods
    .ClaimWinner(winner.address, winner.bid, winner.random)
    .send({ from: account });
}

async function generateChallenges(K, Q, maxBid, pedersenContract) {
  const commits = [];
  const opens = [];
  const iterator = Array.from("1".repeat(K));
  const makeChallenges = () =>
    Promise.all(
      iterator.map(async i => {
        const w1 = BigInt(Math.floor(Math.random() * 10 ** 20));
        const w2 = BigInt(Q) - (w1 - BigInt(maxBid));
        const r1 = BigInt(Math.floor(Math.random() * 10 ** 20));
        const r2 = BigInt(Math.floor(Math.random() * 10 ** 20));
        const cW1 = await pedersenContract.methods
          .Commit(w1.toString(), r1.toString())
          .call();
        const cW2 = await pedersenContract.methods
          .Commit(w2.toString(), r2.toString())
          .call();

        Array.prototype.push.apply(commits, [cW1.cX, cW1.cY, cW2.cX, cW2.cY]);
        Array.prototype.push.apply(opens, [
          w1.toString(),
          r1.toString(),
          w2.toString(),
          r2.toString()
        ]);
      })
    );
  await makeChallenges();
  return { commits: commits, opens: opens };
}

async function challenge(
  account,
  bidder,
  K,
  Q,
  maxBid,
  winner,
  auctionContract
) {
  // get commits and opens
  const commits = bidder.challenges.commits;
  const opens = bidder.challenges.opens;

  // get delta commits and delta opens
  const deltaCommits = bidder.deltaChallenges.commits;
  const deltaOpens = bidder.deltaChallenges.opens;

  try {
    let blockHash;
    await auctionContract.methods
      .ZKPCommit(bidder.address, commits, deltaCommits)
      .send({ from: account })
      .then(function(receipt) {
        // get block hash
        blockHash = receipt.blockHash;
      });
    //turn hexadecimal to decimal
    const challenge = BigInt(blockHash);

    let mask = BigInt(1);
    const responses = [];
    //pushing responses
    for (let i = 0, j = 0; i < K; i++, j += 4) {
      if ((challenge & mask) === BigInt(0)) {
        Array.prototype.push.apply(responses, [
          opens[j],
          opens[j + 1],
          opens[j + 2],
          opens[j + 3]
        ]);
      } else {
        let m = BigInt(opens[j]) + BigInt(bidder.bid.toString());
        let n = BigInt(opens[j + 1]) + BigInt(bidder.random.toString());
        let z = 1;
        if (m > maxBid || m <= 0) {
          z = 2;
          m = BigInt(opens[j + 2]) + BigInt(bidder.bid.toString());
          n = BigInt(opens[j + 3]) + BigInt(bidder.random.toString());
        }
        Array.prototype.push.apply(responses, [
          m.toString(),
          n.toString(),
          z.toString()
        ]);
      }
      mask = mask << BigInt(1);
    }

    const deltaResponses = [];
    //pushing deltaResponses
    for (let i = 0, j = 0; i < K; i++, j += 4) {
      if ((challenge & mask) === BigInt(0)) {
        Array.prototype.push.apply(deltaResponses, [
          deltaOpens[j],
          deltaOpens[j + 1],
          deltaOpens[j + 2],
          deltaOpens[j + 3]
        ]);
      } else {
        let diff = BigInt(winner.bid) - BigInt(bidder.bid);
        if (diff < 0) diff += BigInt(Q);
        let m = BigInt(deltaOpens[j]) + BigInt(diff);
        let n =
          BigInt(deltaOpens[j + 1]) +
          BigInt(winner.random.toString()) -
          BigInt(bidder.random.toString());
        let z = 1;
        if (m > maxBid || m < 0) {
          z = 2;
          m = BigInt(deltaOpens[j + 2]) + diff; // bidders[winnerIndex].Bid - x.Bid;
          n =
            BigInt(deltaOpens[j + 3]) +
            BigInt(winner.random.toString()) -
            BigInt(bidder.random.toString());
        }
        if (n < 0) n += BigInt(Q);
        Array.prototype.push.apply(deltaResponses, [
          m.toString(),
          n.toString(),
          z.toString()
        ]);
      }
      mask = mask << BigInt(1);
    }

    await auctionContract.methods
      .ZKPVerify(responses, deltaResponses)
      .send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Proof unsuccessful`);
  }
}

async function getBidders(
  K,
  Q,
  maxBid,
  rsaKey,
  pedersenContract,
  auctionContract,
  winner
) {
  const biddersAddresses = await auctionContract.methods
    .BiddersAddresses()
    .call();
  const bidders = [];
  await Promise.all(
    biddersAddresses.map(async bidderAddress => {
      const bidder = await auctionContract.methods
        .bidders(bidderAddress)
        .call();
      const decrypted = decrypt(bidder.cipher, rsaKey);
      decrypted.address = bidderAddress;
      if (bidderAddress !== winner.address) {
        const challenges = await generateChallenges(
          K,
          Q,
          maxBid,
          pedersenContract
        );
        decrypted.challenges = challenges;
        const deltaChallenges = await generateChallenges(
          K,
          Q,
          maxBid,
          pedersenContract
        );
        decrypted.deltaChallenges = deltaChallenges;
        bidders.push(decrypted);
      }
    })
  );

  return bidders;
}

export async function prove(
  web3,
  account,
  auctionContract,
  pedersenContract,
  passphrase
) {
  const K = 10;
  Promise.all([
    getWinner(auctionContract, passphrase),
    Cryptico.generateRSAKey(passphrase, 1024)
  ]).then(async function(result) {
    const bidders = await getBidders(
      K,
      "21888242871839275222246405745257275088696311157297823662689037894645226208583",
      "5472060717959818805561601436314318772174077789324455915672259473661306552145",
      result[1],
      pedersenContract,
      auctionContract,
      result[0]
    );
    bidders.forEach(bidder => {
      if (bidder.address !== result[0].address) {
        challenge(
          account,
          bidder,
          K,
          "21888242871839275222246405745257275088696311157297823662689037894645226208583",
          "5472060717959818805561601436314318772174077789324455915672259473661306552145",
          result[0],
          auctionContract
        );
      }
    });
  });
}

export async function verifyAll(auctionContract, account) {
  try {
    await auctionContract.methods.VerifyAll().send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Verification unsuccessful`);
  }
}

export async function getMyAuctions(web3, auctionFactoryContract, account) {
  // const auctionFactoryContract = await getAuctionFactoryContract(web3);
  var auctions = [];
  const auctionAddresses = await auctionFactoryContract.methods
    .allAuctions()
    .call();
  await Promise.all(
    auctionAddresses.map(async address => {
      const auctionContract = await getAuctionContract(web3, address);
      const auctioneerAddress = await auctionContract.methods
        .auctioneerAddress()
        .call();
      if (auctioneerAddress === account) {
        auctions.push(address);
      }
    })
  ).then(a => {
    return auctions;
  });
  return auctions;
}
