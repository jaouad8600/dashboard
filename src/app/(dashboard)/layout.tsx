import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardShell({children}:{children:React.ReactNode}){
  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col ml-64">
        <Topbar />
        <main className="p-4">{children}</main>
      </div>
    </>
  );
}
