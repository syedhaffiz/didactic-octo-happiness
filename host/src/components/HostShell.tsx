import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, Space } from 'antd'
import { AppstoreOutlined, HomeOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { useMsal } from '@azure/msal-react'

const { Header, Sider, Content } = Layout

export const HostShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { accounts, instance } = useMsal()
  const name = accounts[0]?.name ?? accounts[0]?.username ?? 'Account'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
          MFE Host
          <span style={{ marginLeft: 8, color: '#9aa4b2', fontWeight: 400, fontSize: 12 }}>
            Module Federation demo
          </span>
        </div>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'signout',
                label: 'Sign out',
                onClick: () => void instance.logoutRedirect({ account: accounts[0] }),
              },
            ],
          }}
        >
          <Space size={8} style={{ cursor: 'pointer', color: '#fff' }}>
            <Avatar size={28} icon={<UserOutlined />} style={{ background: '#fff', color: '#001529' }} />
            <span style={{ fontSize: 13 }}>{name}</span>
            <DownOutlined style={{ fontSize: 10 }} />
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={220} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[
              location.pathname.startsWith('/control-tower') ? '/control-tower' : location.pathname,
            ]}
            onClick={({ key }) => navigate(key)}
            items={[
              { key: '/', icon: <HomeOutlined />, label: 'Home' },
              { key: '/control-tower', icon: <AppstoreOutlined />, label: 'Control Tower (MFE)' },
            ]}
            style={{ borderInlineEnd: 'none' }}
          />
        </Sider>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
