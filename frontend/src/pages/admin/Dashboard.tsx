import React, { JSX, useEffect, useMemo, useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container, Paper,
} from '@mui/material';
import {
  Menu as MenuIcon, Store as StoreIcon, People as PeopleIcon,
  Assessment as AssessmentIcon, Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AdminManagement from '../../components/admin/AdminManagement';
import StoreManagement from '../../components/admin/StoreManagement';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AdminDashboard: React.FC = () => {
  const { user } = useAuth(); // 로그인한 사용자 정보
  const isAdmin = user?.role === 'admin';
  // 사이드바 열림 상태 관리
  const [open, setOpen] = useState(true);
  // 사이드바 토글 함수
  const handleDrawerToggle = () => setOpen((v) => !v);
  // 현재 선택된 메뉴 상태 관리 - 기본값을 'stores'로 설정했음('store-owners'는 admin 전용이므로 점주로 로그인했을때 보이지 않아서 탭 없어짐)
  const [selectedMenu, setSelectedMenu] = useState<'stores' | 'store-owners' | 'analytics' | 'notifications' | 'settings'>('stores');
  
  // 메뉴 아이템 정의
  const menuItems = [
    { id: 'store-owners', text: '점주 관리', icon: <PeopleIcon /> }, // admin 전용
    { id: 'stores',       text: '매장 관리', icon: <StoreIcon /> },
    { id: 'analytics',    text: '통계/분석', icon: <AssessmentIcon /> },
    { id: 'notifications',text: '공지사항', icon: <NotificationsIcon /> },
    { id: 'settings',     text: '시스템 설정', icon: <SettingsIcon /> },
  ] as const;

  // 현재 사용자의 역할에 따라 보이는 메뉴 필터링
  const visibleMenuItems = useMemo(() => {
    if (isAdmin) return menuItems as unknown as { id: string; text: string; icon: JSX.Element }[];
    return menuItems.filter((m) => m.id !== 'store-owners');
  }, [isAdmin]);

  // selectedMenu이 현재 보이는 메뉴에 없으면 첫 번째 메뉴로 설정
  useEffect(() => {
    if (visibleMenuItems.length === 0) return;
    if (!visibleMenuItems.some((m) => m.id === selectedMenu)) {
      setSelectedMenu(visibleMenuItems[0].id as typeof selectedMenu);
    }
  }, [visibleMenuItems, selectedMenu]);

  // 선택된 메뉴에 따라 다른 컴포넌트 렌더링
  const renderContent = () => {
    switch (selectedMenu) {
      case 'store-owners':
        if (!isAdmin) return <Typography>권한이 없습니다.</Typography>; // 이중 가드
        return <AdminManagement />;
      case 'stores':
        return <StoreManagement />;
      case 'analytics':
        return <Typography>통계/분석 콘텐츠</Typography>;
      case 'notifications':
        return <Typography>공지사항 콘텐츠</Typography>;
      case 'settings':
        return <Typography>시스템 설정 콘텐츠</Typography>;
      default:
        return <Typography>선택된 메뉴가 없습니다.</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            EasyOrder 관리자
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth, flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar>
          <Box component="img" src="/logo.png" alt="EasyOrder" sx={{ height: 40, width: 'auto' }} />
        </Toolbar>
        <Divider />
        <List>
          {visibleMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selectedMenu === (item.id as typeof selectedMenu)}
                onClick={() => setSelectedMenu(item.id as typeof selectedMenu)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Main open={open}>
        <Toolbar />
        <Container maxWidth="lg">
          <Paper sx={{ p: 3 }}>{renderContent()}</Paper>
        </Container>
      </Main>
    </Box>
  );
};

export default AdminDashboard;
