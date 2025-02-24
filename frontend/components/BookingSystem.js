import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const BookingSystem = () => {
  const [reservation, setReservation] = useState({ name: '', email: '', mountain: '', date: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setReservation({ ...reservation, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      const data = await response.json();
      setMessage('Reservation successful!');
      console.log('Reservation response:', data);
    } catch (error) {
      console.error('Reservation error:', error);
      setMessage('Reservation failed.');
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
      <Typography variant="h6">Book Ski Lift Tickets</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" variant="outlined" fullWidth margin="normal" value={reservation.name} onChange={handleChange} />
        <TextField label="Email" name="email" variant="outlined" fullWidth margin="normal" value={reservation.email} onChange={handleChange} />
        <TextField label="Mountain" name="mountain" variant="outlined" fullWidth margin="normal" value={reservation.mountain} onChange={handleChange} />        
        <TextField label="Date" name="date" type="date" variant="outlined" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={reservation.date} onChange={handleChange} />
        <Button type="submit" variant="contained" color="primary">Reserve</Button>
      </form>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

export default BookingSystem;
