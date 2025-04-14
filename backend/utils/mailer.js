const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

if (process.env.NODE_ENV === "development") {
  transporter = {
    sendMail: async (options) => {
      console.log("📨 Email (DEBUG MODE):", options.to);
      console.log("Subject:", options.subject);
      console.log("HTML:", options.html);
    }
  };
} else if (process.env.MAIL_PROVIDER === "sendgrid") {
  transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
} else if (process.env.MAIL_PROVIDER === "ses") {
  transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: process.env.AWS_REGION
    })
  });
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

module.exports = transporter;
