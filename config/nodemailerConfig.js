require('dotenv').config()
const nodemailer=require('nodemailer')
const config=require('./emailConfig')

const user=config.user
const pass=config.pass


async function sendMail({  email,name, varificationCode }) {
    let transporter = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
            user: user,
            pass: pass
        }
    })

    let info = await transporter.sendMail({
        from: user,
        to: email,
        subject:'Please verify your email',
        html:`<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:1000/api/auth/verify/${varificationCode}> Click here</a>
        </div>`,
    })
}

module.exports = sendMail
