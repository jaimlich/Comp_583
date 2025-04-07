import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, IconButton, Box, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/auth/register', formData);
      toast.success('✅ Registered successfully! Please verify your email.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Registration failed.');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#dc004e', color: 'white', display: 'flex', alignItems: 'center' }}>
        <PersonAddIcon sx={{ mr: 1 }} /> Create Your Account
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            required
            name="name"
            onChange={handleChange}
            InputProps={{ startAdornment: <PersonAddIcon sx={{ mr: 1, color: '#dc004e' }} /> }}
          />
          <TextField
            label="Email Address"
            variant="outlined"
            type="email"
            fullWidth
            required
            name="email"
            onChange={handleChange}
            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: '#dc004e' }} /> }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            name="password"
            onChange={handleChange}
            InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: '#dc004e' }} /> }}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            name="confirmPassword"
            onChange={handleChange}
            InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: '#dc004e' }} /> }}
          />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Password requirements: at least 8 characters, with uppercase, lowercase, number, and a special symbol.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" align="center">
          Already have an account?
          <Button variant="text" onClick={onSwitchToLogin}>Login</Button>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleSubmit} variant="contained" color="secondary" fullWidth size="large">
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;
