import React, { useEffect, useState } from "react";
import {
  LocalizationProvider,
  DateCalendar
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  Fade
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useModalStore } from "../store/useModalStore";
import dayjs from "dayjs";
import axios from "axios";

const testimonials = [
  "“This app makes lift planning so much easier!”",
  "“Booking a time slot saved us from long lines.”",
  "“I love the QR code system. Smooth check-in!”",
  "Book early to guarantee your favorite slot.",
  "QR codes make lift access faster!",
  "Bundle with gear rental for 10% off at checkout.",
  "Check snow conditions before booking your ride.",
  "Priority entry is included with your reservation."
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { user } = useAuth();
  const { openModal } = useModalStore();
  const [bookings, setBookings] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);

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
      const rotateInterval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % testimonials.length);
      }, 4200); // ⏱️ tip interval duration
      return () => clearInterval(rotateInterval);
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

  const slotDisplay = (slot) => {
    const label = slot === "AM" ? "6:00 AM - 11:59 AM" : "12:00 PM - 5:00 PM";
    const color = slot === "AM" ? "primary" : "secondary";
    return <Chip label={`${slot} (${label})`} size="small" color={color} />;
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        📅 Select a Date for Booking
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
      value={selectedDate}
      onChange={(newValue) => setSelectedDate(newValue)}
      sx={{
        width: "100%",
        background: "#fff",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.06)",
        p: 2,
        ".MuiDayCalendar-weekContainer": {
          justifyContent: "space-between",
          gap: "4px",
          borderBottom: "1px solid rgba(0,0,0,0.05)"
        },
        ".MuiDayCalendar-weekContainer:last-of-type": {
          borderBottom: "none"
        },
        ".MuiDayCalendar-header": {
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          pb: 0.5,
          mb: 0.5
        },
        ".MuiPickersCalendarHeader-root": {
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          mb: 1
        }
      }}
      />
      </LocalizationProvider>

      <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)" }} />

      {user ? (
        <>
          <Typography variant="h6" gutterBottom>
            Your upcoming bookings:
          </Typography>
          {bookings.length === 0 ? (
            <Typography variant="body2">No bookings yet.</Typography>
          ) : (
            bookings.map((bk, i) => (
              <Box
                key={i}
                sx={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 1
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
                </Box>
              </Box>
            ))
          )}
        </>
      ) : (
        <>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            <Link onClick={() => openModal("login")} sx={{ cursor: "pointer" }}>
              Login
            </Link>{" "}
            to view your upcoming bookings
          </Typography>

          <Box
            sx={{
              px: 3,
              py: 4,
              backgroundColor: "#f7f9fc",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: 2,
              textAlign: "center",
              transition: "all 2.0s ease"
            }}
          >
            <Fade in key={tipIndex} timeout={800}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  ❄️ Ready to ride?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {testimonials[tipIndex]}
                </Typography>
                <Button variant="contained" onClick={() => openModal("register")}>
                  Register Now
                </Button>
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

export default Calendar;
