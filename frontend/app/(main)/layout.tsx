import { AppShell } from "@/src/components/AppShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
