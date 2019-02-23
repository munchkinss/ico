pragma solidity >=0.4.22<0.60;
import './DappToken.sol';
contract DappTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    event Sell(
        address _buyer,
        uint256 _amount
    );
    constructor(DappToken _tokenContract,uint256 _tokenPrice) public {
        //admin
        //assisgn a token contract
        //price
        admin=msg.sender;
        tokenContract=_tokenContract;
        tokenPrice=_tokenPrice;

    }
    function multiply(uint x,uint y) internal pure returns(uint z){
        require(y==0||(z=x*y)/y==x);
    }
    
    function buyTokens(uint256 _numberOfTokens) public payable{
        
         //require that a transfer is successful
         require(msg.value== multiply(_numberOfTokens,tokenPrice )); 
        require(tokenContract.balanceOf(address(this))>=_numberOfTokens);
        require(tokenContract.transfer(msg.sender,_numberOfTokens));
         tokenSold+=_numberOfTokens;
         emit Sell(msg.sender,_numberOfTokens);

    }

    function endSale() public{
        //only admin can do this
        //transfer remaining dapp token to admin
        //destroy contract
        require(msg.sender==admin);
        require(tokenContract.transfer(msg.sender,tokenContract.balanceOf(address(this))));
        selfdestruct(msg.sender);
        
    }
}