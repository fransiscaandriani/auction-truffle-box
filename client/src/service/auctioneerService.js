import Cryptico from "cryptico-js";

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
