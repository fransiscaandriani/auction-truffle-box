import accountList from "./accounts";
// import Wallet from "ethereumjs-wallet";
var Wallet = require("ethereumjs-wallet");
var EthUtil = require("ethereumjs-util");

export async function getCurrentAccount(web3) {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

export async function getPublicKey(account) {
  console.log(accountList);
  const privateKey = "0x" + accountList[account];
  console.log("1", privateKey);
  const privateKeyBuffer = await EthUtil.toBuffer(privateKey);
  console.log("2", privateKeyBuffer);
  const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
  const publicKey = wallet.getPublicKeyString();
  return publicKey;
}
export default getCurrentAccount;
