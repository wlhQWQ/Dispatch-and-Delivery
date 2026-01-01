import { useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Tracking from "./Tracking";

//模拟数据

// Helper to format date in local timezone
function formatLocalDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const mockOrders = [
  {
    id: "ORD-001",
    submitTime: "2025-01-15 08:30:00",
    status: "in transit",
    price: 45.99,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Wireless Headphones", quantity: 1 },
        { product: "Phone Case", quantity: 2 },
      ],
    },
    fromAddress: "Ferry Building, 1 Ferry Building, San Francisco, CA 94111",
    toAddress: "Golden Gate Bridge Welcome Center, San Francisco, CA 94129",
    fromLat: 37.7955,
    fromLng: -122.3937,
    toLat: 37.8199,
    toLng: -122.4783,
    pickupTime: formatLocalDateTime(new Date(Date.now() - 1 * 60 * 1000)),
    duration: 2,
    deliveryMethod: "Drone",
    encodedRoute:
      "i|teFva`jVsDbDuAnA_Az@aBxAgA`A_Ax@wDbD_@VHT\r@P^HXJ`Aj@|In@`JbBvXbA|OR`DHpA?j@d@~D\nF`@vH`@xEj@fKPfBp@dKJnBE`@NxBFz@LrBHNBV`@dGiBRuAPoBVgAPcCXoBVaFl@_CZcCS?Bb@BRLxBFx@PlCrB~ZxC~d@zD|l@A~@E^Mf@a@v@}@xAaBhC{CdFeCdEmBvCmDzDw@tAYv@Sx@O~@KfBC|A?|@J~Bf@zH\rEPvAVpBbBvI~@xE ZjBTrBJfC@tAGvBKxA[jC}@~GuBxPi@|C_@dBm@|Bk@fBgAvCo@rAgBbDq@`A}@lAwElFcBlAoAlA_@f@[h@q@hAe@r@}@~@g@^s@^w@Zi@NsALuEXkLp@aj@`DC?",
  },
  {
    id: "ORD-002",
    submitTime: "2025-12-29 21:00:00",
    status: "in transit",
    price: 32.5,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Laptop Accessories", quantity: 1 },
        { product: "USB Cable", quantity: 3 },
      ],
    },
    fromAddress: "Union Square, 333 Post St, San Francisco, CA 94108",
    toAddress:
      "Fisherman's Wharf, Beach St & The Embarcadero, San Francisco, CA 94133",
    fromLat: 37.788,
    fromLng: -122.4074,
    toLat: 37.808,
    toLng: -122.4177,
    pickupTime: "2025-12-30 21:00:00",
    duration: 50,
    deliveryMethod: "Robot",
    encodedRoute:
      "koseFjubjVg@DK_BG}@i@wH]_GCYUB}@LqANaCXaS`CePlBm@HcALa@n@cBnCa@n@iAjBs@lAOTQXeCdEW`@[LEH_@n@eC`E_DhFwDfGCRQZEFe@v@iDtF[f@g@d@wA|BqBfDq@hAY`@SD]D_@FiFl@cHx@Df@",
  },
  {
    id: "ORD-003",
    submitTime: "2025-01-16 10:20:00",
    status: "completed",
    price: 28.75,
    itemDetail: {
      weight: 1,
      items: [
        { product: "Books", quantity: 2 },
        { product: "Notebook", quantity: 1 },
      ],
    },
    fromAddress: "Chinatown Gate, Grant Ave & Bush St, San Francisco, CA 94108",
    toAddress:
      "Mission Dolores Park, 19th St & Dolores St, San Francisco, CA 94114",
    fromLat: 37.7909,
    fromLng: -122.4056,
    toLat: 37.7596,
    toLng: -122.4269,
    pickupTime: null,
    duration: 30,
    deliveryMethod: "Drone",
    encodedRoute: "",
  },
];

function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {}, [isTrackingOpen]);

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

    // const now = new Date();
    // const deliveryStartTime = new Date(order.deliveryStarts);
    // const deliveryEndTime = new Date(
    //   deliveryStartTime.getTime() + order.duration * 60000
    // ); // 订单结束时间

    if (order.status === "complete") {
      // 已经送到
      return {
        label: `complete ${deliveryEndTime.toLocaleDateString("en-US", {
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
    }
    // if (now < deliveryStartTime) {
    //   //预约pickup
    //   return {
    //     label: `Dispatch at ${deliveryStartTime.toLocaleTimeString("en-US", {
    //       hour: "numeric",
    //       minute: "2-digit",
    //       hour12: true,
    //     })}`,
    //     color: "bg-yellow-100 text-yellow-800",
    //     icon: Clock,
    //   };
    // }
    else {
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
        <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Track Order - {order.id}</DialogTitle>
            <DialogDescription>
              Real-time tracking of your delivery with live location updates.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center h-[65vh] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Tracking order={order} />
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
          variant="default"
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
