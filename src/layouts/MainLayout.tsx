import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    DashboardOutlined,
    InboxOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    BookOutlined,
    FileTextOutlined,
    DollarOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
    },
    {
        key: '/items',
        icon: <InboxOutlined />,
        label: 'Items',
    },
    {
        key: '/purchase',
        icon: <ShoppingCartOutlined />,
        label: 'Purchase',
        children: [
            {
                key: '/purchase/parties',
                icon: <TeamOutlined />,
                label: 'Parties',
            },
            {
                key: '/purchase/bills',
                icon: <FileTextOutlined />,
                label: 'Bills',
            },
            {
                key: '/purchase/payments',
                icon: <DollarOutlined />,
                label: 'Payments',
            },
        ],
    },
    {
        key: '/sales',
        icon: <ShoppingOutlined />,
        label: 'Sales',
        children: [
            {
                key: '/sales/parties',
                icon: <TeamOutlined />,
                label: 'Parties',
            },
            {
                key: '/sales/bills',
                icon: <FileTextOutlined />,
                label: 'Bills',
            },
            {
                key: '/sales/payments',
                icon: <DollarOutlined />,
                label: 'Payments',
            },
        ],
    },
    {
        key: '/ledger',
        icon: <BookOutlined />,
        label: 'Ledger & Reports',
        children: [
            {
                key: '/ledger/purchase',
                label: 'Purchase Ledger',
            },
            {
                key: '/ledger/sales',
                label: 'Sales Ledger',
            },
            {
                key: '/ledger/gst',
                label: 'GST Reports',
            },
        ],
    },
];

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={240}>
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: collapsed ? '18px' : '20px',
                        fontWeight: 'bold',
                        color: '#fff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {collapsed ? 'BS' : 'Billing System'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['/purchase', '/sales', '/ledger']}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    }}
                >
                    {collapsed ? (
                        <MenuUnfoldOutlined
                            style={{ fontSize: '18px', padding: '0 24px', cursor: 'pointer' }}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    ) : (
                        <MenuFoldOutlined
                            style={{ fontSize: '18px', padding: '0 24px', cursor: 'pointer' }}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    )}
                    <div style={{ marginLeft: 'auto', padding: '0 24px', fontSize: '16px' }}>
                        Welcome, Admin
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
