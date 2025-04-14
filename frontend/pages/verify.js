// frontend/pages/verify.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;

    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.text())
      .then(() => {
        toast.success("✅ Email verified successfully!");
        router.push("/"); // redirect after verify
      })
      .catch(() => {
        toast.error("❌ Invalid or expired token.");
        router.push("/");
      });
  }, [router]);

  return <p>🔄 Verifying...</p>;
}
