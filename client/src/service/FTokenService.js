export async function mintFToken(contract, account, amount) {
  try {
    await contract.methods.mint(account, amount).send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Minting unsuccessful`);
  }
}

export async function approveFToken(contract, account, amount) {
  try {
    await contract.methods.approve(account, amount).send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Approving unsuccessful`);
  }
}
export async function transferFToken(contract, account, to, amount) {
  try {
    await contract.methods
      .transferFrom(account, to, amount)
      .send({ from: account });
  } catch (error) {
    console.log(error);
    alert(`Transferring unsuccessful`);
  }
}
