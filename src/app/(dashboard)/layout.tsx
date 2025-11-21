import RoleSwitcher from "@/components/ui/RoleSwitcher";
import Sidebar from "@/components/ui/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>

      <RoleSwitcher />
    </div>
  );
}
