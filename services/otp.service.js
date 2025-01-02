const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "Lamintan";
const emailServices = require("../services/emailer.service");

async function sendOTP(params, callback){
    const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        }
    );

    const ttl = 5 * 60 * 1000;
    const  expires = Date.now() + ttl;
    const data = `${params.email}.${otp}.${expires}`;
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
    const fullHash = `${hash}.${expires}`;

    var otpMessage = ``;

    var model = {
        email: params.email,
        subject: "Registration OTP",
        body: otpMessage,
        html: 
        `<html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            @import url('https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700,800,900&display=swap');
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', sans-serif;
            }
            body {
                margin: 0;
                padding: 0;
                width: 100% !important;
                height: 100%;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            
            }
            table {
                border-spacing: 0;
                border-collapse: collapse;
                table-layout: fixed;
                Margin: 0 auto;
                width: 100%;
            }
            img {
                border: 0;
                line-height: 100%;
                text-decoration: none;
                -ms-interpolation-mode: bicubic;
                max-width: 100%;
            }
            .container {
                max-width: 580px;
                width: 100%;
                margin: 0 auto;
                padding: 10px;
            
            }
            .content {
                background-color: #ffffff;
                border-radius: 3px;
                padding: 20px;
                margin: 10px;
            }
            .logo {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: start;
                text-align: center;
                margin-bottom: 20px;
            }
            .img-logo {
                width: 50px;
                height: 50px;
                margin-right: 10px;
            }
            .head {
                font-weight: 100;
                font-size: 35px;
                margin: 0;
            }
            a {
                color: blue;
                text-decoration: none;
            }
            .icon {
                background-color: rgba(68, 68, 68, 0.103);
                border-radius: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                margin-right: 5px;
            }
            .icon-image {
                width: 12px;
                height: 12px;
            }
            .otp-container {
                background-color: rgba(0, 255, 255, 0.3);
                border-radius: 5px;
                margin: 15px 0;
                padding: 10px;
            }
            .otp-code {
                font-size: 25px;
                text-align: center;
                font-weight: 600;
                color: rgba(0, 120, 120);
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #999999;
                margin-top: 10px;
            }
            .footer p {
                margin: 0;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    padding: 5px;
                }
                .head {
                    font-size: 28px;
                }
                .otp-code {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body style="background-color: #f6f6f6">
        <div class="container">
            <div class="content">
                <div class="logo">
                    <img src="https://studio5ive.org/images/5logo_black.png" alt="Studio5ive Logo" class="img-logo">
                    <h2 class="head">STUDIO5IVE</h2>
                </div>
                <p>Dear Customer,</p>
                <br>
                <p>Thank you for choosing Studio5ive Company. To complete your request to [create your account/change your password], please use the OTP provided below. The OTP is valid for <strong>5 minutes.</strong> Please do not share this code with anyone, including Studio5ive employees.</p>
                <div class="otp-container">
                    <p class="otp-code">${otp}</p>
                </div>
                <p>If you did not initiate this request or have any concerns, please contact our support team immediately. Thank you for your prompt attention to this matter.</p>
                <p>If you require any further assistance, feel free to reply to this email or contact our support team at <a href="https://studio5ive.org/">www.studio5ive.org</a>.</p>
                <br>
                <p>Thanks,</p>
                <p>Studio5ive© Platform Team</p>
            </div>
            <div class="footer">
                <p>Studio5ive© Platform<br>powered by Studio5ive-CEP</p>
                <p>© 2024 STUDIO5IVE | All Rights Reserved | <a href="https://studio5ive.org/privacy.html">Privacy Policy</a></p>
            </div>
        </div>
    </body>
    </html>
    `,
    };

    emailServices.sendEmail(model, (error, result) => {
        if(error){
            return callback(error);
        } 
        return callback(null, fullHash);
    });
}

async function verifyOTP(params, callback){
    let [hashValue, expires] = params.hash.split('.');

    let now = Date.now();

    if(now > parseInt(expires)) return callback("OTP Expired");

    let data = `${params.email}.${params.otp}.${expires}`;
    let newCalculateHash = crypto.createHmac("sha256", key).update(data).digest("hex");
    if(newCalculateHash === hashValue) {
        return callback(null, "Success");
    }

    return callback("Invalid OTP");
}

module.exports = {
    sendOTP,
    verifyOTP
}