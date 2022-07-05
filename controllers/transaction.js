const Transaction = require('../models/Transaction');

const mongoose = require('mongoose');
const Web3 =require('web3');
const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");
const Private_Key = "e8f08c1da089e4d26e475dcbf420cf907ab500f4da58f2742e3c8693ab65b8d6";





exports.getBalanceBSC = async (req, res) => {
    
    const {address} = req.body;
    try {
        var sender = address
        var value = web3.utils.fromWei(
            await web3.eth.getBalance(sender),
            'ether'
        )
        console.log(value);
        res.status(200).json({value})
    } catch (error) {
        console.error(error);
        res.status(404).json({
            message : 'Account not found!',
            address
        })
    }
}



exports.TransactionBSC= async (req, res) => {
    const { email,from, to } = req.body;

    try {
  
      //  var value = web3.utils.toWei('0.01', 'ether')
      var currency = web3.utils.toWei('0.01', 'ether')
      var SignedTransaction = await web3.eth.accounts.signTransaction({
            from: from,
            to: to,
            //value: value,
            currency:currency,
            gas: 2000000
        }, Private_Key);

        const Transfer = await web3.eth.sendSignedTransaction(SignedTransaction.rawTransaction)
        if(Transfer.transactionHash){

        const transaction = new Transaction({
          email:email,
            from: from,
            to: to,
            //value: value,
            currency:currency,
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
           // value,
          // email,
           currency,
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
    
