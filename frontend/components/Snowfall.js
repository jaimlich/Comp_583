import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';

const SNOWFLAKE_COUNT = 40;
const SNOWFLAKE_IMAGES = Array.from({ length: 8 }, (_, i) => `/icons/SVG/snowfall/snowflake-${(i % 5) + 1}.svg`);

const getRandom = (min, max) => Math.random() * (max - min) + min;

const generateSnowflake = (id) => ({
  id,
  left: `${getRandom(0, 100)}vw`,
  delay: `${getRandom(0, 10)}s`,
  duration: `${getRandom(8, 16)}s`,
  drift: getRandom(-30, 30), // horizontal sway
  size: `${getRandom(18, 32)}px`,
  image: SNOWFLAKE_IMAGES[Math.floor(Math.random() * SNOWFLAKE_IMAGES.length)],
  rotate: `${getRandom(-20, 20)}deg`
});

const Snowfall = () => {
  const [flakes, setFlakes] = useState([]);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const initialFlakes = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => generateSnowflake(i));
    setFlakes(initialFlakes);
  }, []);

  return (
    <>
      {flakes.map(flake => (
        <img
          key={flake.id}
          src={flake.image}
          alt="❄"
          style={{
            position: 'fixed',
            top: '-40px',
            left: flake.left,
            width: flake.size,
            height: flake.size,
            animation: `fallDrift ${flake.duration} linear ${flake.delay} infinite`,
            transform: `rotate(${flake.rotate})`,
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.4))',
            opacity: 0.6,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};

export default Snowfall;
