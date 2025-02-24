import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, Divider } from '@mui/material';

const Sidebar = ({ mountains }) => {
  return (
    <Box sx={{ width: '300px', height: '70vh', overflowY: 'auto', borderRight: '1px solid #ccc', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Popular Mountains
      </Typography>
      <List>

      {/* {mountains.map((mountain, index) => (
          <div key={index}>
            <h3>{mountain.name}</h3>
            <p>Distance: {mountain.distance ? `${mountain.distance} mi` : 'N/A'}</p>
            <p>Weather: {mountain.currentWeather ? `${mountain.currentWeather.temp}°F, ${mountain.currentWeather.conditions}` : 'Unavailable'}</p>
          </div>
        ))} */}

        {/* old code */}
        {mountains && mountains.map((mountain, index) => (
          <React.Fragment key={index}>
            <ListItem button onClick={() => window.alert(`View details for ${mountain.name}`)}>
              <ListItemText
                primary={mountain.name}
                secondary={`Distance: ${mountain.distance || 'N/A'} km | Weather: ${mountain.weather}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}

      </List>
      <Typography variant="body2" color="textSecondary">
        Road Closures: {mountains && mountains.length > 0 && mountains[0].roadClosure ? 'Active' : 'None'}
      </Typography>
    </Box>
  );
};

export default Sidebar;
