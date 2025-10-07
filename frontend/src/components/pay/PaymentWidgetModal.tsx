import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;             // KRW 정수
  orderId: string;            // 고유 값(예: uuid)
  orderName: string;          // 주문명
  successUrl: string;
  failUrl: string;
  customerKey?: string;       // 회원은 고유키, 비회원은 'ANONYMOUS'
  variantKey?: string;        // (선택) 결제 UI 변형 키
  onPaid?: () => void;
};

const PaymentWidgetModal: React.FC<Props> = ({
  open, onClose, amount, orderId, orderName, successUrl, failUrl,
  customerKey = 'ANONYMOUS',
  variantKey,
  onPaid,
}) => {
  const widgetRef = React.useRef<any>(null);
  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY!;

  // 열릴 때 결제위젯 렌더링
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      const toss = await loadTossPayments(clientKey);
      const widgets = toss.widgets({ customerKey });
      widgetRef.current = widgets;

      await widgets.setAmount({ value: Math.round(amount), currency: 'KRW' });

      await widgets.renderPaymentMethods({
        selector: '#payment-method',
        // variantKey는 여러 UI를 만들었을 때만 필요. 없으면 생략 가능
        ...(variantKey ? { variantKey } : {})
      });

      await widgets.renderAgreement({
        selector: '#agreement',
        ...(variantKey ? { variantKey } : {})
      });
    })();

    return () => { cancelled = true; };
  }, [open, amount, clientKey, customerKey, variantKey]);

  const handlePay = async () => {
    const widget = widgetRef.current;
    if (!widget) return;
    // 결제 요청 (리다이렉트)
    await widget.requestPayment({
      orderId,
      orderName,
      successUrl,
      failUrl,
      // 필요 시 고객 정보 추가 가능
      // customerEmail, customerName, customerMobilePhone 등
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>결제하기</DialogTitle>
      <DialogContent dividers>
        {/* 결제수단 UI */}
        <Box id="payment-method" />
        {/* 약관 UI */}
        <Box id="agreement" sx={{ mt: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handlePay}>결제</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentWidgetModal;
