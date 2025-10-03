import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StoreDetailModal from './StoreDetailModal';

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  admin: {
    name: string;
    email: string;
  };
  qr_codes: {
    id: number;
    table_number: number;
    qr_code: string;
  }[];
}

interface StoreListProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (id: number) => void;
}

const StoreList: React.FC<StoreListProps> = ({ stores, onEdit, onDelete }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleRowClick = (store: Store) => {
    setSelectedStore(store);
  };

  const handleCloseModal = () => {
    setSelectedStore(null);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>매장 번호</TableCell>
              <TableCell>매장명</TableCell>
              <TableCell>주소</TableCell>
              <TableCell>전화번호</TableCell>
              <TableCell>점주명</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow
                key={store.id}
                onClick={() => handleRowClick(store)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell>{store.id}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{store.phone}</TableCell>
                <TableCell>{store.admin.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(store);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(store.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedStore && (
        <StoreDetailModal
          open={!!selectedStore}
          onClose={handleCloseModal}
          store={selectedStore}
        />
      )}
    </Box>
  );
};

export default StoreList; 