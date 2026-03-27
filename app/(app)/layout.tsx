import { NavBar } from "@/components/nav-bar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-20">
      {children}
      <NavBar />
    </div>
  );
}
