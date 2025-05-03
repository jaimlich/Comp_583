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
        setStatus("error");
        toast.error("❌ Missing token.");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);

        if (res.ok) {
          setStatus("success");
          toast.success("✅ Email verified!");
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

          const me = await fetch("/api/auth/me");
          if (me.ok) {
            const result = await me.json();
            setUser(result.user);
          } else {
            openModal("login");
          }
        } else {
          const data = await res.json();
          setStatus("error");
          toast.error(data?.message || "❌ Invalid or expired token.");
          openModal("login");
        }
      } catch (err) {
        setStatus("error");
        toast.error("❌ Something went wrong.");
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
