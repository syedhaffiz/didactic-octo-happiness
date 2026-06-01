import { Card, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography

export const Home = () => (
  <div style={{ padding: 32, maxWidth: 880 }}>
    <Title level={2} style={{ marginTop: 0 }}>
      Host application
    </Title>
    <Paragraph>
      This shell owns: routing, sign-in (Azure AD / MSAL), and chrome (header + sidebar).
      Other product domains plug in as <Text strong>microfrontends</Text> via Module
      Federation. Right now there's one remote registered:
    </Paragraph>

    <Card title="Registered remotes" style={{ marginTop: 16 }}>
      <Paragraph style={{ marginBottom: 8 }}>
        <Text code>control_tower</Text> → loaded from{' '}
        <Text code>http://localhost:5173/remoteEntry.js</Text>
      </Paragraph>
      <Paragraph style={{ marginBottom: 0 }}>
        Open <Link to="/control-tower">/control-tower</Link> to mount it. The remote's
        bundle is fetched on demand the first time you visit that route.
      </Paragraph>
    </Card>

    <Card title="What's shared across host + remote" style={{ marginTop: 16 }}>
      <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
        <li>
          <Text code>react</Text> / <Text code>react-dom</Text> — singletons so hooks &
          context work across the boundary.
        </li>
        <li>
          <Text code>react-router-dom</Text> — singleton so a single history stack
          drives both host routes and nested remote routes.
        </li>
        <li>
          <Text code>@azure/msal-browser</Text> / <Text code>@azure/msal-react</Text>{' '}
          — singletons so the user signs in once on the host and the remote reuses
          the same token cache.
        </li>
        <li>
          <Text code>antd</Text> — singleton so theme tokens & CSS-in-JS cache are
          consistent.
        </li>
      </ul>
    </Card>
  </div>
)
