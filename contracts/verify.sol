// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";

contract a{

        bytes32 h;
      function convert(string memory str) public  returns (bytes32) {
        bytes32 result;
        assembly {
            result := mload(add(str, 32))
        }
        
        h = result;
        return result;
    }

    function getLen(string memory _fileHash) public pure returns(string memory){
        return Strings.toString(utfStringLength(_fileHash));
    }
    
    function getBytes(string memory _fileHash) public pure returns (bytes memory, bytes memory, bytes memory, bytes memory) {
        return (
        bytes("\x19Ethereum Signed Message:\n"), 
        bytes(Strings.toString(utfStringLength(_fileHash))), 
        bytes(_fileHash), 
        bytes.concat(bytes("\x19Ethereum Signed Message:\n"), bytes(Strings.toString(utfStringLength(_fileHash))), bytes(_fileHash)));
    }

    function getHash(string memory _fileHash) public pure returns(bytes32) {
        return keccak256(bytes.concat(bytes("\x19Ethereum Signed Message:\n"), bytes(Strings.toString(utfStringLength(_fileHash))), bytes(_fileHash)));
    }

    function utfStringLength(string memory str) pure internal returns (uint length) {
    uint i=0;
    bytes memory string_rep = bytes(str);

    while (i<string_rep.length)
    {
        if (string_rep[i]>>7==0)
            i+=1;
        else if (string_rep[i]>>5==bytes1(uint8(0x6)))
            i+=2;
        else if (string_rep[i]>>4==bytes1(uint8(0xE)))
            i+=3;
        else if (string_rep[i]>>3==bytes1(uint8(0x1E)))
            i+=4;
        else
            //For safety
            i+=1;

        length++;
    }
}


    function getAddr(bytes32 signHash, bytes memory _signature) public pure returns(address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(signHash, v, r, s);
    }

    function verifySignature(string memory _fileHash, bytes memory _signature, address signer) public pure returns (bool) {
    // bytes32 hash = keccak256(abi.encodePacked(message));
    // return ECDSA.recover(hash, signature) == signer;

        // bytes32 messageHash = keccak256(abi.encodePacked( _fileHash));
        // bytes32 signatureHash = keccak256(bytes.concat(bytes("\x19Ethereum Signed Message:\n"),  bytes(Strings.toString(utfStringLength(_fileHash))), bytes(_fileHash)));
        bytes32 signatureHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", Strings.toString(utfStringLength(_fileHash)), _fileHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        address recoveredAddress = ecrecover(signatureHash, v,r,s);
        // emit check(recoveredAddress);
        return (recoveredAddress == signer);
}

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
