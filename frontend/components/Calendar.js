import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField, Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import dayjs from 'dayjs';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        const response = await fetch(`/api/reservations?date=${dateStr}`);
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, [selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6">Booking Calendar</Typography>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          slots={{ textField: (params) => <TextField {...params} /> }}
        />
        <List>
          {bookings.map((booking, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={booking.name} secondary={`Mountain: ${booking.mountain}, Date: ${booking.date}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar;
