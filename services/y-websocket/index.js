const http = require('http')
const WebSocket = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const port = process.env.PORT || 1234
const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('y-websocket server')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

server.listen(port, () => console.log(`y-websocket listening on ${port}`))
