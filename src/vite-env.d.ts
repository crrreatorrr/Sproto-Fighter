/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Hub page for Return to hub, e.g. `https://<domain>/hub`. Dev default `/hub/`. */
  readonly VITE_HUB_URL?: string;
  /** Nakama HTTP origin. Default `http://127.0.0.1:7350`. */
  readonly VITE_NAKAMA_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
