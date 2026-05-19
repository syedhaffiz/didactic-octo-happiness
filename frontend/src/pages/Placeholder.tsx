import { Card, Empty } from "antd";

export const Placeholder = ({ title }: { title: string }) => (
  <Card>
    <Empty description={<span>{title} — coming soon</span>} />
  </Card>
);
