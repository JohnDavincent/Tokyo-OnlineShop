import type { Metadata } from "next";
import AdminThemeProvider from "./components/AdminThemeProvider";

export const metadata: Metadata = {
  title: "Tokyo GO Admin",
  description: "Tokyo GO store administration panel",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
