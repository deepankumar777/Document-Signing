const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Readable } = require("stream");
const multer = require("multer");
const { create } = require('ipfs-http-client');

const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const ethers = require('ethers');
const { ObjectId } = require('mongodb');
//const detectProvider = require('@metamask/detect-provider');
const detectEthereumProvider = require('@metamask/detect-provider');





let id;
const app = express();
app.use(bodyParser.json()); // for parsing application/json

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));

app.use((req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].startsWith("multipart/form-data")
  ) {
    req.headers["content-type"] =
      req.headers["content-type"] + "; boundary=" + req.query.boundary;
  }
  next();
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     //const uniqueSuffix = ".pdf"
//     cb(null,  file.originalname);
//   },
// });

//const upload = multer({ storage: storage });
// const up = multer({storage :sto});
const up = multer();
const ipfs = create('http://localhost:5001' );


app.post("/", up.single("file"), async (req, res) => {
  // console.log("body ==", JSON.stringify(req.body));
  // console.log("files ==", req.file);
  // //req.file.filename += '.pdf'
  // console.log(req.headers["content-type"]);
  // res.send("done");

  const { address } = req.body;
   console.log("add",address);
   //console.log(req.file);
  const pdfDoc = await PDFDocument.load(req.file.buffer);
  const pages = pdfDoc.getPages();
  console.log(pages)
  console.log(pages.length)
  const page =  pdfDoc.addPage()
  await pdfDoc.save();

  
  page.drawText(`Address: ${address}`, {
    x: 50,
    y: 50,
    size: 12,
  });
  const modifiedPdfData = await pdfDoc.save();

  fs.writeFileSync(
    __dirname + "/uploads/" + req.file.originalname,
    modifiedPdfData
  ); 


  //res.setHeader('Content-Type', 'application/pdf');
  const stream = new Readable();
  stream.push(modifiedPdfData);
  stream.push(null);
  // stream.pipe(res);

  const filePath = __dirname + '/uploads/' + req.file.originalname;
  const fileBuffer = fs.readFileSync(filePath);


  const ipfsFile = await ipfs.add(fileBuffer);
  const ipfsUrl = `https://ipfs.io/ipfs/${ipfsFile.cid.toString()}`;
  console.log("IpfsURL = ",ipfsUrl);
  const ipfsCid = ipfsFile.cid.toString();
  console.log("IpfsCID",ipfsCid);

  const hash = crypto.createHash('sha256');
  hash.update(req.file.buffer);
  const fileHash = hash.digest('hex');
  console.log("Filehash",fileHash)

  id = saveToFileDetails(ipfsUrl,fileHash,address);

  


  res.send({CID: ipfsCid,HASH:fileHash})
});

app.post("/sign-pdf", async (req, res) => {
   const { HASH } = req.body;
   console.log("ha"+HASH);
   
//const privateKey = '92756ce0d4f02606283588e705947f9b934866d63b080dee1ac80f1eef0e4649';
// const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/d718b91088494cf4bf56743003935fe5');
// const wallet = new ethers.Wallet(privateKey, provider);
// console.log("WA"+wallet.address);
// //0xbaBC8ac93F69aA381FC1288d2e176052a04068B9

// const message = HASH;
// let messageHash = ethers.utils.id(message);

// let messageHashBytes = ethers.utils.arrayify(messageHash)
// let flatSig = await wallet.signMessage(messageHashBytes);


//const signature = await wallet.signMessage(message);

const message = HASH;
//const provider = new ethers.providers.Web3Provider(window.ethereum);
 //const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/d718b91088494cf4bf56743003935fe5');
 //await ethereum.request({ method: 'eth_requestAccounts' });
 //await provider.send('eth_requestAccounts', []);

// const signer = provider.getSigner();
// let sign;
// signer.signMessage(message).then((signature) => {
//   console.log('Signature:', signature);
//   sign = signature;
// }).catch((error) => {
//   console.error(error);
// });

//console.log("sig"+flatSig);

// const provider = await detectProvider();
//   if (!provider) {
//     console.error('Metamask not detected');
//     return;
//   }

//   const web3Provider = new ethers.providers.Web3Provider(provider);
//   await web3Provider.send('eth_requestAccounts', []);
//   const signer = web3Provider.getSigner();
  
//   const sign = await signer.signMessage(message);
//   console.log('Signature:', sign);


const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/d718b91088494cf4bf56743003935fe5');
await ethereum.request({ method: 'eth_requestAccounts' });
const signer = provider.getSigner();
let sign;
sign = await signer.signMessage(message);


//error
// /home/calibraint/t2/backend/node_modules/@ethersproject/logger/lib/index.js:238
//         var error = new Error(message);
//                     ^

// Error: unknown account #0 (operation="getAddress", code=UNSUPPORTED_OPERATION, version=providers/5.7.2)
//     at Logger.makeError (/home/calibraint/t2/backend/node_modules/@ethersproject/logger/lib/index.js:238:21)
//     at Logger.throwError (/home/calibraint/t2/backend/node_modules/@ethersproject/logger/lib/index.js:247:20)
//     at /home/calibraint/t2/backend/node_modules/@ethersproject/providers/lib/json-rpc-provider.js:244:24
//     at processTicksAndRejections (node:internal/process/task_queues:96:5) {
//   reason: 'unknown account #0',
//   code: 'UNSUPPORTED_OPERATION',
//   operation: 'getAddress'
// }

//error
// ReferenceError: ethereum is not defined
//     at /home/calibraint/t2/backend/index.js:168:1
//     at Layer.handle [as handle_request] (/home/calibraint/t2/backend/node_modules/express/lib/router/layer.js:95:5)
//     at next (/home/calibraint/t2/backend/node_modules/express/lib/router/route.js:144:13)
//     at Route.dispatch (/home/calibraint/t2/backend/node_modules/express/lib/router/route.js:114:3)
//     at Layer.handle [as handle_request] (/home/calibraint/t2/backend/node_modules/express/lib/router/layer.js:95:5)
//     at /home/calibraint/t2/backend/node_modules/express/lib/router/index.js:284:15
//     at Function.process_params (/home/calibraint/t2/backend/node_modules/express/lib/router/index.js:346:12)
//     at next (/home/calibraint/t2/backend/node_modules/express/lib/router/index.js:280:10)
//     at /home/calibraint/t2/backend/index.js:38:3
//     at Layer.handle [as handle_request] (/home/calibraint/t2/backend/node_modules/express/lib/router/layer.js:95:5)
res.send({Sign:sign,mongoid: id})
updateDetails(id,sign)

id = null;



});

async function saveToFileDetails(ipfsUrl, fileHash, address) {
  try {
    console.log("ji")
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('fileDetails');
    const collection = db.collection('files');
    console.log("kk")
    const result = await collection.insertOne({
      ipfsUrl: ipfsUrl,
      fileHash: fileHash,
      address: address,
      createdAt: new Date()
    });
    console.log("ll")
    console.log(`Saved file details with id: ${result.insertedId}`);
    id = result.insertedId;
    client.close();
  } catch (error) {
    console.error(error);
  }
}

async function updateDetails(id,signature){
  console.log(id)
  
  
  


  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('fileDetails');
  const collection = db.collection('files');

  const filter = { _id: id };
  const update = { $set: { UserSignedHash: signature } };

  collection.updateOne(filter, update, (err, result) => {
    if (err) throw err;
    
    console.log(result.modifiedCount + ' document updated');
    
    client.close();

  })
}


app.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
