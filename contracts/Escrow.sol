//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Interface for interacting with ERC721 tokens, which are Non-Fungible Tokens (NFTs).
interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

// A contract to handle the escrow for NFT transactions, ensuring secure transfers and conditions fulfillment.
contract Escrow {
    // Addresses for the NFT contract, seller, inspector, and lender involved in the transaction.
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    // Modifier to restrict function access to the buyer of a specific NFT.
    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only the buyer can call this method");
        _;
    }

    // Modifier to restrict function access to the seller.
    modifier onlySeller() {
        require(msg.sender == seller, "Only the seller can call this method");
        _;
    }

    // Modifier to restrict function access to the inspector.
    modifier onlyInspector() {
        require(msg.sender == inspector, "Only the inspector can call this method");
        _;
    }

    // State variables to manage NFT listings, payments, buyers, and approvals.
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    // Constructor to set initial roles and addresses.
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    // List an NFT for sale with specified conditions.
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract, ensuring it is held securely during the escrow.
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        // Set listing status, price, escrow amount, and designated buyer.
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // Function for the buyer to deposit the escrow amount.
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    // Update the inspection status for the inspector only.
    function updateInspectionStatus(uint256 _nftID, bool _passed)
        public
        onlyInspector
    {
        inspectionPassed[_nftID] = _passed;
    }

    // Function for various parties to approve the sale.
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize the sale if all conditions are met.
    // Require inspection status (add more items here, like appraisal)
    // Require sale to be authorized
    // Require funds to be correct amount
    // Transfer NFT to buyer
    // Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        // Reset listing status.
        isListed[_nftID] = false;

        // Transfer funds to seller.
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        // Transfer NFT to buyer.
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel the sale and handle the earnest deposit based on inspection status.
    // if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }
    // Function to receive payments to the contract.
    receive() external payable {}

    // Return the contract's current balance.
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
