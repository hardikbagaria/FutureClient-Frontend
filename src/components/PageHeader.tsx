import { Typography, Space, Button } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
    title: string;
    extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, extra }) => {
    return (
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
                {title}
            </Title>
            {extra && <Space>{extra}</Space>}
        </div>
    );
};

export default PageHeader;
