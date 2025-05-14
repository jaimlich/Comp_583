// frontend/components/Auth/RegisterModal.js

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, IconButton, Box, Divider, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'email') setEmailError(null);
  };

  const checkEmailExists = async () => {
    if (!formData.email) return;
    setCheckingEmail(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
      if (res.data.exists) {
        setEmailError("Email is already registered.");
        toast.warn("⚠️ Email is already registered.");
      } else {
        setEmailError(null);
      }
    } catch (err) {
      console.error("Email check failed:", err);
      toast.error("❌ Could not check email.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("⚠️ Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("⚠️ Passwords do not match.");
      return;
    }

    if (emailError) {
      toast.error("⚠️ Resolve email issue before submitting.");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Registering user with data:", formData);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      toast.success(res.data.message || "🎉 Registered! Check your inbox.");
      onClose();
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error(err.response?.data?.message || "❌ Internal error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center' }}>
        <PersonAddIcon sx={{ mr: 1 }} /> Create Your Account
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: '48px !important', paddingX: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonAddIcon sx={{ color: '#dc004e' }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            variant="outlined"
            fullWidth
            error={!!emailError}
            helperText={emailError}
            onBlur={checkEmailExists}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#dc004e' }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#dc004e' }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#dc004e' }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Password must be at least 8 characters and include a symbol and number.
        </Typography>

        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" align="center">
          Already have an account?
          <Button variant="text" onClick={onSwitchToLogin}>Login</Button>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleRegister}
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || checkingEmail}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;
