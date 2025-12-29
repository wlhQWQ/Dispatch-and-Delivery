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
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

// --- 新增：统计卡片小组件 ---
function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

// 模拟数据 (保持不变)
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
    fromAddress: "321 Main St",
    toAddress: "123 Main St",
    deliveryMethod: "Robot",
    deliveryStarts: new Date("2024-12-17T17:00:00"),
    duration: 60,
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
    fromAddress: "321 Main St",
    toAddress: "123 Main St",
    deliveryMethod: "Robot",
    deliveryStarts: new Date("2024-12-17T17:00:00"),
    duration: 60,
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
    deliveryStarts: new Date(Date.now() - 2 * 60000),
    duration: 60,
  },
];

function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const getDeliveryStatus = () => {
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
    );

    if (order.status === "complete")
      return {
        label: `Delivered`,
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    if (now < deliveryStartTime) {
      return {
        label: `Dispatching Soon`,
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      };
    } else {
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors shadow-sm">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full p-4 flex items-center justify-between h-auto hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-gray-900 font-medium">{order.orderNumber}</div>
            <div className="text-gray-500 text-xs">{order.date}</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-gray-900 font-bold">
              ${order.price.toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs">
              {order.itemDetail.items.length} Items
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </Button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50/50">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Order Items
              </h3>
              <div className="space-y-2">
                {order.itemDetail.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-600 text-sm bg-white p-2 rounded border border-gray-100"
                  >
                    <span>{item.product}</span>
                    <span className="font-medium">× {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-1 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="text-gray-500 text-xs">From</h4>
                  <p className="text-gray-900 font-medium">
                    {order.fromAddress}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-1 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="text-gray-500 text-xs">To</h4>
                  <p className="text-gray-900 font-medium">{order.toAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 justify-end">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {statusInfo.label === "In Transit" && (
              <Button
                onClick={() => setIsTrackingOpen(true)}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                <Truck size={14} />
                Track Order
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Track Order - {order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Tracking Map View</p>
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
    <div className="max-w-7xl mx-auto pb-10">
      {/* 1. 顶部标题栏 */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your shipments and track deliveries.
          </p>
        </div>
        <Button
          onClick={handleNewOrder}
          className="px-6 py-2 flex items-center gap-2 bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Shipment
        </Button>
      </div>

      {/* 2. 统计数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Orders"
          value="12"
          icon={Package}
          color="bg-blue-500 text-blue-600"
        />
        <StatsCard
          title="In Transit"
          value="3"
          icon={Truck}
          color="bg-yellow-500 text-yellow-600"
        />
        <StatsCard
          title="Completed"
          value="1,248"
          icon={CheckCircle}
          color="bg-green-500 text-green-600"
        />
        <StatsCard
          title="Issues"
          value="1"
          icon={AlertCircle}
          color="bg-red-500 text-red-600"
        />
      </div>

      {/* 3. 筛选栏 (Mock) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant="secondary"
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          All Orders
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Active
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Completed
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Cancelled
        </Button>
      </div>

      {/* 4. 订单列表 */}
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
