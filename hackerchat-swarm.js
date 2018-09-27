#!/usr/bin/env node
const network = require('@hyperswarm/network')
const crypto = require('crypto')
const promiseify = require('util').promisify

const net = network()

const channel = crypto.createHash('sha256')
  .update('hacker-chat')
  .digest()

const detectHolePunchAsync = promiseify(cb => net.discovery.holepunchable(cb))

async function detectHolePunch() {
  try {
    const yes = await detectHolePunchAsync()
    if (yes) {
      console.log('✅  Your network is hole-punchable!')
      return
    }
    console.log('☠️  Your network is not hole-punchable. This will degrade connectivity.')
  } catch (err) {
    console.error('🚨  Error while testing for holepunch capability', err)
  }
}

class SessionManager {
  constructor() {
    this.sessions = new Set()
    this.count = 0
  }

  add(socket, info) {
    const id = this.count ++
    console.log('🎉', `new friend ${id}!`)
    this.sessions.add(socket)

    const close = () => {
      if (!this.sessions.has(socket)) {
        return
      }
      this.sessions.delete(socket)
      console.log('💥', `goodbye ${id}`)
      socket.removeAllListeners()
    }

    socket.on('close', close)
    socket.on('error', close)
    socket.on('data', data => {
      const message = data.toString('ascii').replace(/[^\x20-\x7E]/g, "")
      if (!message) {
        console.log(`☹️  ${id}: tried to send us non ascii data, jerks`)
        return
      }
      console.log(`😀 ${id}:`, message)
    })
  }

  write(data) {
    if (this.sessions.size === 0) {
      console.log('Nobody is here, I still love you though')
    }
    for (const connection of this.sessions) {
      connection.write(data)
    }
  }
}

async function run() {
  await detectHolePunch()
  net.join(channel, {
    lookup: true, // find & connect to peers
    announce: true // optional- announce self as a connection target
  })

  const sessions = new SessionManager()
  net.on('connection', (socket, info) => {
    sessions.add(socket, info)
  })

  process.stdin.on('data', function (message) {
    process.stdout.write('> ')
    const text = message.toString('ascii').trim()
    if (!text) {
      return
    }
    sessions.write(text)
  })

  process.on('SIGUSR1', () => {
    console.log('sending custom text')
    sessions.write(Buffer.from([7]))
  })
}

process.once('SIGINT', function () {
  console.log('Shutting down ...')
  net.discovery.destroy()
  net.discovery.on('close', function () {
    process.exit()
  })
})

run().catch(
  err => {
    console.error(err)
    process.exit(1)
  }
)
