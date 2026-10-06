import { DashboardLayout } from "../components/dashboard/DashBoardLayout";
import { DashboardProviders } from "./providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardProviders>
  );
}
