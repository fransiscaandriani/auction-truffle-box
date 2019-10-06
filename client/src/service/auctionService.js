import Cryptico from "cryptico-js";

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

export async function getAllAuctionsData(web3, contract) {
  var auctionsData = [];
  const auctionsAddresses = await contract.methods.allAuctions().call();
  auctionsAddresses.forEach(async function(address) {
    const temp = await contract.methods.getAuctionData(address).call();
    const data = { address: address, name: temp[0], desc: temp[1] };
    auctionsData.push(data);
  });

  return auctionsData;
}
