import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useDashboard } from "./AdminDashboard";
import { Button } from "./ui/button";

export function ShippingForm() {
  const navigate = useNavigate();
  const { handleSaveShippingData } = useDashboard();
  const [items, setItems] = useState([
    { id: 1, product: "", quantity: 1, weight: "" },
  ]);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [dimension, setDimension] = useState("");

  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      product: "",
      quantity: 1,
      weight: "",
    };
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
    const formData = {
      items,
      fromAddress,
      toAddress,
      dimension,
    };
    handleSaveShippingData(formData);
    navigate("/dashboard/delivery-options");
  };

  const handleCancel = () => {
    navigate("/dashboard/orders");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1>Create New Shipment</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Items to Ship</h2>
            <Button
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) =>
                        updateItem(item.id, "product", e.target.value)
                      }
                      placeholder="Enter product name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    onClick={() => removeItem(item.id)}
                    className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Package Dimensions */}
        <div>
          <label className="block text-gray-700 mb-1">
            Package Dimensions (L × W × H in cm)
          </label>
          <input
            type="text"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            placeholder="e.g., 30×20×15"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Addresses Section */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">From Address</label>
            <textarea
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Enter pickup address"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">To Address</label>
            <textarea
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Enter delivery address"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next: Choose Delivery Method
          </Button>
        </div>
      </div>
    </div>
  );
}
