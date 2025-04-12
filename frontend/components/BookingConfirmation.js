import React from "react";
import { Box, Typography, Button } from "@mui/material";

const BookingConfirmation = ({ bookingData, onClose }) => {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        🎉 Booking Confirmed!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Mountain: {bookingData.mountain}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Date: {bookingData.date}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Slot: {bookingData.slot}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Confirmation QR:
      </Typography>
      <img src={bookingData.qr_code_url} alt="QR Code" style={{ marginTop: 10, width: "200px" }} />
      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Done
        </Button>
      </Box>
    </Box>
  );
};

export default BookingConfirmation;
