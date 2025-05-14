import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // Default theme mode
    primary: {
      main: "#1976d2", // Customize primary color
    },
    secondary: {
      main: "#dc004e", // Customize secondary color
    },
  },
});

export default theme;
