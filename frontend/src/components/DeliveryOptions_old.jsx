import {
  ArrowLeft,
  Truck,
  Plane,
  Ship,
  Clock,
  DollarSign,
  Check,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function DeliveryOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingData = location.state;
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Redirect to shipping form if no shipping data exists
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
      price: 1,
      description: "Cheap",
    },
    {
      id: "express",
      name: "Drone Delivery",
      icon: Plane,
      duration: "5-10 min",
      price: 2,
      description: "Fast",
    },
  ];

  // 点击确认，需要在这里发订单信息到后端，然后跳转到订单列表页面/支付
  const handleConfirm = () => {
    if (selectedMethod) {
      const method = deliveryMethods.find((m) => m.id === selectedMethod);
      const orderData = {
        ...shippingData,
        deliveryMethod: method,
      };
      console.log("Order confirmed:", orderData);
      // 跳转到订单列表页面/支付
      navigate("/dashboard/orders");
    }
  };

  const handleBack = () => {
    // Pass the data back so user doesn't lose their form input
    navigate("/dashboard/new-order", { state: shippingData });
  };

  // Don't render if no shipping data (will redirect via useEffect)
  if (!shippingData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1>Choose Delivery Method</h1>
      </div>

      {/* Shipment Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="text-gray-900 mb-3">Shipment Details</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-600">
          <div>
            <span className="block mb-1">From:</span>
            <p>{shippingData.fromAddress}</p>
          </div>
          <div>
            <span className="block mb-1">To:</span>
            <p>{shippingData.toAddress}</p>
          </div>
          <div>
            <span className="block">Items:</span>
            <p>{shippingData.items.length} item(s)</p>
          </div>
          <div>
            <span className="block">Total Weight:</span>
            <p>
              {/* 总重量 */}
              {shippingData.items
                .map((item) => Number(item.weight))
                .reduce((a, b) => a + b, 0)}
              kg
            </p>
          </div>
        </div>
      </div>

      {/* 选择运输方式 */}
      <div className="space-y-4 mb-6">
        {deliveryMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <div
              key={method.id}
              className={`w-full bg-white rounded-lg border-2 p-4 transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <Button
                  onClick={() => setSelectedMethod(method.id)}
                  variant="ghost"
                  className="flex gap-4 flex-1 text-left h-auto p-0 hover:bg-transparent"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{method.name}</h3>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {method.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />$
                        {method.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-500">{method.description}</p>
                  </div>
                </Button>
                {/* 查看地图, 未实现 */}
                <Button variant="outline" size="sm" className="ml-4">
                  View Map
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 确认/回退按钮 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">Selected delivery method:</span>
          <span className="text-gray-900">
            {selectedMethod
              ? deliveryMethods.find((m) => m.id === selectedMethod)?.name
              : "None selected"}
          </span>
        </div>
        {selectedMethod && (
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-900">Cost:</span>
            <span className="text-gray-900">
              $
              {deliveryMethods
                .find((m) => m.id === selectedMethod)
                ?.price.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button onClick={handleBack} variant="outline" className="px-6 py-2">
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className="px-6 py-2"
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
}
