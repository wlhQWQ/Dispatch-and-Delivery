import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, Plane, Check, Loader2, ArrowLeft, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { StepIndicator } from "./StepIndicator";
import { createOrder } from "../api/orderApi";

export function DeliveryOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingData = location.state;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shippingData) navigate("/dashboard/new-order");
  }, [shippingData, navigate]);

  const deliveryMethods = [
    {
      id: "robot",
      name: "Autonomous Robot",
      price: 15.0,
      duration: 45, // int
      icon: Bot,
      desc: "Best for ground delivery.",
    },
    {
      id: "drone",
      name: "Flying Drone",
      price: 25.0,
      duration: 15, // int
      icon: Plane,
      desc: "Fastest aerial delivery.",
    },
  ];

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setLoading(true);

    try {
      const method = deliveryMethods.find((m) => m.id === selectedMethod);
      const rawItems = shippingData.rawItems || [];

      // 1. 数据转换：Array -> String Description
      const descriptionString = rawItems
        .map((item) => `${item.name}`)
        .join(", ");

      // 2. 数据转换：Total Weight
      const totalWeight = rawItems.reduce(
        (sum, item) => sum + (parseFloat(item.weight) || 0),
        0
      );

      // 3. 组装 API Payload (严格遵守 Snake Case)
      const payload = {
        from_address: shippingData.from_address,
        to_address: shippingData.to_address,
        duration: method.duration, // int
        price: method.price, // float
        item_description: descriptionString, // string
        weight: totalWeight, // float
      };

      console.log("Submitting Payload:", payload);

      // 4. 发送
      const result = await createOrder(payload);

      if (result.success) {
        navigate("/dashboard/orders", { state: { refresh: true } });
      } else {
        alert("Server returned failure.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit order.");
    } finally {
      setLoading(false);
    }
  };

  if (!shippingData) return null;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <StepIndicator currentStep={2} />

      <div className="flex items-center gap-4 mb-6 mt-4">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Select Delivery Method</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {deliveryMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-black bg-gray-50 ring-1 ring-black"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-black text-white rounded-full p-1">
                  <Check size={14} />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon size={24} />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${method.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                    <Clock size={12} /> {method.duration} min
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-lg">{method.name}</h3>
              <p className="text-sm text-gray-500">{method.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Estimated Total</p>
          <p className="text-3xl font-bold">
            $
            {selectedMethod
              ? deliveryMethods
                  .find((m) => m.id === selectedMethod)
                  .price.toFixed(2)
              : "0.00"}
          </p>
        </div>
        <Button
          onClick={handleConfirm}
          disabled={!selectedMethod || loading}
          className="bg-black text-white hover:bg-gray-800 py-6 px-10 text-lg shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Processing
            </>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>
    </div>
  );
}
