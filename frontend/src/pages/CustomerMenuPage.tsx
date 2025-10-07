import React, { useEffect, useState, useRef } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Chip, CircularProgress,
  Alert, Container, Card, CardMedia, CardContent, CardActions, Button,
  Drawer, List, ListItem, ListItemText, ListItemSecondaryAction, Icon, Divider,
  Badge, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { menuApi } from '../api/menu';
import type { MenuItem as MenuItemType, MenuCategory } from '../types/menu';
import { v4 as uuidv4 } from 'uuid';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

type CatKey = 'all' | number;

type CartLine = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

const currency = (n: number) => `₩${Number(n).toLocaleString()}`;

const CustomerMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeId: storeIdParam } = useParams();
  const storeId = Number(storeIdParam);
  const [sp] = useSearchParams();
  const tableNumber = sp.get('table') ?? '';

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [items, setItems] = React.useState<MenuItemType[]>([]);
  const [selectedCat, setSelectedCat] = React.useState<CatKey>('all');

  // 장바구니
  const [cartOpen, setCartOpen] = React.useState(false);
  
  const [cart, setCart] = React.useState<Record<number, CartLine>>({}); // item.id -> line

  // 결제 다이얼로그 상태
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const paymentWidgetRef = useRef<any>(null);

  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY!;
  // 페이지 진입 로딩
  const fetchInitial = async () => {
    try {
      if (!storeId || !tableNumber) {
        setError('잘못된 접근입니다. QR을 다시 스캔해 주세요.');
        return;
      }
      setLoading(true);
      setError('');
      const [cats, its] = await Promise.all([
        menuApi.getCategorysByStoreId(storeId),
        menuApi.getMenuByStoreId(storeId),
      ]);
      setCategories(cats);
      setItems(its);
      setSelectedCat('all');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, tableNumber]);

  // 카테고리 전환(서버에서 정렬 반영된 목록 받음)
  const switchCategory = async (cat: CatKey) => {
    try {
      setLoading(true);
      setError('');
      if (cat === 'all') {
        const its = await menuApi.getMenuByStoreId(storeId);
        setItems(its);
      } else {
        const its = await menuApi.getMenuByCategory(storeId, Number(cat));
        setItems(its);
      }
      setSelectedCat(cat);
      // 전환 후 스크롤 상단
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 장바구니 조작
  const addToCart = (it: MenuItemType) => {
    setCart(prev => {
      const exist = prev[it.id];
      const qty = (exist?.qty ?? 0) + 1;
      return {
        ...prev,
        [it.id]: {
          id: it.id,
          name: it.name,
          price: Number(it.price || 0),
          qty,
        },
      };
    });
  };

  const inc = (id: number) =>
    setCart(prev => ({ ...prev, [id]: { ...prev[id], qty: prev[id].qty + 1 } }));
  const dec = (id: number) =>
    setCart(prev => {
      const line = prev[id];
      if (!line) return prev;
      const nextQty = line.qty - 1;
      if (nextQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...line, qty: nextQty } };
    });
  const removeLine = (id: number) => setCart(prev => {
    const { [id]: _, ...rest } = prev;
    return rest;
  });

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cartLines.reduce((s, l) => s + l.qty * l.price, 0);

  useEffect(() => {
    if (paymentOpen && !paymentWidgetRef.current) {
      handlePayment();
    }
  }, [paymentOpen]);
  
  // handleCheckout은 단순히 다이얼로그만 열도록 수정
  const handleCheckout = async () => {
    if (cartCount === 0) return;
    setPaymentOpen(true);
  }
  // 결제 실행
  const handlePayment = async () => {
    try {
      setPaymentOpen(true); // 다이얼로그 열기
      setPaymentLoading(true);

      // DOM 렌더링 완료를 기다림
      await new Promise(resolve => setTimeout(resolve, 300));
      // DOM 요소가 존재하는지 확인
      const paymentMethodsElement = document.getElementById('payment-methods');
      const agreementElement = document.getElementById('agreement');
      
      if (!paymentMethodsElement || !agreementElement) {
        console.error('결제 UI 요소를 찾을 수 없습니다.');
        return;
      }



      const customerKey = 'ANONYMOUS';
      const tosspayments = await loadTossPayments(clientKey);
      const widgets = tosspayments.widgets({
        customerKey,
        brandpay: {
          redirectUrl: 'https://tosspayments.com/auth',
        }
      });

      await widgets.setAmount({
        currency: 'KRW',
        value: cartTotal
      });
      // 결제 UI 렌더링
      const paymentMethodWidget = await widgets.renderPaymentMethods({
        selector: '#payment-methods',
        variantKey: "DEFAULT",
      });
        // 약관 UI 렌더링
      const agreementWidget = await widgets.renderAgreement({
        selector: '#agreement',
      });

      paymentWidgetRef.current = { widgets, paymentMethodWidget, agreementWidget };
      setPaymentLoading(false);
      console.log('토스페이먼츠 v2 결제 요청 완료');
      
    } catch (error) {
      console.error('결제 요청 실패:', error);
      setError('결제 요청에 실패했습니다.');
    }
  }
  

  const handleClosePayment = async () => {
    if (paymentWidgetRef.current) {
      const { paymentMethodWidget, agreementWidget } = paymentWidgetRef.current;
      
      // 위젯 destroy 호출
      try {
        if (paymentMethodWidget) {
          await paymentMethodWidget.destroy();
        }
        if (agreementWidget) {
          await agreementWidget.destroy();
        }
      } catch (error) {
        console.log('위젯 정리 중 오류:', error);
      }
      
      // DOM 요소 내용 비우기
      const paymentMethodsElement = document.getElementById('payment-methods');
      const agreementElement = document.getElementById('agreement');
      
      if (paymentMethodsElement) {
        paymentMethodsElement.innerHTML = '';
      }
      if (agreementElement) {
        agreementElement.innerHTML = '';
      }
      
      paymentWidgetRef.current = null;
    }
    
    setPaymentOpen(false);
    setPaymentLoading(false);
  }
    // 실제 결제 요청
  const handleRequestPayment = async () => {
    if (!paymentWidgetRef.current) return;
    
    try {
      const { widgets } = paymentWidgetRef.current;
      
      await widgets.requestPayment({
        orderId: uuidv4(),
        orderName: `${cartLines[0]?.name} 외 ${cartLines.length - 1}건`,
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
      });
      
    } catch (error) {
      console.error('결제 요청 실패:', error);
      setError('결제 요청에 실패했습니다.');
    }
  }

  //주문
  const handleOrder = async () => {
    
    const tableOrder = {
      storeId,
      tableNumber,
      items: cartLines.map(l => ({ id: l.id, qty: l.qty })),
      total: cartTotal,
    };
    console.log('주문 데이터:', tableOrder);
    const result = await menuApi.createOrder(storeId, tableNumber, cartLines.map(l => ({ id: l.id, qty: l.qty })) , cartTotal);

    if(result) {
      alert('주문이 완료되었습니다.');
      setCart({});
      setCartOpen(false);
    } else {
      alert('주문에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const safeBottom = 'max(env(safe-area-inset-bottom), 12px)';

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* 상단 앱바 */}
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">테이블</Typography>
            <Typography variant="h6">#{tableNumber}</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={() => setCartOpen(true)}>
            <Badge color="primary" badgeContent={cartCount} overlap="circular">
              <ShoppingBagIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 카테고리 가로 스크롤 */}
      <Box sx={{
        position: 'sticky', top: 48, zIndex: 1, bgcolor: 'background.paper',
        borderBottom: 1, borderColor: 'divider'
      }}>
        <Container maxWidth="sm" sx={{ py: 1, display: 'flex', gap: 1, overflowX: 'auto' }}>
          <Chip
            label="전체"
            color={selectedCat === 'all' ? 'primary' : 'default'}
            onClick={() => switchCategory('all')}
            clickable
          />
          {categories.map(c => (
            <Chip
              key={c.id}
              label={c.name}
              color={selectedCat === c.id ? 'primary' : 'default'}
              onClick={() => switchCategory(c.id)}
              clickable
            />
          ))}
        </Container>
      </Box>

      {/* 본문 */}
      <Container maxWidth="sm" sx={{ pt: 2, pb: 12 /* 하단 바 여유 */ }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            표시할 메뉴가 없습니다.
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {items.map(it => {
              const soldout = !it.is_available;
              return (
                <Card key={it.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  {it.image_url ? (
                    <CardMedia
                      component="img"
                      image={it.image_url}
                      alt={it.name}
                      sx={{ height: 160, objectFit: 'cover' }}
                    />
                  ) : null}
                  <CardContent sx={{ pb: 1.5 }}>
                    <Typography variant="subtitle1" noWrap>{it.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      mt: 0.5
                    }}>
                      {it.description || ''}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{currency(Number(it.price || 0))}</Typography>
                      {soldout && (
                        <Chip size="small" color="error" label="품절" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={soldout}
                      onClick={() => addToCart(it)}
                    >
                      {soldout ? '주문 불가' : '담기'}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>

      {/* 하단 고정 바 (장바구니 요약) */}
      <Box sx={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        bgcolor: 'background.paper',
        borderTop: 1, borderColor: 'divider',
        py: 1, pb: safeBottom,
      }}>
        <Container maxWidth="sm" sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShoppingBagIcon />}
            onClick={() => setCartOpen(true)}
          >
            장바구니 {cartCount > 0 ? `(${cartCount})` : ''}
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={cartCount === 0}
            onClick={handleCheckout}
          >
            {cartCount === 0 ? '주문하기' : `${currency(cartTotal)} 주문`}
          </Button>
        </Container>
      </Box>

      {/* 장바구니 드로어 */}
      <Drawer anchor="bottom" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: '100vw', maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">장바구니</Typography>
            <Typography variant="body2" color="text.secondary">테이블 #{tableNumber}</Typography>
          </Box>
          <Divider />
          {cartLines.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              담긴 메뉴가 없습니다.
            </Box>
          ) : (
            <>
              <List dense>
                {cartLines.map(line => (
                  <ListItem key={line.id}>
                    <ListItemText
                      primary={line.name}
                      secondary={currency(line.price)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => dec(line.id)}><RemoveIcon /></IconButton>
                      <Typography component="span" sx={{ mx: 1.5 }}>{line.qty}</Typography>
                      <IconButton edge="end" onClick={() => inc(line.id)}><AddIcon /></IconButton>
                      <IconButton edge="end" onClick={() => removeLine(line.id)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">합계</Typography>
                <Typography variant="h6">{currency(cartTotal)}</Typography>
              </Box>
              <Box sx={{ p: 2, pt: 0, pb: 'max(env(safe-area-inset-bottom), 12px)' }}>
                <Button fullWidth variant="contained" size="large" onClick={handleCheckout}>
                  결제/주문하기
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* 결제 모달 */}
      <Dialog 
        open={paymentOpen} 
        onClose={handleClosePayment}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { minHeight: '50vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">결제하기</Typography>
            <Typography variant="body2" color="text.secondary">
              테이블 #{tableNumber}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box>
            {/* 주문 요약 */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>주문 내역</Typography>
              {cartLines.map(line => (
                <Box key={line.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{line.name} x{line.qty}</Typography>
                  <Typography variant="body2">{currency(line.price * line.qty)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">총 결제금액</Typography>
                <Typography variant="h6" color="primary">{currency(cartTotal)}</Typography>
              </Box>
            </Box>
            <div id="payment-methods" style={{ marginBottom: '16px' }}></div>
            <div id="agreement" style={{ marginBottom: '16px' }}></div>
            {/* 결제 버튼 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setPaymentOpen(false)}
              >
                취소
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={paymentWidgetRef.current ? handleRequestPayment : handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? '로딩중...' : `${currency(cartTotal)} 결제하기`}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
            
    </Box>
  );
};

export default CustomerMenuPage;
