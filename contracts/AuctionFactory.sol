pragma solidity >0.4.18;
import {Auction} from "./BlindAuctionZKP.sol";
import {Pedersen} from "./Pedersen.sol";

contract AuctionFactory {
    struct AuctionData {
      string name;
      string desc;
      Auction auctionContract;
    }
    address[] public auctionsAddresses;
    mapping (address => AuctionData) auctions;
    address public pedersen;

    event AuctionCreated(address auctionContract, address owner, uint numAuctions, address[] allAuctions);

    constructor() public {
      pedersen = address(new Pedersen());
    }

    function createAuction(string memory _name, string memory _desc, uint _bidEndTime, uint _revealTime,
    uint _winnerPaymentTime, uint _maxBiddersCount, uint _fairnessFees, string memory _auctioneerRSAPublicKey,
    uint8 k, bool _testing) public payable {
        Auction newAuction = new Auction(_bidEndTime, _revealTime, _winnerPaymentTime, _maxBiddersCount,
        _fairnessFees, _auctioneerRSAPublicKey, pedersen, k, _testing, msg.sender, msg.value);
        auctionsAddresses.push(address(newAuction));
        auctions[address(newAuction)] = AuctionData(_name, _desc, newAuction);

        emit AuctionCreated(address(newAuction), msg.sender, auctionsAddresses.length, auctionsAddresses);
    }

    function allAuctions() public view returns (address[] memory) {
        return auctionsAddresses;
    }

    function getAuctionData(address _address) public view returns (string memory, string memory){
      return (auctions[_address].name, auctions[_address].desc);
    }
}
