import {
  ArrowLeft,
  Truck,
  Plane,
  Clock,
  DollarSign,
  Check,
  Bot,
  Map,
  Loader2, // 引入 Loading 图标
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { StepIndicator } from "./StepIndicator";

// 引入你之前写的 API (如果没有 api 文件，这里会报错，可以先注释掉)
// import { createOrder } from "../api/orderApi";

export function DeliveryOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingData = location.state;
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!shippingData) {
      navigate("/dashboard/new-order");
    }
  }, [shippingData, navigate]);

  const deliveryMethods = [
    {
      id: "standard",
      name: "Robot Delivery",
      icon: Bot,
      duration: "30-50 min",
      price: 15.0,
      description:
        "Eco-friendly autonomous robot. Best for local ground delivery.",
      color: "blue",
    },
    {
      id: "express",
      name: "Drone Delivery",
      icon: Plane,
      duration: "5-10 min",
      price: 28.5,
      description: "High-speed aerial drone. Best for urgent small packages.",
      color: "purple",
    },
  ];

  const handleConfirm = async () => {
    if (!selectedMethod) return;

    setIsSubmitting(true);
    const method = deliveryMethods.find((m) => m.id === selectedMethod);
    const orderData = {
      ...shippingData,
      deliveryMethod: method.id,
      price: method.price,
      // estimatedTime: ...
    };

    console.log("Submitting Order:", orderData);

    // 模拟 API 调用延迟
    setTimeout(() => {
      setIsSubmitting(false);
      // 这里应该调用 API: await createOrder(orderData);
      alert("Order Successfully Created!");
      navigate("/dashboard/orders");
    }, 1500);
  };

  const handleBack = () => {
    navigate("/dashboard/new-order", { state: shippingData });
  };

  if (!shippingData) return null;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <StepIndicator currentStep={2} />

      <div className="mb-8 flex items-center gap-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <h1 className="text-2xl font-bold">Choose Delivery Method</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {deliveryMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`
                  relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200
                  ${
                    isSelected
                      ? "border-black bg-gray-50 ring-2 ring-black ring-offset-2 shadow-lg"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                  }
                `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-black text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-4 rounded-xl ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-gray-900">
                    ${method.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> {method.duration}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {method.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {method.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 底部确认栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-500">Total Estimated Cost</p>
          <p className="text-3xl font-bold text-gray-900">
            $
            {selectedMethod
              ? deliveryMethods
                  .find((m) => m.id === selectedMethod)
                  .price.toFixed(2)
              : "0.00"}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1 sm:flex-none py-6"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod || isSubmitting}
            className="flex-1 sm:flex-none py-6 px-8 bg-black hover:bg-gray-800 text-white shadow-md text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing
              </>
            ) : (
              "Confirm & Pay"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
