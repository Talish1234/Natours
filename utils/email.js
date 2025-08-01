const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltotext = require('html-to-text');

module.exports = class Email{

  constructor(user,url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAILFROM;
  }

  newTransport(){
    return nodemailer.createTransport({
      service: 'gmail',
  auth: {
    user: process.env.EMAILUSERNAME,
    pass:process.env.EMAILPASSWORD
  }
})
  }

  async send(template,subject){
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
      firstName:this.firstName,
      url:this.url,
      subject
    });
    const mailOptions = {
      from:this.from,
      to: this.to,
      subject,
      html,
      text: this.url
  }
  await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(){
      await this.send('welcome','Welcome to the Natours family!');
  }

  async sendPasswordReset(){
    await this.send('passwordReset','Welcome to the Natours family!')
  }
};
