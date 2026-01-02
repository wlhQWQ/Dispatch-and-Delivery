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
  Calendar,
  FileText,
  Map,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { getOrders } from "../api/orderApi";

// --- Stats Card Component (UI Polish) ---
function StatsCard({ title, value, icon: Icon, colorClass, bgClass }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
      {/* 修复图标显示：使用固定宽高的容器 + Flex 居中，防止图标被切 */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}

// --- Order Card Component (Logic & UI Overhaul) ---
function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // 1. 核心状态逻辑优化
  const getDeliveryStatus = () => {
    // A. Cancelled
    if (order.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-50 text-red-700 border-red-100",
        icon: XCircle,
        canTrack: false,
      };
    }

    // B. Delivered
    if (order.status === "delivered" || order.status === "completed") {
      return {
        label: "Delivered",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: CheckCircle,
        canTrack: false,
      };
    }

    // 时间计算
    const now = new Date();
    const startTime = new Date(order.start_time);

    // C. Dispatch at [Time] (Scheduled future)
    if (startTime > now) {
      const timeStr = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        label: `Dispatch at ${timeStr}`,
        color: "bg-yellow-50 text-yellow-700 border-yellow-100",
        icon: Clock,
        canTrack: false,
      };
    }

    // D. In Transit (Default active state)
    return {
      label: "In Transit",
      color: "bg-blue-50 text-blue-700 border-blue-100",
      icon: Truck,
      canTrack: true,
    };
  };

  const statusInfo = getDeliveryStatus();
  const StatusIcon = statusInfo.icon;

  // 计算送达时间 (用于 Delivered 状态)
  const getActualDeliveryTime = () => {
    if (!order.start_time) return "N/A";
    const start = new Date(order.start_time);
    const end = new Date(start.getTime() + (order.duration || 0) * 60000);
    return end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-black shadow-md"
          : "border-gray-200 hover:border-gray-300 shadow-sm"
      }`}
    >
      {/* --- Main Row Summary --- */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer gap-4 group"
      >
        <div className="flex items-center gap-4">
          {/* Status Icon Box */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${statusInfo.color}`}
          >
            <StatusIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-900 font-bold text-lg tracking-tight">
                {order.order_id}
              </span>
              {/* Status Pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <div className="text-gray-500 text-sm flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {order.start_time
                ? new Date(order.start_time).toLocaleDateString()
                : "Date N/A"}
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-between sm:justify-end items-center gap-8 w-full sm:w-auto pl-16 sm:pl-0">
          <div className="text-left sm:text-right">
            <div className="text-gray-900 font-bold text-lg">
              ${Number(order.price).toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs font-medium">
              {order.duration} min • {order.weight} kg
            </div>
          </div>

          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-black" />
          </div>
        </div>
      </div>

      {/* --- Expanded Details Section --- */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Left: Package Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Package Details
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed shadow-sm">
                  {order.item_description}
                </div>
              </div>

              {/* 3. 新增：Delivered 状态显示实际送达时间 */}
              {statusInfo.label === "Delivered" && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Actual Delivery: {getActualDeliveryTime()}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Route Info */}
            <div className="space-y-6">
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-black border-2 border-white ring-1 ring-gray-200" />
                  <h4 className="text-xs text-gray-400 uppercase font-semibold mb-1">
                    From
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {order.from_address}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white ring-1 ring-gray-200" />
                  <h4 className="text-xs text-gray-400 uppercase font-semibold mb-1">
                    To
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {order.to_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 新增：底部功能按钮栏 (Details, Receipt, Track) */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-white hover:text-black"
            >
              <FileText className="w-4 h-4 mr-2" /> Receipt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-white hover:text-black"
            >
              View Details
            </Button>

            {statusInfo.canTrack && (
              <Button
                onClick={() => setIsTrackingOpen(true)}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 shadow-md"
              >
                <Map className="w-4 h-4 mr-2" /> Track Order
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <span>Tracking Order</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-mono">
                {order.order_id}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2">
            <div className="bg-gray-100 h-96 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Map className="w-10 h-10 opacity-20" />
              <p className="font-medium">Map Visualization Loading...</p>
            </div>
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

  // 状态计算 (for Stats Cards)
  const stats = {
    total: orders.length,
    active: orders.filter(
      (o) =>
        o.status === "in_transit" ||
        (o.status !== "cancelled" && o.status !== "delivered")
    ).length,
    completed: orders.filter(
      (o) => o.status === "delivered" || o.status === "completed"
    ).length,
    issues: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading)
    return (
      <div className="h-96 flex justify-center items-center">
        <Loader2 className="animate-spin w-8 h-8 text-black" />
      </div>
    );
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Orders
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and track your delivery shipments.
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/new-order")}
          className="bg-black hover:bg-gray-800 text-white shadow-lg rounded-full px-6 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> New Shipment
        </Button>
      </div>

      {/* Stats Cards - Updated with Amazon/Uber style cleanliness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          bgClass="bg-blue-50"
          colorClass="text-blue-600"
        />
        <StatsCard
          title="Active / In-Transit"
          value={stats.active}
          icon={Truck}
          bgClass="bg-yellow-50"
          colorClass="text-yellow-600"
        />
        <StatsCard
          title="Delivered"
          value={stats.completed}
          icon={CheckCircle}
          bgClass="bg-green-50"
          colorClass="text-green-600"
        />
        <StatsCard
          title="Cancelled / Issues"
          value={stats.issues}
          icon={AlertCircle}
          bgClass="bg-red-50"
          colorClass="text-red-600"
        />
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No orders found
            </h3>
            <p className="text-gray-500 mt-1">
              Get started by creating your first shipment.
            </p>
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
