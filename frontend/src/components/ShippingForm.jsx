import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Package,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { StepIndicator } from "./StepIndicator";

export function ShippingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state;

  // 状态管理
  const [items, setItems] = useState([{ id: 1, name: "", weight: "" }]);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  // 回填数据（如果用户点了返回）
  useEffect(() => {
    if (previousData) {
      setItems(previousData.rawItems || [{ id: 1, name: "", weight: "" }]);
      setFromAddress(previousData.from_address || "");
      setToAddress(previousData.to_address || "");
    }
  }, []);

  const addItem = () =>
    setItems([...items, { id: Date.now(), name: "", weight: "" }]);
  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));
  const updateItem = (id, field, val) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  };

  const handleNext = () => {
    if (!fromAddress || !toAddress) {
      alert("Please fill in addresses");
      return;
    }
    // 验证 items
    if (items.some((i) => !i.name || !i.weight)) {
      alert("Please fill in all item details");
      return;
    }

    // 传递数据给 DeliveryOptions
    // 注意：这里我们还没转成 description 字符串，把 raw data 传过去处理
    navigate("/dashboard/delivery-options", {
      state: {
        from_address: fromAddress,
        to_address: toAddress,
        rawItems: items,
      },
    });
  };

  const totalWeight = items.reduce(
    (sum, i) => sum + (parseFloat(i.weight) || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <StepIndicator currentStep={1} />

      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate("/dashboard/orders")}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create Shipment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" /> Locations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pickup Address (From)
                </label>
                <input
                  className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="e.g. 123 Library St"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Delivery Address (To)
                </label>
                <input
                  className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="e.g. Dormitory A"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Package className="text-blue-600" /> Items
              </h2>
              <Button
                onClick={addItem}
                variant="ghost"
                size="sm"
                className="text-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-3 mb-3 items-start">
                <span className="pt-3 text-xs font-bold text-gray-400">
                  #{idx + 1}
                </span>
                <input
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-black"
                  placeholder="Item Name (e.g. Book)"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                />
                <input
                  className="w-24 p-3 border rounded-lg focus:outline-none focus:border-black"
                  placeholder="kg"
                  type="number"
                  step="0.1"
                  value={item.weight}
                  onChange={(e) =>
                    updateItem(item.id, "weight", e.target.value)
                  }
                />
                {items.length > 1 && (
                  <Button
                    onClick={() => removeItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-red-400 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 text-sm text-gray-600 mb-6 border-t pt-4">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-medium text-black">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Weight</span>
                <span className="font-medium text-black">
                  {totalWeight.toFixed(2)} kg
                </span>
              </div>
            </div>
            <Button
              onClick={handleNext}
              className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg shadow-md"
            >
              Next Step <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
