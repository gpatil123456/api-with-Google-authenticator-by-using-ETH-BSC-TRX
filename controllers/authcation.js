const { encrypt, compare } = require('../services/service');
const { generateOTP } = require('../services/service');
const { sendMail } = require('../services/service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generateJwt = require('../services/service')
const generateQRcode = require('../controllers/2fagoogle')
const qrcode = require('qrcode')
const speakeasy = require('speakeasy')
const Web3 = require('web3');
const web3 = new Web3("https://ropsten.infura.io/v3/fb1ba06292c44f5096eddfd2c2cbed75");
const Private_Key = 'e8f08c1da089e4d26e475dcbf420cf907ab500f4da58f2742e3c8693ab65b8d6';




const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.shasta.trongrid.io");

const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
const privateKey = "9879856e261a47411ee64888fa2578fdda86faa094a0a8e2fd5773975e5bc10a";
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);













exports.signUpUser = async (req, res) => {
  const { email, password } = req.body;
  const isExisting = await findUserByEmail(email);
  if (isExisting) {
    return res.send('Already existing');
  }
  // create new user
  const newUser = await createUser(email, password);
  if (!newUser[0]) {
    return res.status(400).send({
      message: 'Unable to create new user',
    });
  }

  res.send("data store successfully");
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email })
  const isValid = await bcrypt.compare(password, user.password);
  console.log(isValid);

  if (!isValid) {
    return res.status(400).json({
      statuscode: 400,
      status: 'Failed',
      message: "Invalid Credentials ",
      data: {}
    });

  }

  const token = await generateJwt.signToken(email);
  return res.status(200).json({
    statuscode: 200,

    status: 'Ok',
    message: "Login Successfully",
    data: {
      Token: token
    }


  })
}


exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  const user = await validateUserSignUp(email, otp);
  res.send(user);
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return false;
  }
  return user;
};

const createUser = async (email, password) => {
  const hashedPassword = await encrypt(password);
  const otpGenerated = generateOTP();
  const newUser = await User.create({
    email: email,
    password: hashedPassword,
    otp: otpGenerated,
  });
  if (!newUser) {
    return [false, 'Unable to sign you up'];
  }
  try {
    await sendMail(
      email,
      otpGenerated,
    );
    return [true, newUser];
  } catch (error) {
    return [false, 'Unable to sign up, Please try again later', error];
  }
};

const validateUserSignUp = async (email, otp) => {
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return [false, 'User not found'];
  }
  if (user && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    $set: { active: true },
  });
  return [true, updatedUser];
};




//ETH get balance

exports.balance = async (req, res) => {

  const { address } = req.body;

  
  try {
    var sender = address
    var value = web3.utils.fromWei(
      await web3.eth.getBalance(sender),
      'ether'
    )
    console.log(value);
    res.status(200).json({ value })
  } catch (error) {
    console.error(error);
    res.status(404).json({
      message: 'Account not found!',
     // address
    })
  }
}
//ETH transaction
exports.transaction = async (req, res) => {
const {email,from, to } = req.body;

try {

    var value = web3.utils.toWei('0.01', 'ether')
 
  var SignedTransaction = await web3.eth.accounts.signTransaction({
        from: from,
        to: to,
        value: value,
        
        gas: 2000000
    }, Private_Key);

    const Transfer = await web3.eth.sendSignedTransaction(SignedTransaction.rawTransaction)
    if(Transfer.transactionHash){

    const transaction = new Transaction({
      email:email,
        from: from,
        to: to,
        currency: value,
        //currency:currency,
        hash: Transfer.transactionHash,
        status: true
    });
    await transaction.save()
    .then((data) => {
        console.log(data, "inserted")
        return data
    })
    console.log(transaction)

    res.status(200).json({
        
        from,
        to,
        value,
        hash: Transfer.transactionHash,
        message: 'complete transaction'
    })
}
}
catch (error) {
    console.log(error);
    res.status(404).json({
        message: 'transaction not found!',

    })
}
}








exports.getbalanceTrx= async (req, res) => {
const { address } = req.body;
try {
    const balance = await tronWeb.trx.getBalance(address);
    console.log(balance);
    res.status(200).json({ balance })
} catch (error) {
    console.error(error);
    res.status(404).json({
        message: 'Account not found!',
        address
    })
}
}




exports.TransactionTrx= async (req, res) => {
  const { email, from, to, currency } = req.body;

  try {

      const tradeobj = await tronWeb.transactionBuilder.sendTrx(to, currency, from);
      const signedtxn = await tronWeb.trx.sign(tradeobj);
      const receipt = await tronWeb.trx.sendRawTransaction(signedtxn)
      //console.log(receipt);
      //const Transfer = await tronWeb.trx.sendSignedTransaction(SignedTransaction.rawTransaction)
      if (receipt.txid) {

          const transaction = new Transaction({
              _id: new mongoose.Types.ObjectId,
              email: email,
              from: req.body.from,
              to: req.body.to,
              currency: req.body.currency,
              hash: receipt.txid
          });

          await transaction.save()
              .then((data) => {
                  console.log(data, "inserted")
                  // return data
              })
          //  console.log(transaction)

          res.status(200).json({

              from,
              to,
              // value,
              // email,
              currency,
              hash: receipt.txid,
              message: 'complete transaction'
          })
      }
  }
  catch (error) {
      console.log(error);
      res.status(404).json({
          message: 'transaction not found!',

      })
  }
}