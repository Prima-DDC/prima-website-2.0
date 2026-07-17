import { redirect } from "next/navigation";

// Superseded by the full profile page; kept so old links keep working.
export default function PasswordPage() {
  redirect("/portal/profile");
}
