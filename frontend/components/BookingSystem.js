// imports unchanged
import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, MenuItem, Typography, Paper,
  Divider, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle,
  DialogContent, Fade
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

const BookingSystem = ({ mountains = [], selectedMountain }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slot, setSlot] = useState("AM");
  const [formData, setFormData] = useState({ mountain: "", ticketCount: 1 });
  const [confirmation, setConfirmation] = useState(null);
  const [availability, setAvailability] = useState({ AM: 0, PM: 0 });

  const selectedMountainObj = mountains.find(m =>
    (m.id || m.name) === (formData.mountain || selectedMountain?.id || selectedMountain?.name)
  );

  useEffect(() => {
    if (selectedMountain) {
      setFormData(prev => ({
        ...prev,
        mountain: selectedMountain.id || selectedMountain.name
      }));
    }
  }, [selectedMountain]);

  useEffect(() => {
    if (!formData.mountain || !selectedDate) return;

    const checkAvailability = async () => {
      try {
        const res = await axios.get("/api/booking/availability", {
          params: {
            lift_id: formData.mountain,
            reservation_date: selectedDate.format("YYYY-MM-DD")
          }
        });
        if (res.data) {
          setAvailability({
            AM: parseInt(res.data.AM) || 0,
            PM: parseInt(res.data.PM) || 0
          });
        } else {
          setAvailability({ AM: 0, PM: 0 });
        }
      } catch (err) {
        console.error("Error checking availability", err);
        setAvailability({ AM: 0, PM: 0 });
      }
    };

    checkAvailability();
  }, [formData.mountain, selectedDate]);

  const handleSlotChange = (_, newSlot) => {
    if (newSlot && availability[newSlot] > 0) {
      setSlot(newSlot);
    }
  };

  const handleBooking = async () => {
    if (!user) return toast.error("Please login to book.");
    if (!formData.mountain) return toast.error("Please select a mountain.");
    if (!slot || !selectedDate) return toast.error("Choose date and time slot.");
    if (availability[slot] < formData.ticketCount) return toast.error("Not enough spots left.");

    try {
      const response = await axios.post("/api/booking", {
        user_id: user.user_id,
        lift_id: formData.mountain,
        reservation_date: selectedDate.format("YYYY-MM-DD"),
        slot,
        ticket_count: formData.ticketCount
      });

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      toast.success("Booking confirmed!");

      setConfirmation({
        qr_code_url: response.data.qr_code_url,
        mountain: formData.mountain,
        slot,
        date: selectedDate.format("YYYY-MM-DD")
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed.");
    }
  };

  if (confirmation) {
    return (
      <Dialog open onClose={() => setConfirmation(null)} fullWidth>
        <DialogTitle>Booking Confirmed</DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="h6">Your lift ticket is confirmed!</Typography>
          <Typography>{confirmation.date} ({confirmation.slot})</Typography>
          <img src={confirmation.qr_code_url} alt="QR Code" style={{ marginTop: 20 }} />
          <Typography sx={{ mt: 2, fontSize: 12 }} color="text.secondary">
            [🧪 Placeholder] QR will be emailed. Stub feature - complete in next release.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const selectedLabel = selectedMountainObj?.name || formData.mountain;
  const artworkUrl = slot === "AM"
    ? "/assets/sunrise_clean_transparent.png"
    : "/assets/night_clean_transparent.png";

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "12px",
        boxShadow: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>🎟️ Book Your Spot</Typography>

        <TextField
          label="Select Mountain"
          name="mountain"
          select
          value={formData.mountain}
          onChange={e => setFormData({ ...formData, mountain: e.target.value })}
          fullWidth
          sx={{ mb: 1.5 }}
        >
          {mountains.map((mtn, i) => (
            <MenuItem key={i} value={mtn.id || mtn.name}>
              {mtn.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select date"
            value={selectedDate}
            onChange={newDate => setSelectedDate(newDate)}
            sx={{ width: "70%" }}
          />
        </LocalizationProvider>

        <TextField
          label="Tickets"
          type="number"
          inputProps={{ min: 1, max: 10 }}
          value={formData.ticketCount}
          onChange={e => setFormData({ ...formData, ticketCount: parseInt(e.target.value) || 1 })}
          sx={{ width: "30%" }}
        />
      </Box>

        <Typography variant="subtitle1" sx={{ mt: 0, mb: 0.5 }}>
          Select Time Slot
        </Typography>

        <ToggleButtonGroup
          value={formData.mountain ? slot : null}
          exclusive
          onChange={handleSlotChange}
          fullWidth
          sx={{
            mb: 0.5,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.05)"
          }}
        >
          {["AM", "PM"].map((time) => {
            const count = formData.mountain ? availability[time] : null;
            const isLow = count > 0 && count <= 5;
            const isFull = count === 0;
            const isInactive = count === null;
            const isSelected = slot === time;
            const label = time === "AM" ? "6:00 AM – 12:00 PM" : "12:00 PM – 6:00 PM";

            return (
              <ToggleButton
                key={time}
                value={time}
                disabled={isInactive || isFull}
                sx={{
                  flex: 1,
                  border: "none",
                  borderRadius: 0,
                  py: 1.5,
                  fontWeight: isSelected ? "bold" : "normal",
                  color: isInactive
                    ? "#aaa"
                    : isSelected
                      ? "#fff"
                      : isLow
                        ? "orange"
                        : "inherit",
                  backgroundColor: isInactive
                    ? "#f0f0f0"
                    : isSelected
                      ? "#1976d2"
                      : "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor:
                      isInactive || isSelected ? undefined : "rgba(25, 118, 210, 0.1)",
                    transform: isInactive ? "none" : "scale(1.02)"
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2 !important",
                    color: "#fff"
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                    backgroundColor: "#f0f0f0",
                  }
                }}
              >
                <span>{time} ({isInactive ? "—" : isFull ? "FULL" : `${count} LEFT`})</span>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="caption" color="text.secondary">06:00AM – 12:00PM</Typography>
          <Typography variant="caption" color="text.secondary">12:00PM – 06:00PM</Typography>
        </Box>

        <Fade in timeout={400}>
          <Box
            sx={{
              mt: 2,
              width: "100%",
              height: 180,
              zoom: 1.3,
              backgroundImage: `url(${artworkUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              borderRadius: 3.5,
              filter: "blur(0.2px)"
            }}
          />
        </Fade>
      </Box>

      <Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
          {selectedLabel && selectedDate
            ? `You are booking ${selectedLabel} on ${selectedDate.format("MM/DD/YYYY")} (${slot})`
            : `Select mountain, date, and time to continue.`}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleBooking}
          disabled={availability[slot] < formData.ticketCount}
        >
          Confirm Booking
        </Button>
      </Box>
    </Paper>
  );
};

export default BookingSystem;
