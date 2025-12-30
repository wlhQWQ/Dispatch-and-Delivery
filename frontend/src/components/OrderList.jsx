import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { getOrders } from "../api/orderApi";

// --- Stats Card ---
function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
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

// --- Order Card (Adapted to new API) ---
function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Status mapping
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return {
          label: "Delivered",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "in_transit":
      default:
        return {
          label: "In Transit",
          color: "bg-blue-100 text-blue-800",
          icon: Truck,
        };
    }
  };

  const statusInfo = getStatusConfig(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors shadow-sm">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-4"
      >
        {/* Left: Icon & ID */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${statusInfo.color}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-900 font-bold text-lg">
              {order.order_id}
            </div>
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(order.pickup_time).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Right: Info & Status */}
        <div className="flex flex-1 justify-between sm:justify-end items-center gap-6 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <div className="text-gray-900 font-bold">
              ${Number(order.price).toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs">
              {order.robot_type} • {order.weight}kg
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.color}`}
          >
            {statusInfo.label}
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Package Contents
              </h3>
              <div className="bg-white p-3 rounded border border-gray-200 text-gray-700 text-sm leading-relaxed">
                {order.item_description}
              </div>
            </div>

            {/* Address & Route Info */}
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <h4 className="text-xs text-gray-400 uppercase">From</h4>
                  <p className="text-sm font-medium text-gray-900">
                    {order.from_address}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <div>
                  <h4 className="text-xs text-gray-400 uppercase">To</h4>
                  <p className="text-sm font-medium text-gray-900">
                    {order.to_address}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 pl-5">
                Est. Duration:{" "}
                <span className="font-medium text-gray-900">
                  {order.duration} mins
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            {/* Only show track button if not delivered */}
            {order.status !== "delivered" && (
              <Button
                onClick={() => setIsTrackingOpen(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Truck className="w-4 h-4 mr-2" /> Track Shipment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tracking Order: {order.order_id}</DialogTitle>
          </DialogHeader>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Map Visualization Component Here</p>
            {/* Note: Pass 'order.route' to your map component here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrderList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrders();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading)
    return (
      <div className="h-64 flex justify-center items-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your delivery status</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/new-order")}
          className="bg-black hover:bg-gray-800 text-white shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" /> New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Orders"
          value={orders.length}
          icon={Package}
          color="bg-blue-500"
        />
        <StatsCard
          title="In Transit"
          value={orders.filter((o) => o.status === "in_transit").length}
          icon={Truck}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Completed"
          value={orders.filter((o) => o.status === "delivered").length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatsCard
          title="Alerts"
          value="0"
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No active orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.order_id || Math.random()} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
