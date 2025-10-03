import React, { useEffect, useState } from 'react';
import {Modal, Box, Typography, Button,  Paper, IconButton, Alert, Tabs, Tab} from '@mui/material';
import AddQrCodeModal from './AddQrCodeModal';
import { storeApi } from '../../api/store';
import { menuApi } from '../../api/menu';
import { MenuItem, MenuCategory } from '../../types/menu';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import QrCodePanel from './QrCodePanel';
import MenuManagementPanel from './MenuManagementPanel';
import StoreInfoPanel from '../store/StoreInfoPanel';

interface StoreDetailModalProps {
  open: boolean;
  onClose: () => void;
  store: {
    id: number;
    name: string;
    address: string;
    phone: string;
    admin: { name: string; email: string; };
  };
}

type QrItem = {
  id: number;
  table_number: number;
  image_url: string;
};

type TabKey = 'info' | 'menu' | 'qr';

const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ open, onClose, store }) => {
  const [tab, setTab] = useState<TabKey>('info');
  const [qrCodes, setQrCodes] = useState<QrItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleTabChange = (_: React.SyntheticEvent, value: TabKey) => setTab(value);
  const handleAddQrCode = () => setIsAddModalOpen(true);

  const handleGetQrCodes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const fetchedQrCodes = await storeApi.getQrCodes(store.id);
      setQrCodes(fetchedQrCodes);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'QR 코드 목록을 불러오지 못했습니다.';
      console.error(msg);
      setQrCodes([]);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQrCodeSubmit = async (tableNumber: number) => {
    try {
      await storeApi.createQrCode(store.id, tableNumber);
      await handleGetQrCodes();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'QR 코드 생성에 실패했습니다.';
      console.error(msg);
      throw error;
    }
  };

  const handleDeleteQrCode = async (id: number) => {
    try {
      await storeApi.deleteQrCode(id);
      await handleGetQrCodes();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'QR 코드 삭제에 실패했습니다.';
      console.error(msg);
      setErrorMessage(msg);
    }
  };

  // URL → Blob 저장 (파일명 포함)
  const handleDownloadQrCode = async (qr: QrItem) => {
    try {
      const res = await fetch(qr.image_url, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store_${store.id}_table_${qr.table_number}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
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

  // 모달이 열리고, QR 탭일 때만 목록 로드
  useEffect(() => {
    if (open && tab === 'qr') handleGetQrCodes();
  }, [open, tab, store.id]);

  // 모달 닫힐 때 탭 초기화(선택)
  useEffect(() => {
    if (!open) setTab('info');
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="store-detail-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 1000,
          height: { xs: '90vh', sm: '85vh' }, // ✅ 고정 높이
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          display: 'flex',              // ✅ 세로 레이아웃
          flexDirection: 'column',
          overflow: 'hidden',           // 가장 바깥은 숨기고…
        }}>
          {/* 헤더 */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h5" component="h2">매장 상세 정보</Typography>
          </Box>

          {/* 탭 */}
          <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="기본정보" value="info" />
            <Tab label="메뉴관리" value="menu" />
            <Tab label="QR 코드" value="qr" />
          </Tabs>

          {/* 콘텐츠 영역 */}
          <Box sx={{ p: 3, overflow: 'auto' }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            {tab === 'info' && <StoreInfoPanel store={store} />}

            {tab === 'menu' && <MenuManagementPanel storeId={store.id} />}

            {tab === 'qr' && <QrCodePanel storeId={store.id} />}
          </Box>
        </Box>
      </Modal>

      {/* QR 추가 모달 */}
      <AddQrCodeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={store.id}
        onAdd={handleAddQrCodeSubmit}
      />
    </>
  );
};

export default StoreDetailModal;
