const WebSocket = require('ws')
const http = require('http')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection
const LeveldbPersistence = require('y-leveldb').LeveldbPersistence

// Persistence setup
const persistenceDir = process.env.YPERSISTENCE || './y-leveldb'
const ldb = new LeveldbPersistence(persistenceDir)

// Set persistence on the utils module
const utils = require('y-websocket/bin/utils')
utils.setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await ldb.getYDoc(docName)
    const newUpdates = Y.encodeStateAsUpdate(ydoc)
    ldb.storeUpdate(docName, newUpdates)
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
    ydoc.on('update', update => {
      ldb.storeUpdate(docName, update)
    })
  },
  writeState: async (docName, ydoc) => {
    await ldb.storeUpdate(docName, Y.encodeStateAsUpdate(ydoc))
  }
})

const port = process.env.PORT || 1234
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  // const handleAuth = ws => { wss.emit('connection', ws, request) }
  // authenticate(request, handleAuth)
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request)
  })
})

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

server.listen(port, () => {
  console.log('running at on port ' + port)
  console.log('Persistence directory:', persistenceDir)
})
