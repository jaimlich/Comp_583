import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
