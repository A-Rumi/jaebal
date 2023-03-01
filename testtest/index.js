const express = require('express')
const app = express()
const server = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const port = process.env.PORT || 3000
const { createClient } = require('redis')
const { createAdapter } = require('@socket.io/redis-adapter')

const pubClient = createClient({ url: 'redis://localhost:6379' })
const subClient = pubClient.duplicate()

const pubClient2 = createClient({ url: 'redis://localhost:6380' })
const subClient2 = pubClient.duplicate()

const adapter1 = createAdapter(pubClient, subClient)
const adapter2 = createAdapter(pubClient2, subClient2)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

server.listen(port, () => console.log(`app listening on port ${port}!!`))

// 미들웨어 방법
// io.use((socket, next) => {
//   console.log('client connectid:', socket.id)
//   next()
// })

const processAdapter1 = (socket) => {
  socket.emit('test', 'hello i am adapter1')
}

const processAdapter2 = (socket) => {
  socket.emit('test', 'hello i am adapter2')
}

io.on('connection', (socket) => {
  const storeCode = socket.handshake.query.storeCode

  if (storeCode) {
    console.log('storeCode:', storeCode)
    io.adapter(adapter1).emit('adapter1', processAdapter1)
    console.log('success')
  } else {
    io.adapter(adapter2).emit('adapter2', processAdapter2)
    console.log('success')
  }

  // adapter1.on('test', (socketId) => {
  //   console.log('socketId', socketId)
  // })

  // socket.on('chat', (msg, test) => {
  //   console.log('Message:', msg)
  //   console.log('middleware text:', test)
  // })

  // socket.on('disconnect', () => {
  //   console.log('A client disconnected with id:', socket.id)
  // })
})

// 리스너 방법
// const createTorder = () => {

// }

// const onConnection = (socket) => {
//   socket.on('torder', createTorder)
// }

// io.on('connection', onConnection)
