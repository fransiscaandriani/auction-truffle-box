export async function getCurrentAccount(web3) {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

export default getCurrentAccount;
