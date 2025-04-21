import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CircularProgress, Typography, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

export default function VerifyPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const runVerification = async () => {
      if (typeof window === "undefined") return;

      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        toast.error("❌ Missing verification token.");
        return router.push("/");
      }

      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const resultText = await res.text();

        if (res.ok) {
          toast.success("✅ Email verified successfully!");

          // 🎉 Fire confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          // Try auto-login if token is cookie-based
          const userRes = await fetch("/api/auth/me");
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
            toast.success("🎉 You are now logged in.");
          }
        } else {
          toast.error(resultText || "❌ Invalid or expired token.");
        }

        router.push("/");
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("❌ Something went wrong.");
        router.push("/");
      }
    };

    runVerification();
  }, [router, setUser]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography>Verifying your email, please wait...</Typography>
    </Box>
  );
}
