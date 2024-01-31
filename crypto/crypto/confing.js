
const crypto = require('node:crypto')
const bcrypt = require('bcrypt')


const secret = crypto.randomBytes(64).toString('hex');
const hashedSecret = bcrypt.hashSync(secret, 10);// cuando se hace de forma syncrona el programa para de forma asincrona no para.

module.exports =  hashedSecret
