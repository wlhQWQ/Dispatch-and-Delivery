import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// @ts-expect-error - orderApi.js is a JavaScript file without type declarations
import { createOrder } from "../api/orderApi";
import { toast } from "sonner";

const StripeMockPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // 从 location.state 获取订单数据和价格
  const orderData = location.state?.orderData;
  const price = location.state?.price || 25.0;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      // 模拟 2 秒的支付处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 支付成功后才提交订单到后端
      if (orderData) {
        await createOrder(orderData);
      }

      // 跳回订单页面，显示成功提示
      navigate("/dashboard/orders?payment_status=success", {
        state: { refresh: true },
      });
    } catch (error) {
      console.error("Payment or order creation failed:", error);
      toast.error("Failed to create order. Please try again.");
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
        {/* 假装是 Stripe 的 Logo */}
        <div className="text-blue-600 font-bold text-2xl mb-6 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded">S</div> Stripe{" "}
          <span className="text-gray-400 text-xs font-normal border px-1 rounded ml-2">
            TEST MODE
          </span>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-1">Total amount</p>
          <h2 className="text-4xl font-bold text-gray-800">
            ${price.toFixed(2)}
          </h2>
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
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {isProcessing ? "Processing..." : `Pay $${price.toFixed(2)}`}
        </button>

        <button
          onClick={() =>
            navigate("/dashboard/orders?payment_status=cancelled", {
              state: { refresh: false },
            })
          }
          disabled={isProcessing}
          className="w-full mt-4 text-gray-500 text-sm hover:underline disabled:opacity-50"
        >
          Cancel and return
        </button>
      </div>
    </div>
  );
};

export default StripeMockPage;
