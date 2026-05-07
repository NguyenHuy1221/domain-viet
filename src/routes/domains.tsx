import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/domains")({
  component: () => (
    <PagePlaceholder title="Domain" icon="🌐" desc="Danh sách & quản lý toàn bộ tên miền." />
  ),
});