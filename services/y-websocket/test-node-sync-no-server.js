const Y = require('yjs')
const { WebsocketProvider } = require('y-websocket')

async function run() {
  try {
    const doc1 = new Y.Doc()
    const doc2 = new Y.Doc()

    const provider1 = new WebsocketProvider('ws://localhost:1234', 'test-room-node', doc1)
    const provider2 = new WebsocketProvider('ws://localhost:1234', 'test-room-node', doc2)

    const text1 = doc1.getText('board')
    const text2 = doc2.getText('board')

    await new Promise((resolve) => setTimeout(resolve, 100))

    const expected = 'node-sync-no-server-' + Math.random().toString(36).slice(2, 8)

    const done = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('sync timeout')), 5000)
      text2.observe(() => {
        try {
          const v = text2.toString()
          if (v === expected) {
            clearTimeout(timeout)
            resolve(true)
          }
        } catch (e) {
          // ignore
        }
      })
    })

    // make change on doc1
    doc1.transact(() => {
      text1.insert(0, expected)
    })

    await done

    console.log('YJS sync OK: content propagated to doc2')

    provider1.disconnect()
    provider2.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('YJS sync failed:', err)
    process.exit(2)
  }
}

run()
