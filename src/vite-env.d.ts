/// <reference types="vite/client" />

/* Vue SFC shim (boilerplate): the empty-object and `any` types are inherent. */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
