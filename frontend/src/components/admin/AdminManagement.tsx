import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Admin, getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api/admin';

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '관리자 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({ email: '', password: '', name: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAdmin(null);
    setFormData({ email: '', password: '', name: '' });
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      name: admin.name,
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
      try {
        await deleteAdmin(id);
        fetchAdmins();
      } catch (err: any) {
        setError(err.response?.data?.message || '관리자 삭제에 실패했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEdit && selectedAdmin) {
        await updateAdmin(selectedAdmin.id, {
          name: formData.name,
          ...(formData.password && { password: formData.password }),
        });
      } else {
        await createAdmin(formData);
      }
      handleClose();
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || '관리자 저장에 실패했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleOpen}>
          관리자 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.id}</TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(admin)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(admin.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? '관리자 수정' : '관리자 추가'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="email"
              label="이메일"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              disabled={isEdit}
              required
            />
            <TextField
              margin="dense"
              name="password"
              label="비밀번호"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
            />
            <TextField
              margin="dense"
              name="name"
              label="이름"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>취소</Button>
            <Button type="submit" variant="contained">
              {isEdit ? '수정' : '추가'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminManagement; 