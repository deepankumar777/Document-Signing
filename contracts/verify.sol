// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract sign{

    struct MyData {
    string ipfsCid;
    bytes signature;
    string fileHash;
    address userAddress;
    }

    mapping(address=>MyData) public userData;

    event MyDataUploaded(string ipfsCid, bytes signature, string fileHash, address indexed userAddress);
    event check(address user);


    function addUserDetails(string memory _ipfsCid, bytes memory _signature, string memory _fileHash, address _userAddress)public{
        MyData memory newMyData = MyData({
            ipfsCid: _ipfsCid,
            signature: _signature,
            fileHash: _fileHash,
            userAddress: _userAddress
        });

        userData[_userAddress] = newMyData;

        emit MyDataUploaded(_ipfsCid, _signature, _fileHash, _userAddress);

    }

    function getUserDetails(address _userAddress)public view returns(MyData memory) {
        return userData[_userAddress];

    }

    function verifySignature(
        string memory _fileHash, 
        address _userAddress,
        bytes memory _signature
    ) public  returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked( _fileHash));
        bytes32 signatureHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
         (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        address recoveredAddress = ecrecover(signatureHash, v,r,s);
        emit check(recoveredAddress);
        return (recoveredAddress == _userAddress);
    }
//0xbaBC8ac93F69aA381FC1288d2e176052a04068B9

     function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}