import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth, user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);   // res.data 구조에 맞게 조정하세요
      const token = res.token;                    // 예: const token = res.data.token;
      setAuth(token);
      navigate('/admin/dashboard');
    } catch (error) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          로그인
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            로그인
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 