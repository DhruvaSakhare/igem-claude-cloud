/// <reference types="vite/client" />

declare module "*.svg" {
  const url: string;
  export default url;
}

interface ImportMetaEnv {
  readonly VITE_TEAM_ID: string;
  readonly VITE_TEAM_NAME: string;
  readonly VITE_TEAM_YEAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
