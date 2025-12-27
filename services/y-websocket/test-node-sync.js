const cp = require('child_process')
const path = require('path')

function waitForOutput(stream, matcher, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const s = chunk.toString()
      if (s.includes(matcher)) {
        cleanup()
        resolve(s)
      }
    }

    const onError = (err) => {
      cleanup()
      reject(err)
    }

    const timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error('timeout waiting for ' + matcher))
    }, timeout)

    function cleanup() {
      clearTimeout(timeoutId)
      proc.stdout.off('data', onData)
      proc.stderr.off('data', onData)
    }

    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
  })
}

const proc = cp.spawn('node', ['index.js'], { cwd: __dirname, env: process.env })
proc.stdout.on('data', (c) => process.stdout.write('[srv] ' + c.toString()))
proc.stderr.on('data', (c) => process.stderr.write('[srv-err] ' + c.toString()))

async function run() {
  try {
    await waitForOutput(proc.stdout, 'y-websocket listening')

    const Y = require('yjs')
    const { WebsocketProvider } = require('y-websocket')

    const doc1 = new Y.Doc()
    const doc2 = new Y.Doc()

    const provider1 = new WebsocketProvider('ws://localhost:1234', 'test-room-node', doc1)
    const provider2 = new WebsocketProvider('ws://localhost:1234', 'test-room-node', doc2)

    const text1 = doc1.getText('board')
    const text2 = doc2.getText('board')

    await new Promise((resolve) => setTimeout(resolve, 200))

    const expected = 'node-sync-' + Math.random().toString(36).slice(2, 8)

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
    proc.kill()
    process.exit(0)
  } catch (err) {
    console.error('YJS sync failed:', err)
    proc.kill()
    process.exit(2)
  }
}

run()
