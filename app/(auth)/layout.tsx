import AuthLayoutClient from "./AuthLayoutClient";
import { getAuthStats } from "./getAuthStats";

export const revalidate = 300;

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const stats = await getAuthStats();

  return <AuthLayoutClient stats={stats}>{children}</AuthLayoutClient>;
}
