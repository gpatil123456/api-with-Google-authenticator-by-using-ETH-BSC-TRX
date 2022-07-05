const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../constants/constants');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);
const otpGenerator = require('otp-generator');

const saltRounds = 10;
module.exports.encrypt = async (data) => {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(data, salt);
      return hash;
    } catch (error) {
      return false;
    }
  };
  
  module.exports.compare = async (data, hash) => {
    const value = await bcrypt.compare(data, hash);
    return value;
  };



  module.exports.signToken = (params) => {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60,
        data: params,
      },
      JWT_SECRET
    );
  };
  
 
 
  module.exports.verifyToken = (token) => {
    try {
      const data = jwt.verify(token, JWT_SECRET);
      return [true, 'Login Success', data];
    } catch (error) {
      let err;
      switch (error.name) {
        case 'TokenExpiredError':
          err = 'Token Expired';
          break;
        default:
          err = error.name;
      }
      return [false, err];
    }
  };







module.exports.sendMail = async (email, OTP) => {
 

  try {
    

    let mailOptions = {
      from: MAIL_SETTINGS.auth.user,
      to: email,
      subject: 'Hello',
      html: `
      <div class="container"
      style="max-width: 90%; margin: auto; padding-top: 20px" 
      >
          <h2>Welcome to the club.</h2>
          <h4>You are officially In ✔</h4>
          <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
          <h1 style="font-size: 40px; letter-spacing: 2px;text-align:center;">${OTP}</h1>
      </div>`,
    };

    let info = await transporter.sendMail(mailOptions)
          .then(() => {
         console.log('Message sent')
        })
      
    return info;
    
       } catch (error) {
    console.log(error);
    return false;
  }
}



const { OTP_LENGTH, OTP_CONFIG } = require('../constants/constants');
module.exports.generateOTP = () => {
  const OTP = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
  return OTP;
};