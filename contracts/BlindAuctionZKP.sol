pragma solidity >0.4.18;
import "./Pedersen.sol";
contract Auction {
    enum VerificationStates {Init, Challenge,ChallengeDelta, Verify, VerifyDelta, ValidWinner}
    struct Bidder {
        uint commitX;
        uint commitY;
        string cipher;
        bool validProofs;
        bool paidBack;
        bool existing;
    }
    Pedersen pedersen;
    bool withdrawLock;
    VerificationStates public states;
    address private challengedBidder;
    uint private challengeBlockNumber;
    bool private testing; //for fast testing without checking time intervals
    uint8 private K = 10; //number of multiple rounds per ZKP
    uint public Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    uint public maxBid = 5472060717959818805561601436314318772174077789324455915672259473661306552145;
    uint[] commits;
    uint[] deltaCommits;
    mapping(address => Bidder) public bidders;
    address[] public indexs;
    uint mask = 1;

    //Auction Parameters
    address payable public auctioneerAddress;
    uint    public bidEndTime;
    uint    public revealTime;
    uint    public winnerPaymentTime;
    uint    public maxBiddersCount;
    uint    public fairnessFees;
    string  public auctioneerRSAPublicKey;
    //these values are set when the auctioneer determines the winner
    address public winner;
    uint public highestBid;

    //Constructor = Setting all Parameters and auctioneerAddress as well
    constructor(uint _bidEndTime, uint _revealTime, uint _winnerPaymentTime, uint _maxBiddersCount,
     uint _fairnessFees, string memory _auctioneerRSAPublicKey, address pedersenAddress, uint8 k, bool _testing,
     address payable _auctioneerAddress, uint _auctioneerDeposit )
     public {
        require(_auctioneerDeposit >= _fairnessFees, "Deposit too low");
        auctioneerAddress = _auctioneerAddress;
        bidEndTime = _bidEndTime;
        revealTime = _revealTime;
        winnerPaymentTime = _winnerPaymentTime;
        maxBiddersCount = _maxBiddersCount;
        fairnessFees = _fairnessFees;
        auctioneerRSAPublicKey = _auctioneerRSAPublicKey;
        pedersen = Pedersen(pedersenAddress);
        K = k;
        testing = _testing;
    }

    function BidderData(address account) public view returns(bool, bool, bool, bool) {
      bool hasBid = bidders[account].existing;
      bool paidBack = bidders[account].paidBack;
      bool bidderExceeds = indexs.length>=maxBiddersCount;
      bool isWinner = account == winner;
      return(hasBid, bidderExceeds, paidBack, isWinner);
    }

    function AuctionData() public view returns(uint, uint, uint, uint, VerificationStates){
      return(bidEndTime, revealTime, winnerPaymentTime, fairnessFees, states);
    }

    function BiddersAddresses() public view returns(address[] memory){
      return indexs;
    }

    function Bid(uint cX, uint cY) public payable
    onlyBefore(bidEndTime)
    {
        require(indexs.length < maxBiddersCount, "Too many bidders"); //available slot
        require(msg.value >= fairnessFees, "Fee sent below fairness fee");  //paying fees
        require(bidders[msg.sender].existing == false, "Bidder has bid before");
        bidders[msg.sender] = Bidder(cX, cY,"", false, false,true);
        indexs.push(msg.sender);
    }
    function Reveal(string memory cipher) public
    onlyBefore(revealTime)
    onlyAfter(bidEndTime)
    {
        require(bidders[msg.sender].existing == true, "Bidder does not exist"); //existing bidder
        bidders[msg.sender].cipher = cipher;
    }

    function ClaimWinner(address _winner, uint _bid, uint _r) public challengeByAuctioneer {
        require(states == VerificationStates.Init, "ClaimWinner has been done before");
        require(bidders[_winner].existing == true, "Bidder that is deemed to be winner does not exist"); //existing bidder
        require(_bid < maxBid, "Bid exceeds maximum bid"); //valid bid
        require(pedersen.Verify(_bid, _r, bidders[_winner].commitX, bidders[_winner].commitY),
        "Open winner commit not valid"); //valid open of winner's commit
        winner = _winner;
        highestBid = _bid;
        states = VerificationStates.Challenge;
    }
    function ZKPCommit(address y, uint[] memory _commits, uint[] memory _deltaCommits) public challengeByAuctioneer {
        require(states == VerificationStates.Challenge || testing, "Auction state is not Challenge");
        require(_commits.length == K*4, "Commits of wrong length");
        require(_commits.length == _deltaCommits.length, "deltaCommits of wrong length");
        require(bidders[y].existing == true, "Bidder does not exist"); //existing bidder
        challengedBidder = y;
        challengeBlockNumber = block.number;
        for(uint i = 0; i < _commits.length; i++)
            if(commits.length == i) {
                commits.push(_commits[i]);
                deltaCommits.push(_deltaCommits[i]);
            } else {
                commits[i] = _commits[i];
                deltaCommits[i] = _deltaCommits[i];
            }
        states = VerificationStates.Verify;
    }

    function ZKPVerify(uint[] memory response, uint[] memory deltaResponses) public {
        require(states == VerificationStates.Verify || states == VerificationStates.VerifyDelta,
        "State not Verify or VerifyDelta");
        uint8 count = 0;
        uint hash = uint(blockhash(challengeBlockNumber));
        mask = 1;
        uint i = 0;
        uint j = 0;
        uint cX;
        uint cY;
        while(i<response.length && j<commits.length) {
            if(hash&mask == 0) {
                require((response[i] + response[i+2])%Q==maxBid, "Wrong response");
                require(pedersen.Verify(response[i], response[i+1], commits[j], commits[j+1]), "Not verified 1");
                require(pedersen.Verify(response[i+2], response[i+3], commits[j+2], commits[j+3]), "Not verified 2");
                i += 4;
            } else {
                if(response[i+2] == 1) //z=1
                    (cX, cY) = pedersen.ecAdd(bidders[challengedBidder].commitX, bidders[challengedBidder].commitY, commits[j], commits[j+1]);
                else
                    (cX, cY) = pedersen.ecAdd(bidders[challengedBidder].commitX, bidders[challengedBidder].commitY, commits[j+2], commits[j+3]);
                require(pedersen.Verify(response[i], response[i+1], cX, cY), "Not verified 3");
                i += 3;
            }
            j += 4;
            mask = mask << 1;
            count++;
        }
        require(count==K, "wrong count");
        count = 0;
        i = 0;
        j = 0;
        while(i<deltaResponses.length && j<deltaCommits.length) {
            if(hash&mask == 0) {
                require((deltaResponses[i] + deltaResponses[i+2])%Q==maxBid, "wrong deltaResponse");
                require(pedersen.Verify(deltaResponses[i], deltaResponses[i+1], deltaCommits[j], deltaCommits[j+1]), "delta not verified 1");
                require(pedersen.Verify(deltaResponses[i+2], deltaResponses[i+3], deltaCommits[j+2], deltaCommits[j+3]), "delta not verified 2");
                i += 4;
            } else {
            (cX, cY) = pedersen.CommitDelta(bidders[winner].commitX, bidders[winner].commitY, bidders[challengedBidder].commitX, bidders[challengedBidder].commitY);
            if(deltaResponses[i+2]==1)
                (cX, cY) = pedersen.ecAdd(cX,cY, deltaCommits[j], deltaCommits[j+1]);
            else
                (cX, cY) = pedersen.ecAdd(cX,cY, deltaCommits[j+2], deltaCommits[j+3]);
            require(pedersen.Verify(deltaResponses[i],deltaResponses[i+1],cX,cY), "delta not verified 3");
            i += 3;
            }
            j += 4;
            mask = mask << 1;
            count++;
        }
        require(count==K, "wrong count");
        bidders[challengedBidder].validProofs = true;
        states = VerificationStates.Challenge;
    }
    function VerifyAll() public challengeByAuctioneer
    {
        for (uint i = 0; i<indexs.length; i++)
                if(indexs[i] != winner)
                    if(!bidders[indexs[i]].validProofs) {
                        winner = address(0);
                        revert("not verified");
                    }
        states = VerificationStates.ValidWinner;
    }
    function Withdraw() public
    {
        require((states == VerificationStates.ValidWinner || now > winnerPaymentTime), "Bidder not allowed to Withdraw");
        require(msg.sender != winner, "Winner cannot withdraw");
        require(bidders[msg.sender].paidBack == false && bidders[msg.sender].existing == true, "Bidder has withdrawn or does not exist");
        require(withdrawLock == false, "Withdraw is currently locked");
        withdrawLock = true;
        msg.sender.transfer(fairnessFees);
        bidders[msg.sender].paidBack = true;
        withdrawLock = false;
    }
    function WinnerPay() public payable {
        require(states == VerificationStates.ValidWinner, "Not time to pay yet");
        require(msg.sender == winner, "Bidder is not the winner");
        require(msg.value >= highestBid - fairnessFees, "Value is less than promised bid");
    }
    function Destroy() public {
        selfdestruct(auctioneerAddress);
    }
    modifier challengeByAuctioneer() {
        require(msg.sender == auctioneerAddress, "Only auctioneer can perform this operation"); //by auctioneer only
        require(now > revealTime && now < winnerPaymentTime || testing,
        "Now is not the time to perform this operation"); //after reveal and before winner payment
        _;
    }

    modifier onlyBefore(uint _time) {require(now < _time || testing, "Not time yet"); _;}
    modifier onlyAfter(uint _time) {require(now > _time || testing, "Time has passed"); _;}
}