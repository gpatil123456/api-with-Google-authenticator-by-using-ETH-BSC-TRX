const router = require('express').Router();
const authController = require('../controllers/authcation');
const Google_2FA_Controller = require('../controllers/2fagoogle');
const Transaction=require('../controllers/transaction');
router.post('/signup', authController.signUpUser);
router.post('/verify', authController.verifyEmail);
router.post('/login',authController.login);

router.post('/generateQRcode',Google_2FA_Controller.generateQRcode);
router.post ('/TOTPValid', Google_2FA_Controller.TOTPValid);


router.post('/getbalanceETH',authController.balance);
router.post('/TransactionETH',authController.transaction);


router.post('/getbalanceTRX',authController.getbalanceTrx);
router.post('/TransactionTRX',authController.TransactionTrx);



router.post('/getbalanceBSC',Transaction.getBalanceBSC);

router.post('/TransactionBSC',Transaction.TransactionBSC);



module.exports = router;