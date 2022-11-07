const jwt = require('jsonwebtoken');
const axios = require('axios')
const logger = require('../components/Logger')

const objectIdToTimestamp = (objectId) => {
  return parseInt(objectId.toString().substring(0,8), 16)*1000
}

const isObjectEmpty = (object) => {
  return Object.entries(object).length === 0
}

const isArray = (array) => {
  return Array.isArray(array);
}

const generatePassword = (len) => {
  var length = (len)?(len):(10);
  var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
  var numeric = '0123456789';
  var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
  var password = "";
  var character = "";
  var crunch = true;
  while( password.length<length ) {
      entity1 = Math.ceil(string.length * Math.random()*Math.random());
      entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
      entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
      hold = string.charAt( entity1 );
      hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
      character += hold;
      character += numeric.charAt( entity2 );
      character += punctuation.charAt( entity3 );
      password = character;
  }
  password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
  return password.substr(0,len);
}

const createToken = (user, request) => {
  return jwt.sign(
    {
      registerDate: objectIdToTimestamp(user._id),
      uuid: user.uuid,
      email: user.email,
      emailVerified: user.emailVerified,
      roles: user.roles,
      subscriptionActive: user.subscriptionActive,
      subscriptionExpiry: user.subscriptionExpiry,
      tisActive: user.tisActive,
      tisExpiry: user.tisExpiry,
      twoFactorStatus: user.twoFactorEnabled,
      metaMaskStatus: user.publicKey !== "" ? true : false,
      publicKey: user.publicKey,
      discord: user.discord,
      stripeCustomerId: user.stripeCustomerId,
      ipAddress: request.get('cf-connecting-ip'),
    },
      process.env.JWT_SECRET || '{?Fd]o#G&Wcqa)An<C@dlJT}&LG1VX',
    {
      expiresIn: '1d'
    }
  )
};

const successResponse = (response, message = null, data = null) => {
  response.status(200).send({
    success: true,
    timestamp: Date.now(),
    message,
    data
  })
}

const errorResponse = (response, message, status = 403) => {
  response.status(status).send({
    success: false,
    timestamp: Date.now(),
    message
  })
}

const appendFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, data, 'utf8', function (error) {
      if (error) return reject(error);
      return resolve(true);
    });
  });
};

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (error, data) {
      if (error) return reject(error);
      return resolve(data);
    });
  });
};

const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', (error) => {
      if(error) return reject(error);
      return resolve(true);
    })
  })
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve(true)
    }, ms)
  })
}

const average = (array) => array.reduce((a, b) => a + b) / array.length;

module.exports = {
  generatePassword,
  isArray,
  isObjectEmpty,
  createToken,
  successResponse,
  errorResponse,
  readFile,
  writeFile,
  average,
  sleep,
}
