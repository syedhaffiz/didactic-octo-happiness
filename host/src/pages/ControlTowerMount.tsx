// Wraps the federated remote. The lazy() boundary means the remote's bundle
// (its remoteEntry.js + chunks) is only fetched when the user navigates here.
// If the remote is unreachable (network error, dev server down), the
// ErrorBoundary catches it and shows a useful message instead of a blank
// page.

import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { Alert, Skeleton } from 'antd'

// Virtual module — declared in src/types/remotes.d.ts and resolved at
// runtime by the federation plugin from the host's `remotes` config.
const ControlTower = lazy(() => import('control_tower/App'))

interface BoundaryState {
  error: Error | null
}
class RemoteErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[remote:control_tower] failed to mount', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32 }}>
          <Alert
            type="error"
            showIcon
            message="Couldn't load the Control Tower module"
            description={
              <>
                <div>{this.state.error.message}</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Check that the remote is running:{' '}
                  <code>npm --prefix frontend run dev:remote</code>
                </div>
              </>
            }
          />
        </div>
      )
    }
    return this.props.children
  }
}

export const ControlTowerMount = () => (
  <RemoteErrorBoundary>
    <Suspense fallback={<Skeleton active style={{ padding: 32 }} paragraph={{ rows: 6 }} />}>
      {/* basename tells the remote's internal router that its `/` lives at
          `/control-tower` on the host's URL. So navigating to /finance/sales
          inside the remote becomes /control-tower/finance/sales in the bar. */}
      <ControlTower basename="/control-tower" />
    </Suspense>
  </RemoteErrorBoundary>
)
