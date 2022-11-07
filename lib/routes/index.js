const express = require('express')
const axios = require('axios')
const webSocket = require('ws')
const { uuid } = require('uuidv4');

const router = express.Router()

router.use('/admin', require('./admin'))
// router.use('/users', require('./users'))
router.use('/api', require('./api'))

const { successResponse, errorResponse } = require('../helpers')
const { methods } = require('../constants')
const logger = require('../components/Logger')

// HTTP Custom Provider
const User = require('../models/User')



const verifyApiKeyWeb3 = async (request, response, next) => {
  const { apiKey } = request.params
  if (!apiKey) return errorResponse(response, 'Invalid API key')
  const user = await User.findOne({apiKey})
  if(!user) return errorResponse(response, 'Invalid API key')
  return next()
}

router.post('/:apiKey', verifyApiKeyWeb3, (request, response) => {
  try {
    let { jsonrpc, method, params, id } = request.body
    console.log(method)
    if (!jsonrpc || !method || !params || !id) return errorResponse(response, 'Invalid RPC object')
    if (!methods[method]) return errorResponse(response, 'Invalid method or insufficient privileges')
    const call = {
      jsonrpc,
      method,
      params,
      id
    }
    axios.post(process.env.WEB3_HTTP, call)
      .then(reply => {
        return response.send(reply.data)
        // return successResponse(response, method, reply.data)
      })
      .catch(error => {
        console.log(error)
        return errorResponse(response, error.message || error)
      })
  } catch (error) {
    console.log(error)
    return errorResponse(response, error.message || error)
  }
})

router.post('/', (request, response) => {
  return errorResponse(response, 'API key not provided')
})

// WS Custom Provider

const io = require('../server')
let subscriptionMap = {}
let socketStats = {
  sent: 0,
  recieved: 0,
  keepAlive: Date.now()
}
let ws;

function socketHealth() {
  if(Date.now() - socketStats.keepAlive > 60000) {
    logger.info('Socket connection to Geth node is not responding')
    socketCloseListener()
  }
}

setInterval(()=>{
  if(!ws) return;
  ws.ping()
  socketStats.sent++
  socketHealth()
}, 10000)

setInterval(()=>{
  logger.info(`Socket Health: ${JSON.stringify(socketStats)}`)
},301000)


const socketCloseListener = (event) => {
  if (ws) {
    logger.info('Socket disconnected from Geth node')
  }
  ws = new webSocket(process.env.WEB3_WS);
  ws.addEventListener('open', socketOpenListener);
  ws.addEventListener('message', socketMessageListener);
  ws.addEventListener('close', socketCloseListener);
  ws.addEventListener('pong', socketPongListener);
};

const socketPongListener = (event) => {
  socketStats.recieved++
  socketStats.keepAlive = Date.now()
}

const socketMessageListener = (event) => {
  logger.info(event.data);
};

const socketOpenListener = (event) => {
  logger.info('Socket connected to Geth node')
};

socketCloseListener();

const errorResponseWS = (uuid, socket, message, close = true) => {
  if(subscriptionMap[uuid] && subscriptionMap[uuid].connected) {
    socket.send(message)
    socket.close()
    subscriptionMap[uuid].connected = false
    socket.removeAllListeners();
  }
}

const sendWS = (uuid, socket, message) => {
  if(subscriptionMap[uuid].connected) {
    socket.send(message)
  }
}

io.on('connection', (socket, request) => {
  let tempListener
  const uuid = uuid()
  const apiKey = request.url
  if (!apiKey) return errorResponseWS(uuid, socket, 'Invalid API key, not sent. Recieved ')
  if(apiKey.length < 65) return errorResponseWS(uuid, socket, 'Invalid API key, too short')
  if(apiKey.length > 65) return errorResponseWS(uuid, socket, 'Invalid API key, too long')
  User.findOne({apiKey: apiKey.split('/')[1]})
    .then(user => {
      if(!user) return errorResponseWS(uuid, socket, 'Invalid API key, no matching user')
    })
    .catch(error => {
      return errorResponseWS(uuid, socket, 'Unknown error')
    })


  subscriptionMap[uuid] = {
    connected: true,
    socket: socket,
    apiKey: apiKey,
    subscriptions: {}
  }
  logger.info(`[${uuid}] Client connected`)

  socket.on('message', (payload) => {
    const data = JSON.parse(payload)
    data.id = `${uuid}1`
    ws.send(JSON.stringify(data))
  })

  socket.on('close', () => {
    logger.info(`[${uuid}] Client disconnected`)
    subscriptionMap[uuid].connected = false
    Object.keys(subscriptionMap[uuid].subscriptions).map((subscriptionId) => {
      const data = {
        jsonrpc: "2.0",
        id: `${uuid}0`,
        method: "eth_unsubscribe",
        params: [subscriptionId]
      }
      ws.send(JSON.stringify(data))
      logger.info(`[${uuid}] Client destroyed a subscription`)
    })
    socket.removeAllListeners()
    tempListener.removeEventListener('message')

  })

  socket.on('error', (error) => {})

  tempListener = ws.on('message', (payload) => {
    const data = JSON.parse(payload)
    if(data.id && data.id === `${uuid}0`) { // Cancel subscription
      logger.info(`[${uuid}] Client destroyed a subscription`)
    } else if(data.id && data.id === `${uuid}1`) { // Create subscription
      subscriptionMap[uuid].subscriptions[data.result] = true
      data.id = 1
      sendWS(uuid, socket, JSON.stringify(data))
      logger.info(`[${uuid}] Client created a subscription`)
    } else if(data.method && data.method === "eth_subscription") {
      if(subscriptionMap[uuid].subscriptions[data.params.subscription]) {
        sendWS(uuid, socket, payload)
      }
    }
  })
})

module.exports = router
