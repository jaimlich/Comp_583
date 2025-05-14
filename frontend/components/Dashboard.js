// frontend/components/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  Typography,
  Divider,
  Box,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  Paper,
  Fade,
  MobileStepper
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useModalStore } from "../store/useModalStore";
import axios from "axios";
import jsPDF from "jspdf";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Slide } from "@mui/material";

const walkthroughCards = [
  {
    title: "📋 Manage",
    text: "Review past and upcoming reservations."
  },
  {
    title: "📥 Download",
    text: "Export your QR or print your ticket."
  },
  {
    title: "💬 Alerts",
    text: "Stay informed on snow or road changes."
  }
];

const testimonials = [
  "“QR-based access means faster lines.”",
  "“Manage and cancel bookings any time.”",
  "“Get notified of snow changes or chain alerts.”"
];

const Dashboard = () => {
  const { user } = useAuth();
  const { openModal } = useModalStore();
  const [bookings, setBookings] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [walkIndex, setWalkIndex] = useState(0);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/booking/user/${user.user_id}`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch user bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (selectedQr) {
      const refresh = setInterval(() => {
        setSelectedQr({ ...selectedQr });
      }, 4000);
      return () => clearInterval(refresh);
    }
  }, [selectedQr]);

  useEffect(() => {
    if (!user) {
      const rotate = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % testimonials.length);
        setWalkIndex((prev) => (prev + 1) % walkthroughCards.length);
      }, 5000);
      return () => clearInterval(rotate);
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    try {
      await axios.post(`/api/booking/cancel/${bookingId}`);
      await fetchBookings();
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleDownload = (bk) => {
    const doc = new jsPDF();
    doc.text(`🎿 Lift Ticket`, 10, 10);
    doc.text(`Mountain: ${bk.mountain_name}`, 10, 20);
    doc.text(`Date: ${bk.reservation_date}`, 10, 30);
    doc.text(`Time: ${bk.slot === "AM" ? "6:00 AM – 11:59 AM" : "12:00 PM – 5:00 PM"}`, 10, 40);
    doc.text(`Ticket ID: ${bk.booking_id}`, 10, 50);
    doc.save(`ticket-${bk.booking_id}.pdf`);
  };

  const slotDisplay = (slot) => {
    const label = slot === "AM" ? "6:00 AM – 11:59 AM" : "12:00 PM – 5:00 PM";
    const color = slot === "AM" ? "primary" : "secondary";
    return <Chip label={`${slot} (${label})`} size="small" color={color} />;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        📋 Your Booking Dashboard
      </Typography>

      <Divider sx={{ my: 2 }} />

      {user ? (
        <>
          <Typography variant="h6" gutterBottom>
            Your upcoming bookings:
          </Typography>
          {bookings.length === 0 ? (
            <Typography variant="body2">No bookings yet.</Typography>
          ) : (
            bookings.map((bk, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 2,
                  background: "#fdfdfd"
                }}
              >
                <Typography variant="subtitle2">⛷️ {bk.mountain_name}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {bk.reservation_date} — Ticket ID: {bk.booking_id}
                </Typography>
                {slotDisplay(bk.slot)}

                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Link
                    onClick={() => setSelectedQr(bk)}
                    sx={{ cursor: "pointer", fontSize: 14 }}
                  >
                    View QR Code
                  </Link>
                  <Link
                    onClick={() => handleCancel(bk.booking_id)}
                    sx={{ cursor: "pointer", fontSize: 14, color: "red" }}
                  >
                    Cancel
                  </Link>
                  <Link
                    onClick={() => handleDownload(bk)}
                    sx={{ cursor: "pointer", fontSize: 14 }}
                  >
                    Download PDF
                  </Link>
                </Box>
              </Paper>
            ))
          )}
        </>
      ) : (
        <>
          <Typography variant="body1" align="center" sx={{ mb: 2.5 }}>
            <Link onClick={() => openModal("login")} sx={{ cursor: "pointer" }}>
              Login
            </Link>{" "}
            to view your dashboard.
          </Typography>

          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Slide in direction="left" key={walkIndex}>
              <Paper
                elevation={2}
                sx={{
                  display: "inline-block",
                  px: 4,
                  py: 2,
                  minWidth: 280,
                  maxWidth: 800,
                  transition: "all 0.5s ease-in-out"
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {walkthroughCards[walkIndex].title}
                </Typography>
                <Typography variant="body2">
                  {walkthroughCards[walkIndex].text}
                </Typography>
                <MobileStepper
                  steps={walkthroughCards.length}
                  position="static"
                  activeStep={walkIndex}
                  nextButton={<></>}
                  backButton={<></>}
                  sx={{ justifyContent: "center", pt: 30.5, px: 44, background: "none" }}
                />
              </Paper>
            </Slide>
          </Box>

          <Box
            sx={{
              px: 1,
              py: 3,
              backgroundColor: "#f7f9fc",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: 2,
              textAlign: "center",
              mt: 1,
              minHeight: 140
            }}
          >
            <Fade in key={tipIndex} timeout={1000}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  ❄️ Why sign up?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {testimonials[tipIndex]}
                </Typography>
                <Button variant="contained" onClick={() => openModal("register")}>Register Now</Button>
              </Box>
            </Fade>
          </Box>
        </>
      )}

      <Dialog open={!!selectedQr} onClose={() => setSelectedQr(null)}>
        <DialogTitle>Booking QR Preview</DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          {selectedQr && (
            <>
              <Typography variant="subtitle1">{selectedQr.mountain_name}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {selectedQr.reservation_date} ({selectedQr.slot})
              </Typography>
              <img
                src={selectedQr.qr_code_url}
                alt="QR"
                style={{ width: "60%", marginBottom: 12 }}
              />
              <Typography sx={{ fontSize: 12 }}>
                Ticket ID: {selectedQr.booking_id}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
