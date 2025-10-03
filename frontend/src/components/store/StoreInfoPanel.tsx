import React from 'react';
import { Box, Typography } from '@mui/material';

type StoreInfo = {
  id: number;
  name: string;
  address: string;
  phone: string;
  admin: { name: string; email: string; };
};

const StoreInfoPanel: React.FC<{ store: StoreInfo }> = ({ store }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Typography variant="subtitle1">매장 번호</Typography>
          <Typography variant="body1">{store.id}</Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Typography variant="subtitle1">매장명</Typography>
          <Typography variant="body1">{store.name}</Typography>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1">주소</Typography>
          <Typography variant="body1">{store.address}</Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Typography variant="subtitle1">전화번호</Typography>
          <Typography variant="body1">{store.phone}</Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Typography variant="subtitle1">점주명</Typography>
          <Typography variant="body1">{store.admin.name}</Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
          <Typography variant="subtitle1">점주 이메일</Typography>
          <Typography variant="body1">{store.admin.email}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StoreInfoPanel;
