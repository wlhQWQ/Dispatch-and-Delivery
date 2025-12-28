import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

//模拟数据
const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "2024-12-15",
    status: "complete",
    price: 299.99,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Wireless Headphones", quantity: 1 },
        { product: "Phone Case", quantity: 2 },
      ],
    },
    FromAddress: "321 Main St",
    shippingAddress: "123 Main St",
    deliveryMethod: "Robot",
    deliveryStarts: new Date("2024-12-17T17:00:00"), // ISO date format
    duration: 60, // delivery duration in minutes
  },
  {
    id: "2",
    orderNumber: "ORD-2024-001",
    date: "2024-12-15",
    status: "cancelled",
    price: 299.99,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Wireless Headphones", quantity: 1 },
        { product: "Phone Case", quantity: 2 },
      ],
    },
    FromAddress: "321 Main St",
    shippingAddress: "123 Main St",
    deliveryMethod: "Robot",
    deliveryStarts: new Date("2024-12-17T17:00:00"), // ISO date format
    duration: 60, // delivery duration in minutes
  },
  {
    id: "3",
    orderNumber: "ORD-2024-002",
    date: "2024-12-14",
    status: "in transit",
    price: 549.5,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Wireless Headphones", quantity: 3 },
        { product: "Phone Case", quantity: 2 },
      ],
    },
    fromAddress: "321 Main St",
    toAddress: "123 Main St",
    deliveryMethod: "Drone",
    //模拟的in transit数据，2分钟前开始派送
    deliveryStarts: new Date(Date.now() - 2 * 60000), // Started 2 minutes ago
    duration: 60, // delivery duration in minutes (1 hour to ensure it stays in transit)
  },
];

function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // 根据派送时间计算订单状态
  const getDeliveryStatus = () => {
    // If cancelled, return null to hide the order
    if (order.status === "cancelled") {
      return {
        label: `Cancelled`,
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    }

    const now = new Date();
    const deliveryStartTime = new Date(order.deliveryStarts);
    const deliveryEndTime = new Date(
      deliveryStartTime.getTime() + order.duration * 60000
    ); // 订单结束时间

    if (order.status === "complete")
      // 已经送到
      return {
        label: `Delivered ${deliveryEndTime.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}, ${deliveryEndTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    if (now < deliveryStartTime) {
      //预约pickup
      return {
        label: `Dispatch at ${deliveryStartTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      };
    } else {
      // In transit
      return {
        label: "In Transit",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      };
    }
  };

  const statusInfo = getDeliveryStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full p-4 flex items-center justify-between h-auto"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-gray-900">{order.orderNumber}</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-gray-900">${order.price.toFixed(2)}</div>
            <div className="text-gray-500">{order.date}</div>
          </div>
          <div className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </Button>

      {/* Order Details (Expanded) */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4 grid grid-cols-2 gap-6">
            {/* Items */}
            <div>
              <h3 className="text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.itemDetail.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.product} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <h4 className="text-gray-900 mb-1">From:</h4>
                <p className="text-gray-600">{order.fromAddress}</p>
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">To:</h4>
                <p className="text-gray-600">{order.toAddress}</p>
              </div>
              <div>
                <h4 className="text-gray-900 mb-1"></h4>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
            <Button className="px-4 py-2">View Details</Button>
            <Button variant="outline" className="px-4 py-2">
              Receipt
            </Button>

            {statusInfo.label === "In Transit" && (
              <Button
                onClick={() => setIsTrackingOpen(true)}
                className="ml-auto px-4 py-2 bg-black hover:bg-gray-900 flex items-center gap-2"
              >
                <Truck size={16} className="text-white" />
                Track Order
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tracking弹窗 */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Track Order - {order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            {/* Tracking view placeholder - to be implemented */}
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                Tracking view will be implemented here
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrderList() {
  const navigate = useNavigate();

  const handleNewOrder = () => {
    navigate("/dashboard/new-order");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1>Orders</h1>
        <Button
          onClick={handleNewOrder}
          className="px-4 py-2 flex items-center gap-2"
          variant = "default"
        >
          <Plus className="w-5 h-5" />
          New Order
        </Button>
      </div>
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
