import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StripeMockPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // 模拟 2 秒的支付处理时间
    setTimeout(() => {
      // 支付成功，跳回 Admin 页面，并带上参数
      navigate('/admin?payment_status=success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
        {/* 假装是 Stripe 的 Logo */}
        <div className="text-blue-600 font-bold text-2xl mb-6 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded">S</div> Stripe <span className="text-gray-400 text-xs font-normal border px-1 rounded ml-2">TEST MODE</span>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-1">Total amount</p>
          <h2 className="text-4xl font-bold text-gray-800">$25.00</h2>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-3 border rounded bg-gray-50 text-sm text-gray-600">
            💳 **** **** **** 4242
          </div>
        </div>

        <button 
          onClick={handlePay}
          disabled={isProcessing}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Pay $25.00'}
        </button>

        <button 
          onClick={() => navigate('/admin')}
          className="w-full mt-4 text-gray-500 text-sm hover:underline"
        >
          Cancel and return
        </button>
      </div>
    </div>
  );
};

export default StripeMockPage;