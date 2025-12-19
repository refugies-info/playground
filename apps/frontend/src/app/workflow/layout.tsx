import { TopNav } from "@/components/TopNav";

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
