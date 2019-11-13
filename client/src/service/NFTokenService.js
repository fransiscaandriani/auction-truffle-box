export async function mintNFToken(contract, account, uri) {
  const randomHex = `0x${Math.floor(Math.random() * 10e14)
    .toString(16)
    .padEnd(64, "0")}`; // create a random number, left-padded to 64 octets

  try {
    await contract.methods.mint(randomHex, uri).send({ from: account });
    console.log(randomHex);
    return randomHex;
  } catch (error) {
    console.log(error);
  }
}

export async function transferNFToken(contract, account, to, tokenId) {
  try {
    await contract.methods
      .transferFrom(account, to, tokenId)
      .send({ from: account });
  } catch (error) {
    console.log(error);
  }
}
