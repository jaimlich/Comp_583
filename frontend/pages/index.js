import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { hydrateRoot } from 'react-dom/client';
import { Box, TextField, Button } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import BookingSystem from '../components/BookingSystem';
import Calendar from '../components/Calendar';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mountains, setMountains] = useState([]);

  // Fetch mountain data (default is Southern California popular mountains)
  const fetchMountains = async (query = 'Southern California') => {
    try {
      const response = await fetch(`http://localhost:3000/api/mountains?query=${encodeURIComponent(query)}`);
      const text = await response.text(); // Read response as text first
  
      try {
        const data = JSON.parse(text); // Convert to JSON
        setMountains(data);
      } catch (jsonError) {
        console.error('API returned non-JSON:', text);
      }
    } catch (error) {
      console.error('Error fetching mountain data:', error);
    }
  };

  useEffect(() => {
    fetchMountains();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
    await fetchMountains(searchQuery);
  };

  return (
    <Box>
      <Head>
        <title>Snow Mountain Tracker</title>
      </Head>
      <Box display="flex" height="70vh">
        <Sidebar mountains={mountains} />
        <Box flex={1} position="relative">
          {/* Search bar overlay on the map */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              width: '300px',
              backgroundColor: 'white',
              p: 1,
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            <TextField
              label="Search by zip code or city"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          <Button variant="contained" onClick={handleSearch} sx={{ mt: 1 }}>
            Search
          </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    // You can implement centering the map based on geolocation
                    console.log('User position:', position.coords);
                  });
                } else {
                  alert('Geolocation is not supported by this browser.');
                }
              }}
              sx={{ mt: 1 }}
            >
              Locate Me
            </Button>
          </Box>
          <Map mountains={mountains} />
        </Box>
      </Box>
      <BookingSystem />
      <Calendar />
    </Box>
  );
};

export default Home;
