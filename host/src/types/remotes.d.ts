// Type declarations for federated remote modules. The actual runtime values
// come from `remoteEntry.js`; this file just teaches TypeScript what shape to
// expect when the host imports them.

declare module 'control_tower/App' {
  import type { ComponentType } from 'react'
  const App: ComponentType<{ basename?: string }>
  export default App
}
