const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html =  pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  return juice(html); // inline CSS
};

exports.send = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Alex <ketov.alex.v@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };

  return transport.sendMail(mailOptions);
};
