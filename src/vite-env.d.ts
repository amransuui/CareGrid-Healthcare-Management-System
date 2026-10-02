/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the Spring Boot REST API. When unset, services resolve
   * from the local mock data layer.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}