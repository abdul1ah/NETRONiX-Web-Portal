
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Dashboard | NETRONiX Admin",
  description: "NETRONiX Network Society Operations and Complaint Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col antialiased font-sans selection:bg-red-500 selection:text-white">
      {children}
    </div>
  );
}
