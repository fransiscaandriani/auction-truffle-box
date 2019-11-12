import FToken from "nightfall/build/contracts/FToken";
import FTokenShield from "nightfall/build/contracts/FTokenShield";
import NFToken from "nightfall/build/contracts/NFToken";
import NFTokenShield from "nightfall/build/contracts/NFTokenShield";
import NFTokenMetadata from "nightfall/build/contracts/NFTokenMetadata";

export async function getFTokenContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = FToken.networks[networkId];
    const instance = await new web3.eth.Contract(
      FToken.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}

export async function getFTokenShieldContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = FTokenShield.networks[networkId];
    const instance = await new web3.eth.Contract(
      FTokenShield.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}

export async function getNFTokenContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = NFToken.networks[networkId];
    const instance = await new web3.eth.Contract(
      NFToken.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}

export async function getNFTokenShieldContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = NFTokenShield.networks[networkId];
    const instance = await new web3.eth.Contract(
      NFTokenShield.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}

export async function getNFTokenMetadataContract(web3) {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = NFTokenMetadata.networks[networkId];
    const instance = await new web3.eth.Contract(
      NFTokenMetadata.abi,
      deployedNetwork && deployedNetwork.address
    );
    return instance;
  } catch (error) {
    alert(`Failed to load AuctionFactory contract.`);
    console.error(error);
  }
}
