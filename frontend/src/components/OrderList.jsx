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
  MapPin,
  XCircle,
  FileText, // Receipt icon
  Eye, // View Details icon
  Map, // Track icon
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
import { toast } from "sonner";
import {
  getOrders,
  getPaymentStatusFromURL,
  clearPaymentStatusFromURL,
} from "../api/orderApi"; // backend data

// --- Stats Card ---
// dashboard 顶部数据组件(In transit;dispatching;completed ;cancelled)
function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color} bg-opacity-10`}
      >
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}

// --- Order Card  ---
function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // 辅助函数：格式化具体时间 (YYYY-MM-DD HH:mm:ss)
  const formatFullTime = (dateStr) => {
    if (!dateStr) return "Time N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Status mapping
  // 读取backend 'status'
  // 需要backend五个状态：pending, dispatching, in transit, completed, cancelled
  const getDeliveryStatus = () => {
    // 1. Cancelled Status
    if (order.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        showTrack: false,
      };
    }

    // 2. Pending Status (等待处理)
    if (order.status === "pending" || order.status === "PENDING") {
      return {
        label: "Pending",
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Clock,
        showTrack: false,
      };
    }

    const now = new Date();
    const startTime = new Date(order.pickup_time);
    const endTime = new Date(
      startTime.getTime() + (order.duration || 0) * 60000
    );

    // 3. Delivered Status
    if (
      order.status === "completed" ||
      order.status === "complete" ||
      order.status === "delivered"
    ) {
      return {
        label: "Delivered",
        // 专门用于展开详情的完整时间
        fullDateText: `Delivered on ${formatFullTime(endTime)}`,
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        showTrack: false,
        isDelivered: true,
      };
    }

    // 4. Dispatching Status
    if (
      order.status === "dispatching" ||
      order.status === "DISPATCHING" ||
      now < startTime
    ) {
      return {
        label: "Dispatching",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        showTrack: true,
      };
    }

    // 5. In Transit (Default Status)
    return {
      label: "In Transit",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Truck,
      showTrack: true,
    };
  };

  const statusInfo = getDeliveryStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "border-black shadow-lg ring-1 ring-black/5"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* 头部区域 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors gap-4"
      >
        {/* Left: Icon & ID & Pickup Time */}
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-xl border shrink-0 ${statusInfo.color}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-gray-900 font-bold text-xl tracking-tight">
                {order.order_id}
              </span>
            </div>
            <div className="text-gray-600 text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              {order.status === "completed" || order.status === "in transit" ? (
                <span>Pickup: {formatFullTime(order.pickup_time)}</span>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        {/* Right: Info & Status Pill */}
        <div className="flex flex-1 justify-between sm:justify-end items-center gap-8 w-full sm:w-auto pl-16 sm:pl-0">
          <div className="text-left sm:text-right">
            <div className="text-gray-900 font-bold text-xl">
              ${Number(order.price).toFixed(2)}
            </div>
            <div className="text-gray-600 text-sm font-semibold">
              {order.duration} min • {order.weight} kg
            </div>
          </div>

          {/* 状态胶囊：颜色与上面 StatsCard 一致，Delivered 时间在这里显示 */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.color}`}
          >
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              {statusInfo.label}
            </span>
          </div>

          <div
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            } bg-gray-100 p-2 rounded-full hidden sm:block`}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-700" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Package Contents
              </h3>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800 font-medium text-sm leading-relaxed shadow-sm">
                {order.item_description}
              </div>
            </div>

            {/* Address & Route Info (Timeline UI) */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Route
              </h3>
              <div className="space-y-6 pl-2">
                {/* From */}
                <div className="flex gap-4 relative">
                  <div className="absolute left-[6px] top-6 bottom-[-20px] w-0.5 bg-gray-300"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-black ring-4 ring-white shadow-sm mt-1 shrink-0 z-10"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5 uppercase">
                      From
                    </p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {order.from_address}
                    </p>
                  </div>
                </div>
                {/* To */}
                <div className="flex gap-4 relative">
                  <div className="w-3.5 h-3.5 rounded-full border-[3px] border-black bg-white ring-4 ring-white shadow-sm mt-1 shrink-0 z-10"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5 uppercase">
                      To
                    </p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {order.to_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {/* 三个功能按键 */}
          <div className="mt-2 pt-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black font-semibold transition-all h-10 px-4"
              >
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black font-semibold transition-all h-10 px-4"
              >
                <Eye className="w-4 h-4 mr-2 text-gray-500" />
                View Details
              </Button>
            </div>

            {statusInfo.showTrack && (
              <Button
                onClick={() => setIsTrackingOpen(true)}
                className="bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl font-bold transition-all h-10 px-6 rounded-lg ml-auto"
              >
                Track Order
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden rounded-2xl gap-0">
          <DialogHeader className="p-6 border-b border-gray-100 bg-white">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-xl font-bold">Live Tracking</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm font-mono tracking-wide border border-gray-200">
                {order.order_id}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px] bg-gray-50 flex items-center justify-center">
            {/* <div className=" p-6 bg-white rounded-full shadow-sm flex flex-col items-center gap-3 border border-gray-100"></div> */}
            <Tracking order_id={order.order_id} robot_type={order.robot_type} />
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

  // connect backend
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
    fetchOrders(); // 第一次加载

    // 检查支付状态
    const paymentStatus = getPaymentStatusFromURL();
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your order has been placed.", {
        duration: 4000,
      });
      clearPaymentStatusFromURL();
    } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      toast.error("Payment failed. Please try again.", {
        duration: 4000,
      });
      clearPaymentStatusFromURL();
    }
  }, []);

  // 监听路由跳转，如果有 refresh 标志则重新加载
  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrders();
      // 清除 state，避免多次刷新
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 计算 Stats
  const stats = {
    total: orders.length,
    // Gray: Pending
    pending: orders.filter(
      (o) => o.status === "pending" || o.status === "PENDING"
    ).length,
    // Yellow: Dispatching
    dispatching: orders.filter((o) => {
      const startTime = new Date(o.pickup_time);
      const now = new Date();
      return (
        o.status === "dispatching" ||
        o.status === "DISPATCHING" ||
        now < startTime
      );
    }).length,
    // Blue: In Transit
    active: orders.filter((o) => o.status === "in transit").length,
    // Green: Completed
    completed: orders.filter(
      (o) =>
        o.status === "delivered" ||
        o.status === "complete" ||
        o.status === "completed"
    ).length,
    // Red: Cancelled
    issues: orders.filter((o) => o.status === "cancelled").length,
  };

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
      <div className="flex justify-between items-center mb-8 pt-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Orders
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Overview of your delivery status
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/new-order")}
          className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all rounded-full px-8 py-6 text-lg font-bold"
        >
          <Plus className="w-5 h-5 mr-2" /> New Order
        </Button>
      </div>

      {/* Stats Cards: 颜色与 OrderCard 状态一一对应 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-gray-500 text-gray-700" // 对应 Pending 状态色
        />
        <StatsCard
          title="Dispatching"
          value={stats.dispatching}
          icon={Clock}
          color="bg-yellow-500 text-yellow-700" // 对应 Dispatch 状态色
        />
        <StatsCard
          title="In Transit"
          value={stats.active}
          icon={Truck}
          color="bg-blue-500 text-blue-700" // 对应 In Transit 状态色
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="bg-green-500 text-green-700" // 对应 Delivered 状态色
        />
        <StatsCard
          title="Cancelled"
          value={stats.issues}
          icon={AlertCircle}
          color="bg-red-500 text-red-700" // 对应 Cancelled 状态色
        />
      </div>

      <div className="space-y-5">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold text-lg">
              No active orders found.
            </p>
            <p className="text-gray-500 font-medium mt-1">
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
