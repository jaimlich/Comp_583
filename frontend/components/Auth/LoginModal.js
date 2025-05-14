import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, IconButton, Box, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNotification } from '../../context/NotificationContext';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showSnackbar } = useNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      await login(email, password);
      showSnackbar("🎉 Successfully logged in!", "success");
      setTimeout(() => {
        onClose();
      }, 600); // delay close to ensure snackbar is visible
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes("verify")) {
        toast.warning("Please verify your email.");
      } else {
        showSnackbar("❌ Login failed. Check credentials.", "error");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleResend = async () => {
    if (!email) return toast.info("Enter your email first.");
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    toast.info(data.message || "Verification email resent.");
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1 }} /> User Login
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ paddingTop: '48px !important', paddingX: '32px !important' }}
        onKeyDown={handleKeyDown}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px !important' }}>
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            required
            InputProps={{
              startAdornment: <AccountCircleIcon sx={{ mr: 1, color: '#1976d2' }} />,
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            InputProps={{
              startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: '#1976d2' }} />,
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="text" size="small" onClick={handleResend}>
            🔁 Resend verification email
          </Button>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" align="center">
          Don't have an account?
          <Button variant="text" onClick={onSwitchToRegister}>Register</Button>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleLogin} variant="contained" fullWidth size="large">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal;
