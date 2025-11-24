import RoleSwitcher from "@/components/ui/RoleSwitcher";
import Sidebar from "@/components/ui/Sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teylingereind-gray via-blue-50/30 to-teylingereind-gray relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-teylingereind-royal/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-teylingereind-orange/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 transition-all duration-300 relative z-10">
        <Breadcrumbs />
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      <RoleSwitcher />
    </div>
  );
}
