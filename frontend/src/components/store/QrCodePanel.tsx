import React from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AddQrCodeModal from './AddQrCodeModal';
import { storeApi } from '../../api/store';

type QrItem = {
  id: number;
  table_number: number;
  image_url: string;
};

const QrCodePanel: React.FC<{ storeId: number }> = ({ storeId }) => {
  const [qrCodes, setQrCodes] = React.useState<QrItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const list = await storeApi.getQrCodes(storeId);
      setQrCodes(list);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'QR 코드 목록을 불러오지 못했습니다.';
      setErrorMessage(msg);
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQrCode = () => setIsAddModalOpen(true);

  const handleAddQrCodeSubmit = async (tableNumber: number) => {
    await storeApi.createQrCode(storeId, tableNumber);
    await fetchQrCodes();
  };

  const handleDeleteQrCode = async (id: number) => {
    await storeApi.deleteQrCode(id);
    await fetchQrCodes();
  };

  const handleDownloadQrCode = async (qr: QrItem) => {
    try {
      const res = await fetch(qr.image_url, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store_${storeId}_table_${qr.table_number}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // 폴백: 새 탭 열기
      const a = document.createElement('a');
      a.href = qr.image_url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  React.useEffect(() => { fetchQrCodes(); }, [storeId]);

  return (
    <>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">QR 코드 목록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddQrCode}>
          QR 코드 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>테이블 번호</TableCell>
              <TableCell>QR 코드</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}><CircularProgress size={20} /> 불러오는 중...</TableCell></TableRow>
            ) : qrCodes.length === 0 ? (
              <TableRow><TableCell colSpan={3}>등록된 QR 코드가 없습니다.</TableCell></TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>{qr.table_number}</TableCell>
                  <TableCell>
                    <img
                      src={qr.image_url}
                      alt={`QR ${qr.table_number}`}
                      style={{ width: 64, height: 64, objectFit: 'contain' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDownloadQrCode(qr)} color="primary">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteQrCode(qr.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddQrCodeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={storeId}
        onAdd={handleAddQrCodeSubmit}
      />
    </>
  );
};

export default QrCodePanel;
