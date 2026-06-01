import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MsalProvider, MsalAuthenticationTemplate } from '@azure/msal-react'
import { InteractionType } from '@azure/msal-browser'
import { Skeleton } from 'antd'
import { loginRequest, pca } from './auth/msalConfig'
import { HostShell } from './components/HostShell'
import { Home } from './pages/Home'
import { ControlTowerMount } from './pages/ControlTowerMount'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HostShell />,
    children: [
      { index: true, element: <Home /> },
      // Catch-all under /control-tower so the remote's nested router (with
      // basename="/control-tower") handles every path beneath it.
      { path: 'control-tower/*', element: <ControlTowerMount /> },
    ],
  },
])

export const App = () => (
  <MsalProvider instance={pca}>
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
      loadingComponent={() => <Skeleton active style={{ padding: 32 }} />}
    >
      <RouterProvider router={router} />
    </MsalAuthenticationTemplate>
  </MsalProvider>
)
