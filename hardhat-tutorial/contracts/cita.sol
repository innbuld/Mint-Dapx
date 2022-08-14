 // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.4;
  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";

  contract cita is ERC721Enumerable, Ownable {
      //_baseTokenURI for computing {tokenURI}. If set, the resulting URI for each 
      //token will be the concatenation of the `baseURI` and the `tokenId`.

      string _baseTokenURI;

      //  _price is the price of one each  NFT
      uint256 public _price = 0.00 ether;

      // _paused is used to pause the contract in case of an emergency
      bool public _paused;

      // max number of supply of the nft
      uint256 public maxTokenIds = 333;

      // total number of tokenIds minted
      uint256 public tokenIds;

      // boolean to keep track of whether mint started or not
      bool public presaleStarted;

      // timestamp for when mint would end
      uint256 public presaleEnded;

      modifier onlyWhenNotPaused {
          require(!_paused, "Mint currently paused");
          _;
      }

      /**
       *  ERC721 constructor takes in a `name` and a `symbol` to the token collection.
       * Constructor for Cita nft takes in the baseURI to set _baseTokenURI for the collection.
       * It also initializes an instance of whitelist interface.
       */
      constructor (string memory baseURI) ERC721("Cita", "CT") {
          _baseTokenURI = baseURI;
          
      }

      /**
      * startPresale starts a presale for the nft collection
       */
      function startPresale() public onlyOwner {
          presaleStarted = true;
      }

      /**
      *  mint allows a user to mint 1 NFT per transaction after the presale has ended.
      */
      function mint() public payable onlyWhenNotPaused {
          require(presaleStarted == true, "Sale has not started"); // check if sale has started
          require(tokenIds < maxTokenIds, "Exceed maximum Cita supply"); // checks if supply is still available
          require(msg.value >= _price, "Ether sent is not correct"); // check if price sent is correct
          tokenIds += 1;
          _safeMint(msg.sender, tokenIds); // transfer nft to buyer
      }

      /**
      * _baseURI overides the Openzeppelin's ERC721 implementation which by default
      * returned an empty string for the baseURI
      */
      function _baseURI() internal view virtual override returns (string memory) {
          return _baseTokenURI;
      }

      /**
        setPaused makes the contract paused or unpaused
       */
      function setPaused(bool val) public onlyOwner {
          _paused = val;
      }

      /**
      * dev withdraw sends all the ether in the contract
      * to the owner of the contract
       */
      function withdraw() public onlyOwner  {
          address _owner = owner();
          uint256 amount = address(this).balance;
          (bool sent, ) =  _owner.call{value: amount}("");
          require(sent, "Failed to send Ether");
      }

       // Function to receive Ether. msg.data must be empty
      receive() external payable {}

      // Fallback function is called when msg.data is not empty
      fallback() external payable {}
  }


  // contract deployed; 0x5DaAbF27F04763FC8411d144c59FD77A90701199