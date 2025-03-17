import React, { useState, useEffect } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField, Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import dayjs from 'dayjs';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true; // Cleanup mechanism

    const fetchBookings = async () => {
      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        const response = await fetch(`/api/reservations?date=${dateStr}`);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('Fetched bookings:', data); // Debugging log

        if (isMounted) setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (isMounted) setBookings([]);
      }
    };

    fetchBookings();
    
    return () => {
      isMounted = false; // Cleanup on component unmount
    };
  }, [selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6">Booking Calendar</Typography>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          textField={(params) => <TextField {...params} />}
        />
        {bookings.length > 0 ? (
          <List>
            {bookings.map((booking, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={booking.name}
                  secondary={`Mountain: ${booking.mountain}, Date: ${booking.date}`}
                />
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
