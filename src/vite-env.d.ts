/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Hub page for Return to hub, e.g. `https://<domain>/hub`. Dev default `/hub/`. */
  readonly VITE_HUB_URL?: string;
  /** Nakama HTTP origin. Default `http://127.0.0.1:7350`. */
  readonly VITE_NAKAMA_URL?: string;
  /** Nakama client server key for builds. Dev uses `defaultkey`, like the hub. */
  readonly VITE_NAKAMA_SERVER_KEY?: string;
  /** WebRTC ICE servers for online duels, JSON array of RTCIceServer (add a TURN server for strict NATs). Default: one public STUN server. */
  readonly VITE_ICE_SERVERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
