const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

const isDev = process.env.NODE_ENV === "development";

// Always create the Gmail transporter
transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});

// Attach logger for development mode
if (isDev) {
  const originalSendMail = transporter.sendMail.bind(transporter);
  transporter.sendMail = async (options) => {
    console.log("📨 Sending email in DEVELOPMENT mode:");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Body Preview:", options.html?.slice(0, 200));
    return originalSendMail(options); // Actually send the email
  };
}

// Optional override for production providers
if (!isDev && process.env.MAIL_PROVIDER === "sendgrid") {
  transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
} else if (!isDev && process.env.MAIL_PROVIDER === "ses") {
  const AWS = require("aws-sdk");
  transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: process.env.AWS_REGION
    })
  });
}

module.exports = transporter;
