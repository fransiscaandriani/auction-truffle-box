const mockAuction = {
  name: "Mock Auction",
  desc: "Auction for testing purposes",
  bidEndTime: 1570406400,
  revealTime: 1570416400,
  winnerPaymentTime: 1570426400,
  maxBiddersCount: 20,
  fairnessFees: 5000000000,
  auctioneerRSAPublicKey: "abcde",
  k: 10,
  testing: true
};

export function createAuction(
  account,
  web3,
  contract,
  auctionData = mockAuction
) {
  contract.methods
    .createAuction(
      auctionData.name,
      auctionData.desc,
      auctionData.bidEndTime,
      auctionData.revealTime,
      auctionData.winnerPaymentTime,
      auctionData.maxBiddersCount,
      auctionData.fairnessFees,
      auctionData.auctioneerRSAPublicKey,
      auctionData.k,
      auctionData.testing
    )
    .send({
      from: account,
      value: web3.utils.toWei(auctionData.fairnessFees.toString(), "wei")
    });
}