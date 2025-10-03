import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  TablePagination,
} from '@mui/material';
import { Store, getStores, createStore, deleteStore, CreateStoreData } from '../../api/store';
import StoreList from '../store/StoreList';
import { useAuth } from '../../contexts/AuthContext';

type CreateStoreForm = Omit<CreateStoreData, 'admin_id'>;

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState<CreateStoreForm>({
    name: '',
    address: '',
    phone: ''
  });
  const { user } = useAuth();

  const fetchStores = async () => {
    try {
      const response = await getStores(page + 1, rowsPerPage);
      setStores(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.message || '매장 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, rowsPerPage]);

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      name: '',
      address: '',
      phone: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      address: '',
      phone: '',
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 매장을 삭제하시겠습니까?')) {
      try {
        await deleteStore(id);
        fetchStores();
      } catch (err: any) {
        setError(err.response?.data?.message || '매장 삭제에 실패했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if(!user) {
      setError('사용자 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }
    try {
      const payload: CreateStoreData = {
        ...formData,
        admin_id: user.id,
      };
      await createStore(payload);
      handleClose();
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.message || '매장 생성에 실패했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          매장 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <StoreList
        stores={stores}
        onEdit={(store) => {
          // TODO: 매장 수정 기능 구현
          console.log('Edit store:', store);
        }}
        onDelete={handleDelete}
      />

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>매장 추가</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="name"
              label="매장 이름"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="address"
              label="주소"
              fullWidth
              value={formData.address}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="phone"
              label="전화번호"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>취소</Button>
            <Button type="submit" variant="contained">
              추가
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StoreManagement; 