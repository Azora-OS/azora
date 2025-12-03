/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Global type definitions for Azora OS
 * Advanced type system for enhanced developer experience
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Core Environment
      NODE_ENV: 'development' | 'production' | 'test'
      PORT?: string
      HOST?: string
      
      // Database
      DATABASE_URL: string
      POSTGRES_URL: string
      POSTGRES_PRISMA_URL: string
      POSTGRES_NON_POOLING_URL: string
      POSTGRES_USER: string
      POSTGRES_PASSWORD: string
      POSTGRES_HOST: string
      POSTGRES_PORT: string
      POSTGRES_DB: string
      
      // Redis
      REDIS_URL: string
      REDIS_HOST: string
      REDIS_PORT: string
      REDIS_PASSWORD?: string
      
      // AI Services
      OPENAI_API_KEY: string
      ANTHROPIC_API_KEY?: string
      GOOGLE_AI_API_KEY?: string
      COHERE_API_KEY?: string
      
      // Blockchain
      ALCHEMY_API_KEY: string
      ETHERSCAN_API_KEY: string
      PRIVATE_KEY: string
      WALLET_ADDRESS: string
      
      // External APIs
      LUNO_API_KEY: string
      LUNO_SECRET: string
      ASSEMBLYAI_API_KEY: string
      SUPABASE_URL: string
      SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      
      // Security
      JWT_SECRET: string
      ENCRYPTION_KEY: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      
      // Monitoring
      DATADOG_API_KEY?: string
      SENTRY_DSN?: string
      UXCAM_API_KEY?: string
      
      // Feature Flags
      ENABLE_AI_FEATURES: string
      ENABLE_BLOCKCHAIN: string
      ENABLE_MINING: string
      ENABLE_EDUCATION: string
      ENABLE_FINANCIAL: string
    }
  }

  // Window extensions for browser APIs
  interface Window {
    // Azora OS specific
    azora?: {
      version: string
      elara: {
        status: 'active' | 'inactive' | 'error'
        consciousness: number
        dimensions: number
      }
      services: Record<string, {
        status: 'healthy' | 'degraded' | 'critical' | 'offline'
        uptime: number
        lastCheck: string
      }>
    }
    
    // Service Worker
    serviceWorker?: ServiceWorkerRegistration
    
    // WebAssembly
    WebAssembly?: typeof WebAssembly
    
    // Advanced APIs
    requestIdleCallback?: (callback: IdleDeadline) => number
    cancelIdleCallback?: (id: number) => void
    requestAnimationFrame?: (callback: FrameRequestCallback) => number
    cancelAnimationFrame?: (id: number) => void
    
    // PWA APIs
    beforeinstallprompt?: Event
    onappinstalled?: (event: Event) => void
    
    // WebRTC
    RTCPeerConnection?: typeof RTCPeerConnection
    RTCDataChannel?: typeof RTCDataChannel
    
    // Web Audio
    AudioContext?: typeof AudioContext
    OfflineAudioContext?: typeof OfflineAudioContext
    
    // WebGL
    WebGLRenderingContext?: typeof WebGLRenderingContext
    WebGL2RenderingContext?: typeof WebGL2RenderingContext
    
    // WebXR
    XRSession?: typeof XRSession
    XRSystem?: typeof XRSystem
  }

  // Service Worker types
  interface ServiceWorkerGlobalScope {
    skipWaiting(): Promise<void>
    clients: Clients
  }

  interface Clients {
    claim(): Promise<void>
    get(id: string): Promise<Client | undefined>
    matchAll(options?: ClientQueryOptions): Promise<Client[]>
    openWindow(url: string): Promise<WindowClient | null>
  }

  interface Client {
    id: string
    type: 'window' | 'worker' | 'sharedworker'
    url: string
    postMessage(message: any, transfer?: Transferable[]): void
  }

  interface WindowClient extends Client {
    focused: boolean
    visibilityState: 'visible' | 'hidden'
    focus(): Promise<WindowClient>
    navigate(url: string): Promise<WindowClient>
  }

  interface ClientQueryOptions {
    includeUncontrolled?: boolean
    type?: 'window' | 'worker' | 'sharedworker'
  }

  // WebAssembly types
  interface WebAssembly {
    compile(bytes: BufferSource): Promise<WebAssembly.Module>
    instantiate(bytes: BufferSource, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>
    validate(bytes: BufferSource): boolean
    Module: typeof WebAssembly.Module
    Instance: typeof WebAssembly.Instance
    Memory: typeof WebAssembly.Memory
    Table: typeof WebAssembly.Table
    CompileError: typeof WebAssembly.CompileError
    LinkError: typeof WebAssembly.LinkError
    RuntimeError: typeof WebAssembly.RuntimeError
  }

  namespace WebAssembly {
    interface Module {}
    interface Instance {
      exports: Exports
    }
    interface Memory {
      buffer: ArrayBuffer
      grow(delta: number): number
    }
    interface Table {
      length: number
      grow(delta: number, value?: any): number
      get(index: number): any
      set(index: number, value?: any): void
    }
    interface Exports {
      [name: string]: any
    }
    interface Imports {
      [moduleName: string]: Exports
    }
    interface WebAssemblyInstantiatedSource {
      module: Module
      instance: Instance
    }
    class CompileError extends Error {}
    class LinkError extends Error {}
    class RuntimeError extends Error {}
  }

  // WebRTC types
  interface RTCPeerConnection extends EventTarget {
    addIceCandidate(candidate: RTCIceCandidateInit | RTCIceCandidate): Promise<void>
    addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender
    addTransceiver(trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver
    close(): void
    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit): RTCDataChannel
    createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>
    createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>
    getConfiguration(): RTCConfiguration
    getReceivers(): RTCRtpReceiver[]
    getSenders(): RTCRtpSender[]
    getStats(selector?: MediaStreamTrack): Promise<RTCStatsReport>
    getTransceivers(): RTCRtpTransceiver[]
    removeTrack(sender: RTCRtpSender): void
    setConfiguration(configuration: RTCConfiguration): void
    setLocalDescription(description?: RTCSessionDescriptionInit): Promise<void>
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>
    connectionState: RTCPeerConnectionState
    iceConnectionState: RTCIceConnectionState
    iceGatheringState: RTCIceGatheringState
    localDescription: RTCSessionDescription | null
    remoteDescription: RTCSessionDescription | null
    signalingState: RTCSignalingState
    onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null
    ondatachannel: ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any) | null
    onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null
    oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null
    onicegatheringstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null
    onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null
    onsignalingstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null
    ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null
  }

  interface RTCDataChannel extends EventTarget {
    binaryType: 'arraybuffer' | 'blob'
    bufferedAmount: number
    bufferedAmountLowThreshold: number
    id: number | null
    label: string
    maxPacketLifeTime: number | null
    maxRetransmits: number | null
    ordered: boolean
    protocol: string
    readyState: RTCDataChannelState
    reliable: boolean
    close(): void
    send(data: string | Blob | ArrayBuffer | ArrayBufferView): void
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null
    onclose: ((this: RTCDataChannel, ev: Event) => any) | null
    onerror: ((this: RTCDataChannel, ev: RTCErrorEvent) => any) | null
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null
    onopen: ((this: RTCDataChannel, ev: Event) => any) | null
  }

  // Web Audio types
  interface AudioContext extends BaseAudioContext {
    close(): Promise<void>
    createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode
    createMediaStreamDestination(): MediaStreamAudioDestinationNode
    createMediaStreamSource(stream: MediaStream): MediaStreamAudioSourceNode
    getOutputTimestamp(): AudioTimestamp
    resume(): Promise<void>
    suspend(): Promise<void>
    baseLatency: number
    outputLatency: number
    state: AudioContextState
    onstatechange: ((this: AudioContext, ev: Event) => any) | null
  }

  interface OfflineAudioContext extends BaseAudioContext {
    startRendering(): Promise<AudioBuffer>
    resume(): Promise<void>
    suspend(suspendTime: number): Promise<void>
    length: number
    oncomplete: ((this: OfflineAudioContext, ev: OfflineAudioCompletionEvent) => any) | null
  }

  // WebGL types
  interface WebGLRenderingContext extends WebGLRenderingContextBase {
    // WebGL 1.0 methods and properties
  }

  interface WebGL2RenderingContext extends WebGL2RenderingContextBase {
    // WebGL 2.0 methods and properties
  }

  // WebXR types
  interface XRSession extends EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
    dispatchEvent(event: Event): boolean
    end(): Promise<void>
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>
    updateRenderState(state?: XRRenderStateInit): void
    requestAnimationFrame(callback: XRFrameRequestCallback): number
    cancelAnimationFrame(handle: number): void
    inputSources: XRInputSource[]
    environmentBlendMode: XREnvironmentBlendMode
    interactionMode: XRInteractionMode
    supportedFrameRates: Float32Array
    updateTargetFrameRate(rate: number): Promise<void>
    onend: ((this: XRSession, ev: Event) => any) | null
    oninputsourceschange: ((this: XRSession, ev: XRInputSourcesChangeEvent) => any) | null
    onselect: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onselectstart: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onselectend: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onsqueeze: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onsqueezestart: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onsqueezeend: ((this: XRSession, ev: XRInputSourceEvent) => any) | null
    onvisibilitychange: ((this: XRSession, ev: XRVisibilityChangeEvent) => any) | null
    onframeratechange: ((this: XRSession, ev: XRFrameRateChangeEvent) => any) | null
  }

  interface XRSystem extends EventTarget {
    isSessionSupported(mode: XRSessionMode): Promise<boolean>
    requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>
    ondevicechange: ((this: XRSystem, ev: Event) => any) | null
  }
}

// Export empty object to make this a module
export {}
