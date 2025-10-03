import React from 'react';
import { useNavigate } from 'react-router-dom';

const QRScanPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">메뉴 확인</h1>
      
      <div className="max-w-md mx-auto">
        <p className="text-center text-gray-600 mb-6">
          메뉴를 확인하려면 아래 버튼을 클릭하세요
        </p>
        <button
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          onClick={() => navigate('/menu/QR_STORE_002')}
        >
          메뉴 보기
        </button>
      </div>
    </div>
  );
};

export default QRScanPage; 