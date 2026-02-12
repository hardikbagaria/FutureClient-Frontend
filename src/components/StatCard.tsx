import { Card, Statistic, type StatisticProps } from 'antd';

interface StatCardProps extends StatisticProps {
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon, ...props }) => {
    return (
        <Card bordered={false} style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {icon && (
                    <div
                        style={{
                            fontSize: '32px',
                            color: '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {icon}
                    </div>
                )}
                <Statistic {...props} />
            </div>
        </Card>
    );
};

export default StatCard;
