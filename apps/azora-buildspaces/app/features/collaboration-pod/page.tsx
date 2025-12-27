"use client"

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import Link from 'next/link'
import { Users, MessageSquare, Video } from 'lucide-react'

export default function CollaborationPodPage() {
  const [openWhiteboard, setOpenWhiteboard] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [whiteboardText, setWhiteboardText] = useState('')
  const [docInfo, setDocInfo] = useState({connected:false, peers:0})
  const [peersList, setPeersList] = useState<Array<{id:number, name:string, color?:string}>>([])

  // YJS provider lifecycle
  const docRef = useRef<any>(null)
  const providerRef = useRef<any>(null)
  const textRef = useRef<any>(null)
  const textObserverRef = useRef<any>(null)
  const awarenessHandlerRef = useRef<any>(null)
  const writeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    async function start() {
      if (!openWhiteboard) return
      // dynamic imports to avoid importing on server
      const Y = await import('yjs')
      const { WebsocketProvider } = await import('y-websocket')
      const doc = new Y.Doc()
      const provider = new WebsocketProvider('ws://localhost:1234', 'collaboration-pod-room', doc)
      const text = doc.getText('board')

      docRef.current = doc
      providerRef.current = provider
      textRef.current = text

      setWhiteboardText(text.toString())

      const textObserver = () => {
        setWhiteboardText(text.toString())
      }

      textObserverRef.current = textObserver
      text.observe(textObserverRef.current)

      // update peers when awareness changes
      const setLocalPresence = () => {
        try {
          const name = (typeof window !== 'undefined' && (window as any).AZORA_USER_NAME) || 'You'
          const color = '#22c55e' // emerald
          provider.awareness?.setLocalStateField('user', { name, color })
        } catch (err) {
          // ignore
        }
      }

      const awarenessHandler = () => {
        const states = provider.awareness ? provider.awareness.getStates() : new Map()
        const peers: Array<{id:number,name:string,color?:string}> = []
        states.forEach((state: any, clientId: number) => {
          const user = state.user || {}
          peers.push({ id: clientId, name: user.name || 'Anon', color: user.color })
        })
        setPeersList(peers.filter((p) => p.id !== provider.awareness.clientID))
        setDocInfo({ connected: provider.shouldConnect, peers: peers.length })
      }

      awarenessHandlerRef.current = awarenessHandler
      provider.awareness?.on('update', awarenessHandlerRef.current)

      provider.on('status', (e: any) => {
        setDocInfo((s) => ({ ...s, connected: e.status === 'connected' }))
      })

      // set local presence and initial peers
      setLocalPresence()
      awarenessHandlerRef.current()
    }

    start()

    return () => {
      try {
        const provider = providerRef.current
        const doc = docRef.current
        const text = textRef.current
        const textObserver = textObserverRef.current
        const awarenessHandler = awarenessHandlerRef.current
        if (text && textObserver) text.unobserve(textObserver)
        if (provider?.awareness && awarenessHandler) provider.awareness.off('update', awarenessHandler)
        if (writeTimeoutRef.current) {
          clearTimeout(writeTimeoutRef.current)
          writeTimeoutRef.current = null
        }
        provider?.disconnect()
        doc?.destroy()
        docRef.current = null
        providerRef.current = null
        textRef.current = null
        textObserverRef.current = null
        awarenessHandlerRef.current = null
      } catch (e) {
        // ignore
      }
    }
  }, [openWhiteboard])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Collaboration Pod</h1>
              <p className="text-gray-400">Real-time teamwork: chat, whiteboard, and lightweight video rooms.</p>
            </div>
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">← Back to features</Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">Participants</h3>
              </div>
              <p className="text-sm text-gray-400">Invite teammates to collaborate in a shared workspace.</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {peersList.slice(0, 5).map((p) => (
                    <div key={p.id} className="w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-white/10" title={p.name} style={{ background: p.color || '#555' }}>
                      <span className="text-xs font-semibold text-white">{p.name.split(' ').map(s => s[0]).join('').slice(0,2)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-300">{docInfo.peers} online</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <p className="text-sm text-gray-400">Chat with others and attach whiteboard frames.</p>
              <div className="mt-4">
                <button onClick={() => setChatOpen((s) => !s)} className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded">
                  {chatOpen ? 'Close Chat' : 'Open Chat'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Video className="w-5 h-5 text-pink-400" />
                <h3 className="font-semibold">Quick Call</h3>
              </div>
              <p className="text-sm text-gray-400">Start a lightweight peer-to-peer call (browser-based).</p>
              <div className="mt-4">
                <button className="px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 rounded">Start Call</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Whiteboard</h3>
                <button onClick={() => setOpenWhiteboard((s) => !s)} className="text-xs text-emerald-300">
                  {openWhiteboard ? 'Close' : 'Open'}
                </button>
              </div>
              <div className="h-72 bg-black/20 rounded p-3">
                {openWhiteboard ? (
                  <div className="h-full flex flex-col">
                    <div className="text-xs text-gray-400 mb-2">{docInfo.connected ? 'Connected' : 'Disconnected'} • Peers: {docInfo.peers}</div>
                    <textarea
                      value={whiteboardText}
                      onChange={(e) => {
                        const val = e.target.value
                        setWhiteboardText(val)
                        // write into shared Y.Text if available with debounce
                        const text = textRef.current
                        const doc = docRef.current
                        if (text && doc) {
                          try {
                            if (writeTimeoutRef.current) {
                              clearTimeout(writeTimeoutRef.current)
                            }
                            // debounce writes to reduce churn
                            writeTimeoutRef.current = window.setTimeout(() => {
                              try {
                                doc.transact(() => {
                                  const oldLen = (typeof text.length === 'number') ? text.length : text.toString().length
                                  if (oldLen > 0) text.delete(0, oldLen)
                                  if (val.length > 0) text.insert(0, val)
                                })
                              } catch (err) {
                                // ignore sync errors
                              }
                              writeTimeoutRef.current = null
                            }, 250)
                          } catch (err) {
                            // ignore sync errors
                          }
                        }
                      }}
                      className="w-full h-full resize-none bg-black/10 rounded p-2 text-sm text-white"
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">Whiteboard is closed</div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Session Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="text-emerald-300 hover:underline">Copy invite link</Link>
                </li>
                <li>
                  <Link href="#" className="text-emerald-300 hover:underline">Open shared notes</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
