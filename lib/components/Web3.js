const web3  = require('web3')
const net   = require('net')

const logger = require('./Logger')
const io = require('../server')


class Web3 {
  constructor() {
    this.http         = new web3(new web3.providers.HttpProvider(process.env.WEB3_HTTP));
    this.ws           = new web3(new web3.providers.WebsocketProvider(process.env.WEB3_WS));
    this.ipc          = new web3(new web3.providers.IpcProvider(process.env.WEB3_IPC, net));

    this.ipc.eth.extend({
        property: 'txpool',
        methods: [{
          name: 'content',
          call: 'txpool_content'
        },{
          name: 'inspect',
          call: 'txpool_inspect'
        },{
          name: 'status',
          call: 'txpool_status'
        }]
      })
    }

}

module.exports = new Web3;
