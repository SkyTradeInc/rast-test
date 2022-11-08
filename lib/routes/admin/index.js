const express = require('express');
const router = express.Router();
const jwt  = require('jsonwebtoken');
const { v4: uuid_v4 } = require('uuidv4');

const User = require('../../models/User')
const KeyPairGenerator = require('../../components/KeyPairGenerator');
const keyPairGenerator = new KeyPairGenerator;

const {
  verifyToken,
  isAdmin
} = require('../../middleware')

const {
  successResponse,
  errorResponse
} = require('../../helpers')

//verifyToken, isAdmin,

router.get('/db',  (request, response) => {
  User.find({})
    .then(users => {
      return successResponse(response, 'Find users', users)
    })
})

router.delete('/db', (request, response) => {
  User.deleteMany({})
    .then(users => {
      return successResponse(response, 'Find users', users)
    })
})

router.get('/apikey', async (request, response) => {
  const uuid = uuid_v4.v4();
  const keys = await keyPairGenerator.generate()
  User.create({ uuid, apiKey: keys.apiKey, secret: keys.secretKey })
    .then(user => {
      return successResponse(response, 'API keys generated', {apiKey});
    })
    .catch(error => {
      console.log(error);
      return errorResponse(response, 'Something unexpected went wrong, please try again');
    })

})

router.post('/')




module.exports = router;
