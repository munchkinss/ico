pragma solidity >=0.4.22<0.60;

contract DappToken {
    uint256 public totalSupply;
    
    string public name='DappToken';
    string public symbol='DAPP';
    string public standard='DAPP v1';
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 indexed _value
        );
    mapping (address=>uint256) public balanceOf;
    mapping (address=>mapping (address=>uint256)) public allowance;
    constructor (uint256 _initSupply) public {
        balanceOf[msg.sender]=_initSupply;
        totalSupply=_initSupply;
    }
    function transfer(address _to,uint256 _value) public returns (bool success){
        //Exception if doesn't have enough
        //Returns bool
        //transfer
        require(balanceOf[msg.sender]>=_value);//if true continue execution

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender,_to,_value);
        return true;
    }
    function approve(address _spender,uint256 _value)public returns(bool success){
        require(balanceOf[msg.sender]>=_value);
        allowance[msg.sender][_spender] =_value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }
    function transferFrom(address _from,address _to,uint256 _value)public returns(bool success){
        require(balanceOf[_from]>=_value);//if true continue execution
        require(allowance[_from][msg.sender]>=_value);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -=_value;
        
        emit Transfer(_from,_to,_value);
        return true;
    }
   
}