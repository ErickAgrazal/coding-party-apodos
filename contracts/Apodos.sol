pragma solidity 0.4.24;


contract Apodos {

	mapping(address => bytes32) nicknames;
	mapping(address => bool) alreadyHasANickname;
	mapping(bytes32 => bool) alreadyNicknameExist;

	event LogNickname(bytes32 registeredNickname);
	event LogTransferNickname(address newOwner, bytes32 transferedNickname);

	constructor() public{}

	modifier newRegistrar(){
		require(alreadyHasANickname[msg.sender] == false);
		_;
	}

	modifier isNicknameOwner(){
		require(alreadyHasANickname[msg.sender] == true);
		_;
	}

	modifier isValidReceiver(address _newOwner){
		require(alreadyHasANickname[_newOwner] == false);
		_;
	}

	modifier isAvailable(bytes32 nickname){
		require(alreadyNicknameExist[nickname] == false);
		_;
	}

	function registerNickname(bytes32 _nickname)
	external
	newRegistrar
	isAvailable(_nickname)
	{
		nicknames[msg.sender] = _nickname;
		alreadyHasANickname[msg.sender] = true;
		alreadyNicknameExist[_nickname] = true;
		emit LogNickname(_nickname);
	} 

	function getMyNickname()
	external
	view
	returns(bytes32)
	{
		return(nicknames[msg.sender]);
	}

	function transferNickname(address _newOwner)
	external
	isNicknameOwner
	isValidReceiver(_newOwner)
	{
		nicknames[_newOwner] = nicknames[msg.sender];
		alreadyHasANickname[_newOwner] = true;

		alreadyHasANickname[msg.sender] = false;
		emit LogTransferNickname(_newOwner, nicknames[msg.sender]);
	}

	function() payable public {}
}
