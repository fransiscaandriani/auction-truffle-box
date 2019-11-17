import {
  getNFTokenShieldContract,
  getNFTokenMetadataContract
} from "../utils/getNightfall";

// import config from "nightfall/code/config";
// import zkp from "nightfall/code/nf-token-zkp";
import zokrates from "nightfall/code/zokrates";
import vkIds from "nightfall/code/vkIds";
import { getPublicKey } from "../utils/getCurrentAccount";
// import utils() from "nightfall/code/zkp-utils()";
const utils = require("nightfall/code/zkp-utils");
const config = require("nightfall/code/config");
// const zokrates = require("nightfall/code/zokrates");
const zkp = require("nightfall/code/nf-token-zkp");
let container;

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

export async function mint(tokenId, web3, account) {
  const nfTokenShieldInstance = await getNFTokenShieldContract(web3);
  const ownerPublicKey = await getPublicKey(account);
  const salt = await utils().rndHex(32);
  const vkId = vkIds.MintToken;

  // console.group("\nIN MINT...");

  // console.info("Finding the relevant Shield and Verifier contracts...");
  // const verifier = await Verifier.deployed();
  // const verifier_registry = await Verifier_Registry.deployed();
  // console.log("NFTokenShield contract address:", nfTokenShieldInstance.address);
  // console.log("Verifier contract address:", verifier.address);
  // console.log("Verifier_Registry contract address:", verifier_registry.address);

  // Calculate new arguments for the proof:
  const commitment = utils().concatenateThenHash(
    utils()
      .strip0x(tokenId)
      .slice(-32 * 2),
    ownerPublicKey,
    salt
  );

  // Summarise values in the console:
  console.group("Existing Proof Variables:");
  const p = config.getProps().ZOKRATES_PACKING_SIZE; // packing size in bits
  const pt = Math.ceil(
    (config.getProps().INPUTS_HASHLENGTH * 8) /
      config.getProps().ZOKRATES_PACKING_SIZE
  ); // packets in bits
  console.log("A:", tokenId, " : ", utils().hexToFieldPreserve(tokenId, p, pt));
  console.log("Owner PK", ownerPublicKey);
  console.log(
    "pk_A:",
    ownerPublicKey,
    " : ",
    utils().hexToFieldPreserve(ownerPublicKey, p, pt)
  );
  console.log("S_A:", salt, " : ", utils().hexToFieldPreserve(salt, p, pt));
  console.groupEnd();

  console.group("New Proof Variables:");
  console.log(
    "z_A:",
    commitment,
    " : ",
    utils().hexToFieldPreserve(commitment, p, pt)
  );
  console.groupEnd();

  const publicInputHash = utils().concatenateThenHash(tokenId, commitment);
  console.log("publicInputHash:", publicInputHash);

  const inputs = computeVectors([
    new Element(publicInputHash, "field", 248, 1)
  ]);
  console.log("inputs:");
  console.log(inputs);

  // get the pwd so we can talk to the container:
  console.log("env", process.env);
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = config.getProps().NFT_MINT_DIR;
  console.log(hostDir);

  // compute the proof
  console.group("Computing proof with w=[pk_A,S_A] x=[A,z_A,1]");
  let proof = await computeProof(
    [
      new Element(publicInputHash, "field", 248, 1),
      new Element(tokenId, "field"),
      new Element(ownerPublicKey, "field"),
      new Element(salt, "field"),
      new Element(commitment, "field")
    ],
    hostDir
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils().flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils().hexToDec(el));
  console.groupEnd();

  // make token shield contract an approver to transfer this token on behalf of the owner (to comply with the standard as msg.sender has to be owner or approver)
  await addApproverNFToken(
    nfTokenShieldInstance.address,
    tokenId,
    account,
    web3
  );

  // with the pre-compute done we can mint the token, which is now a reasonably light-weight calculation
  const commitmentIndex = await zkp.mint(
    proof,
    inputs,
    vkId,
    tokenId,
    commitment,
    account,
    nfTokenShieldInstance
  );

  console.log(
    "Mint output: [z_A, z_A_index]:",
    commitment,
    commitmentIndex.toString()
  );
  console.log("MINT COMPLETE\n");
  console.groupEnd();

  return { commitment, commitmentIndex };
}

function computeVectors(elements) {
  let a = [];
  elements.forEach(element => {
    switch (element.encoding) {
      case "bits":
        a = a.concat(utils().hexToBin(utils().strip0x(element.hex)));
        break;

      case "bytes":
        a = a.concat(utils().hexToBytes(utils().strip0x(element.hex)));
        break;

      case "field":
        // each vector element will be a 'decimal representation' of integers modulo a prime. p=21888242871839275222246405745257275088548364400416034343698204186575808495617 (roughly = 2*10e76 or = 2^254)
        a = a.concat(
          utils().hexToFieldPreserve(
            element.hex,
            element.packingSize,
            element.packets,
            1
          )
        );
        break;

      default:
        throw new Error("Encoding type not recognised");
    }
  });
  return a;
}

async function setupComputeProof(hostDir) {
  container = await zokrates.runContainerMounted(hostDir);
}

/**
This function computes a proof that you own a token, using as few parameters
as possible.  If you haven't yet deployed the code to the docker container to
enable this computation, this routine will call setupComputeProof to do that for
you.
@param {array} elements - array containing all of the token commitment parameters the proof needs
@param {string} tar - the tar file containing all the code needed to compute the proof
@returns {object} proof
*/
async function computeProof(elements, hostDir) {
  if (container === undefined || container === null)
    await setupComputeProof(hostDir);

  console.log(`Container id: ${container.id}`);
  console.log(
    `To connect to the container manually: 'docker exec -ti ${container.id} bash'`
  );

  await zokrates.computeWitness(container, computeVectors(elements), hostDir);

  const proof = await zokrates.generateProof(container, undefined, hostDir);

  console.group(`Proof: ${JSON.stringify(proof, undefined, 2)}`);
  console.groupEnd();

  zokrates.killContainer(container);
  container = null; // clear out the container for the next run

  return proof;
}

async function addApproverNFToken(approved, tokenID, address, web3) {
  console.log("Adding Approver for an NF Token", approved, tokenID, address);
  const nfToken = await getNFTokenMetadataContract(web3);
  return nfToken.approve(approved, tokenID, {
    from: address,
    gas: 4000000
  });
}

class Element {
  constructor(hex, encoding, packingSize, packets) {
    const allowedEncoding = ["bits", "bytes", "field"];

    if (!allowedEncoding.includes(encoding))
      throw new Error("Element encoding must be one of:", allowedEncoding);

    if (hex === undefined) throw new Error("Hex string was undefined");
    if (hex === "") throw new Error("Hex string was empty");
    if (!utils().isHex(hex))
      throw new Error(`This does not appear to be hex:${hex.toString()}`);

    this.hex = utils().ensure0x(hex);
    this.encoding = encoding;
    if (encoding === "field") {
      this.packingSize = packingSize || config.getProps().ZOKRATES_PACKING_SIZE;
    }
    if (packets !== undefined) this.packets = packets;
  }
}
