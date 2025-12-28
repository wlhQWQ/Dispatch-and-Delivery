import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, MapPin, Package } from "lucide-react";
import { Button } from "./ui/button";
import { StepIndicator } from "./StepIndicator"; // 引入新组件

export function ShippingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state;

  const [items, setItems] = useState([{ id: 1, product: "", weight: "" }]);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  useEffect(() => {
    if (previousData) {
      setItems(previousData.items || [{ id: 1, product: "", weight: "" }]);
      setFromAddress(previousData.fromAddress || "");
      setToAddress(previousData.toAddress || "");
    }
  }, []);

  const addItem = () => {
    const newItem = { id: items.length + 1, product: "", weight: "" };
    setItems([...items, newItem]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleNext = () => {
    if (!fromAddress || !toAddress) {
      alert("Please fill in addresses");
      return;
    }
    const formData = { items, fromAddress, toAddress };
    navigate("/dashboard/delivery-options", { state: formData });
  };

  const handleCancel = () => {
    navigate("/dashboard/orders");
  };

  // 计算总重
  const totalWeight = items.reduce(
    (sum, item) => sum + (parseFloat(item.weight) || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <StepIndicator currentStep={1} />

      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Shipment
          </h1>
          <p className="text-gray-500 text-sm">
            Fill in the details below to schedule a pickup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- 左侧主要表单区域 (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Addresses */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                1
              </div>
              Locations
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Pickup Address
                  (From)
                </label>
                <input
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="e.g. 123 Sender St, New York, NY"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" /> Delivery Address
                  (To)
                </label>
                <input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="e.g. 456 Receiver Ave, San Francisco, CA"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                Package Details
              </h2>
              <Button
                onClick={addItem}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors"
                >
                  <span className="mt-3 text-xs font-bold text-gray-400 bg-gray-200 w-6 h-6 flex items-center justify-center rounded-full">
                    #{index + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={item.product}
                        onChange={(e) =>
                          updateItem(item.id, "product", e.target.value)
                        }
                        placeholder="Item name"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.weight}
                        onChange={(e) =>
                          updateItem(item.id, "weight", e.target.value)
                        }
                        placeholder="0.0"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-7 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- 右侧 Summary 区域 (1/3) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white p-6 rounded-xl border border-gray-200 shadow-lg shadow-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Summary
            </h3>
            <div className="space-y-4 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Items</span>
                <span className="font-medium text-gray-900">
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Total Weight</span>
                <span className="font-medium text-gray-900">
                  {totalWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-400 mb-2">
                  Next step: Choose delivery method
                </p>
                <Button
                  onClick={handleNext}
                  className="w-full py-6 text-base font-medium bg-black hover:bg-gray-800 text-white shadow-md"
                >
                  Continue
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="w-full mt-2 text-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
