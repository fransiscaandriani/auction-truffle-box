import AuctionFactory from "../contracts/AuctionFactory.json";
import Auction from "../contracts/Auction.json";
import Pedersen from "../contracts/Pedersen.json";

export async function getAuctionFactoryContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = AuctionFactory.networks[networkId];
    const instance = await new web3.eth.Contract(
      AuctionFactory.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}

export async function getAuctionContract(web3, address) {
  try {
    const instance = await new web3.eth.Contract(Auction.abi, address);
    return instance;
  } catch (error) {
    alert(`Failed to load Auction contract.`);
    console.error(error);
  }
}

export async function getPedersenContract(web3) {
  try {
    const auctionFactory = await getAuctionFactoryContract(web3);
    const pedersenAddress = await auctionFactory.methods.pedersen().call();
    const instance = await new web3.eth.Contract(Pedersen.abi, pedersenAddress);
    return instance;
  } catch (error) {
    alert(`Failed to load Pedersen contract.`);
    console.error(error);
  }
}
