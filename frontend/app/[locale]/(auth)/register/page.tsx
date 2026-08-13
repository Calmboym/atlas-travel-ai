import type { Metadata } from "next";
import { RegisterPageContent } from "@/components/auth/register-page-content";

export const metadata: Metadata = {
  title: "Create your account — Atlas",
  description:
    "Create your Atlas account to save trips and pick up right where you left off.",
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
