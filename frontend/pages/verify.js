import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CircularProgress, Typography, Box, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";
import { useModalStore } from "../store/useModalStore";

export default function VerifyPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { openModal } = useModalStore();
  const [status, setStatus] = useState("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runVerification = async () => {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        toast.error("❌ Missing token.");
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message || "❌ Verification failed.");
          setStatus("error");
          openModal("login");
          return;
        }

        toast.success("✅ Email verified!");
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

        const me = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (me.ok) {
          const { user } = await me.json();
          setUser(user);
          console.log("✅ User logged in:", user);
          setStatus("success");
        } else {
          toast.warn("⚠️ Verified, but not logged in.");
          setStatus("error");
          openModal("login");
        }
      } catch (err) {
        console.error("❌ Verification error:", err);
        toast.error("❌ Could not verify.");
        setStatus("error");
        openModal("login");
      }

      setTimeout(() => {
        router.replace("/");
      }, 4000);
    };

    runVerification();
  }, [router, setUser, openModal]);

  return (
    <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
      <Paper sx={{ p: 4, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}
        {status === "success" && (
          <>
            <Typography variant="h5" color="success.main" gutterBottom>
              ✅ Email Verified
            </Typography>
            <Typography>Redirecting to homepage...</Typography>
          </>
        )}
        {status === "error" && (
          <>
            <Typography variant="h5" color="error" gutterBottom>
              ❌ Verification Failed
            </Typography>
            <Typography>Check your email link or log in manually.</Typography>
            <Typography sx={{ mt: 2 }}>Redirecting shortly...</Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}
