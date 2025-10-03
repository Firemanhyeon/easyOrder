import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';

interface AddQrCodeModalProps {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onAdd: (tableNumber: number) => Promise<void>;
}

const AddQrCodeModal: React.FC<AddQrCodeModalProps> = ({
  open,
  onClose,
  storeId,
  onAdd,
}) => {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tableNumber) {
      setError('테이블 번호를 입력해주세요.');
      return;
    }

    const number = parseInt(tableNumber);
    if (isNaN(number) || number <= 0) {
      setError('유효한 테이블 번호를 입력해주세요.');
      return;
    }

    try {
      await onAdd(number);
      handleClose();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || 'QR 코드 생성에 실패했습니다.';
      const detail = err.response?.data?.detail;
      const fullMessage = detail ? `${message} - ${detail}` : message;
      setError(fullMessage);
    }
  };

  const handleClose = () => {
    setTableNumber('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>QR 코드 추가</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="테이블 번호"
            type="number"
            fullWidth
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
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
  );
};

export default AddQrCodeModal; 