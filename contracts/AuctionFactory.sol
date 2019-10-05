
pragma solidity >0.4.18;
import {Auction} from "./BlindAuctionZKP.sol";
import {Pedersen} from "./Pedersen.sol";

contract AuctionFactory {
    address[] public auctions;
    address public pedersen;

    event AuctionCreated(address auctionContract, address owner, uint numAuctions, address[] allAuctions);

    constructor() public {
      pedersen = address(new Pedersen());
    }

    function createAuction(string memory _name, string memory _desc, uint _bidEndTime, uint _revealTime,
    uint _winnerPaymentTime, uint _maxBiddersCount, uint _fairnessFees, string memory _auctioneerRSAPublicKey,
    uint8 k, bool _testing) public {
        Auction newAuction = new Auction(_name, _desc, _bidEndTime, _revealTime, _winnerPaymentTime, _maxBiddersCount,
        _fairnessFees, _auctioneerRSAPublicKey, pedersen, k, _testing);
        auctions.push(address(newAuction));

        emit AuctionCreated(address(newAuction), msg.sender, auctions.length, auctions);
    }

    function allAuctions() public view returns (address[] memory) {
        return auctions;
    }
}
