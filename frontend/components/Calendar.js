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
        // const response = await fetch(`http://localhost:5000/api/reservations?date=${dateStr}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched bookings:', data); // Debugging log

        // Ensure the data is an array before setting state
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]); // Fallback to empty array to avoid .map errors
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
        {bookings.length > 0 ? (
          <List>
            {bookings.map((booking, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={booking.name} secondary={`Mountain: ${booking.mountain}, Date: ${booking.date}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" sx={{ mt: 2 }}>
            No bookings found for this date.
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar;
