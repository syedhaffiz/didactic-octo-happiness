import { Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/client";

const { Title, Text } = Typography;

export const FinanceOverview = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ["health"], queryFn: getHealth });

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Finance Overview
      </Title>
      <Text type="secondary">Apr 25 – Feb 26</Text>
      <Card style={{ marginTop: 16 }} title="Scaffold sanity check">
        {isLoading ? (
          <Text>Pinging API…</Text>
        ) : error ? (
          <Text type="danger">API error: {String(error)}</Text>
        ) : (
          <Text>
            API is up — status: <b>{data?.status}</b>, uptime: {data?.uptime.toFixed(1)}s
          </Text>
        )}
      </Card>
    </div>
  );
};
