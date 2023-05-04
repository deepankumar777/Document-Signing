import React, { useState } from "react";



import { useDispatch, useSelector } from "react-redux";
import {
  connectWallet,
  disconnectWallet,
  selectFile,
  uploadFile,
  backToStart,
} from "../store/walletSlice.js";
import  { ethers } from 'ethers';
import { toUtf8Bytes } from "@ethersproject/strings";


function Wallet() {
  const dispatch = useDispatch();
  const { connected, address, selectedFile, uploadedFile } = useSelector(
    (state) => state.wallet
  );
  const [cid, setCid] = useState(null);
  const [hash, setHash] = useState(null);
  const [signedhash, setSignedhash] = useState(null);
  let userSign;
  const handleConnect = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    dispatch(connectWallet());
  };

  const handleDisconnect = async () => {
    dispatch(disconnectWallet());
  };

  const handleSelectFile = async (e) => {
    const file = e.target.files[0];
    if (file) dispatch(selectFile(file));
    console.log(selectedFile);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("address", window.ethereum.selectedAddress);
      fetch("http://localhost:3001", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the response as JSON data
          } else {
            throw new Error("Error uploading file.");
          }
        })
        .then((data) => {
          //console.log(data)
          const { CID, HASH } = data;

          dispatch(uploadFile());

          console.log(`CID: ${CID}`);
          console.log(`Hash: ${HASH}`);
          setCid(CID);
          setHash(HASH);
          console.log("File uploaded successfully.");
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert("Please select a PDF file to upload.");
    }
  };

  const handleSign = async () => {
    if (uploadedFile) {  
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
const signer = provider.getSigner();

console.log("okkk"+hash)
userSign = await signer.signMessage(hash);
console.log(userSign);
setSignedhash(userSign);
console.log("ll"+ signedhash)
 fetch("http://localhost:3001/sign-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:  JSON.stringify({HASH: userSign}) ,
      })
      .then((response) => {
            if (response.ok) {
              dispatch(backToStart());
              verify(hash,"0xbaBC8ac93F69aA381FC1288d2e176052a04068B9",userSign);
              console.log("File signed successfully");
              // console.log(response);
              return response.json();
            } else {
                    alert("Error signing file");
                  }
        })
           .then((data) => {
          //console.log(data);
          const { Sign, mongoid } = data;
          console.log(Sign);
          setCid(null);
          setHash(null);
        });

  

    }
    else {
        alert("Select a pdf file to sign");
      }
  };

  const verify= async(message,address,signature)=>{
    console.log("ooooooooo")
    console.log("hash", ethers.utils.hashMessage(message))
    const msgBytes = toUtf8Bytes(message);
    console.log("meBytes", msgBytes);
    console.log("Split",ethers.utils.splitSignature(signature));
    console.log("PRE", toUtf8Bytes("\x19Ethereum Signed Message:\n"));
    console.log("len", String(msgBytes.length));
    console.log("preBytes", toUtf8Bytes(String(message.length)));
    const sa= await ethers.utils.verifyMessage(message,signature);
    if(sa!==address)console.log("false");
    else console.log("true");
  }


  return (
    <div>
      {connected ? (
        <div>
          <p>Connected to {window.ethereum.selectedAddress}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}

      {connected && (
        <label>
          Select File:
          <input type="file" accept=".pdf" onChange={handleSelectFile} />
        </label>
      )}
      <>
        {selectedFile && (
          <button onClick={handleFileUpload}>Upload File</button>
        )}
        <br></br>
        {cid != null ? "Your Cid is-" + cid : " "}
        <br></br>
        {hash != null ? "Your file's hash -" + hash : " "}
        <br></br>
        {signedhash != null ? "User signed hash -" + signedhash : " "}
      </>
      <>
        <br></br>
        {uploadedFile && <button onClick={handleSign}>Sign File</button>}
      </>
      
    </div>
  );
}

export default Wallet;
