// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   ChevronDown,
//   ChevronUp,
//   Package,
//   Clock,
//   CheckCircle,
//   Truck,
//   Plus,
//   AlertCircle,
//   Loader2,
//   MapPin,
//   Calendar,
// } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { getOrders } from "../api/orderApi"; // backend data

// // --- Stats Card ---
// // dashboard 顶部数据组件(Total orders;In transit;completed ;alerts)
// function StatsCard({ title, value, icon: Icon, color }) {
//   return (
//     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
//       <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
//         <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
//       </div>
//       <div>
//         <p className="text-sm text-gray-500 font-medium">{title}</p>
//         <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
//       </div>
//     </div>
//   );
// }

// // 模拟数据 样式
// // const mockOrders = [
// //   {
// //     id: "1",
// //     orderNumber: "ORD-2024-001",
// //     date: "2024-12-15",
// //     status: "complete",
// //     price: 299.99,
// //     itemDetail: {
// //       weight: 1,
// //       items: [
// //         { product: "Wireless Headphones", quantity: 1 },
// //         { product: "Phone Case", quantity: 2 },
// //       ],
// //     },
// //     FromAddress: "321 Main St",
// //     shippingAddress: "123 Main St",
// //     deliveryMethod: "Robot",
// //     deliveryStarts: new Date("2024-12-17T17:00:00"), // ISO date format
// //     duration: 60, // delivery duration in minutes
// //   },
// //   {
// //     id: "2",
// //     orderNumber: "ORD-2024-001",
// //     date: "2024-12-15",
// //     status: "cancelled",
// //     price: 299.99,
// //     itemDetail: {
// //       weight: 1,
// //       items: [
// //         { product: "Wireless Headphones", quantity: 1 },
// //         { product: "Phone Case", quantity: 2 },
// //       ],
// //     },
// //     FromAddress: "321 Main St",
// //     shippingAddress: "123 Main St",
// //     deliveryMethod: "Robot",
// //     deliveryStarts: new Date("2024-12-17T17:00:00"), // ISO date format
// //     duration: 60, // delivery duration in minutes
// //   },
// //   {
// //     id: "3",
// //     orderNumber: "ORD-2024-002",
// //     date: "2024-12-14",
// //     status: "in transit",
// //     price: 549.5,
// //     itemDetail: {
// //       weight: 1,
// //       items: [
// //         { product: "Wireless Headphones", quantity: 3 },
// //         { product: "Phone Case", quantity: 2 },
// //       ],
// //     },
// //     fromAddress: "321 Main St",
// //     toAddress: "123 Main St",
// //     deliveryMethod: "Drone",
// //     //模拟的in transit数据，2分钟前开始派送
// //     deliveryStarts: new Date(Date.now() - 2 * 60000), // Started 2 minutes ago
// //     duration: 60, // delivery duration in minutes (1 hour to ensure it stays in transit)
// //   },
// // ];

// // --- Order Card (Adapted to new API) ---
// function OrderCard({ order }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isTrackingOpen, setIsTrackingOpen] = useState(false);

//   // Status mapping
//   // 读取backend ‘status’

//   const getStatusConfig = (status) => {
//     switch (status?.toLowerCase()) {
//       case "delivered":
//         return {
//           label: "Delivered",
//           color: "bg-green-100 text-green-800",
//           icon: CheckCircle,
//         };
//       case "dispatching":
//         return {
//           label: "Dispatching",
//           color: "bg-yellow-100 text-yellow-800",
//           icon: Clock,
//         };
//       case "in transit":
//       default:
//         return {
//           label: "In Transit",
//           color: "bg-blue-100 text-blue-800",
//           icon: Truck,
//         };
//     }
//   };

//   const statusInfo = getStatusConfig(order.status);
//   const StatusIcon = statusInfo.icon;

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors shadow-sm">
//       <div
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="w-full p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-4"
//       >
//         {/* Left: Icon & ID */}
//         <div className="flex items-center gap-4">
//           <div className={`p-3 rounded-xl ${statusInfo.color}`}>
//             <StatusIcon className="w-6 h-6" />
//           </div>
//           <div>
//             <div className="text-gray-900 font-bold text-lg">
//               {order.order_id}
//             </div>
//             <div className="text-gray-500 text-xs flex items-center gap-1">
//               <Calendar className="w-3 h-3" />
//               {new Date(order.pickup_time).toLocaleDateString()}
//             </div>
//           </div>
//         </div>

//         {/* Right: Info & Status */}
//         <div className="flex flex-1 justify-between sm:justify-end items-center gap-6 w-full sm:w-auto">
//           <div className="text-left sm:text-right">
//             <div className="text-gray-900 font-bold">
//               ${Number(order.price).toFixed(2)}
//             </div>
//             <div className="text-gray-500 text-xs">
//               {order.robot_type} • {order.weight}kg
//             </div>
//           </div>

//           <div
//             className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.color}`}
//           >
//             {statusInfo.label}
//           </div>

//           {isExpanded ? (
//             <ChevronUp className="w-5 h-5 text-gray-400" />
//           ) : (
//             <ChevronDown className="w-5 h-5 text-gray-400" />
//           )}
//         </div>
//       </div>

//       {/* Expanded Details */}
//       {isExpanded && (
//         <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
//           <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Description */}
//             <div>
//               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
//                 Package Contents
//               </h3>
//               <div className="bg-white p-3 rounded border border-gray-200 text-gray-700 text-sm leading-relaxed">
//                 {order.item_description}
//               </div>
//             </div>

//             {/* Address & Route Info */}
//             <div className="space-y-4">
//               <div className="flex gap-3 items-start">
//                 <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
//                 <div>
//                   <h4 className="text-xs text-gray-400 uppercase">From</h4>
//                   <p className="text-sm font-medium text-gray-900">
//                     {order.from_address}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-3 items-start">
//                 <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
//                 <div>
//                   <h4 className="text-xs text-gray-400 uppercase">To</h4>
//                   <p className="text-sm font-medium text-gray-900">
//                     {order.to_address}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-500 pl-5">
//                 Est. Duration:{" "}
//                 <span className="font-medium text-gray-900">
//                   {order.duration} mins
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             {/* Only show track button if not delivered */}
//             {order.status !== "delivered" && (
//               <Button
//                 onClick={() => setIsTrackingOpen(true)}
//                 className="bg-black text-white hover:bg-gray-800"
//               >
//                 <Truck className="w-4 h-4 mr-2" /> Track Shipment
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Tracking Modal */}
//       <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader>
//             <DialogTitle>Tracking Order: {order.order_id}</DialogTitle>
//           </DialogHeader>
//           <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
//             <p className="text-gray-500">Map Visualization Component Here</p>
//             {/* Note: Pass 'order.route' to your map component here */}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export function OrderList() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // connect backend
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const data = await getOrders();
//       setOrders(data || []);
//       setError(null);
//     } catch (err) {
//       setError("Failed to load orders.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);
//   useEffect(() => {
//     if (location.state?.refresh) {
//       fetchOrders();
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state]);

//   if (loading)
//     return (
//       <div className="h-64 flex justify-center items-center">
//         <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
//       </div>
//     );
//   if (error)
//     return <div className="text-center py-10 text-red-500">{error}</div>;

//   return (
//     <div className="max-w-6xl mx-auto pb-10">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
//           <p className="text-gray-500">Overview of your delivery status</p>
//         </div>
//         <Button
//           onClick={() => navigate("/dashboard/new-order")}
//           className="bg-black hover:bg-gray-800 text-white shadow-lg"
//         >
//           <Plus className="w-5 h-5 mr-2" /> New Order
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <StatsCard
//           title="Total Orders"
//           value={orders.length}
//           icon={Package}
//           color="bg-blue-500"
//         />
//         <StatsCard
//           title="In Transit"
//           value={orders.filter((o) => o.status === "in transit").length}
//           icon={Truck}
//           color="bg-yellow-500"
//         />
//         <StatsCard
//           title="Completed"
//           value={orders.filter((o) => o.status === "delivered").length}
//           icon={CheckCircle}
//           color="bg-green-500"
//         />
//         <StatsCard
//           title="Cancelled"
//           value="0"
//           icon={AlertCircle}
//           color="bg-red-500"
//         />
//       </div>

//       <div className="space-y-4">
//         {orders.length === 0 ? (
//           <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
//             <p className="text-gray-500">No active orders found.</p>
//           </div>
//         ) : (
//           orders.map((order) => (
//             <OrderCard key={order.order_id || Math.random()} order={order} />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

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
import { getOrders } from "../api/orderApi"; // backend data

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
  // 读取backend ‘status’
  // 需要backend四个状态：
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

    const now = new Date();
    const startTime = new Date(order.pickup_time);
    const endTime = new Date(
      startTime.getTime() + (order.duration || 0) * 60000
    );

    // 2. Delivered Status
    if (order.status === "completed") {
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

    // 3. Dispatch at (Future Status)
    if (now < startTime || order.status == "dispatching") {
      return {
        label: "Dispatching",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        showTrack: false,
      };
    }

    // 4. In Transit (Default Status)
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
            <div className="p-6 bg-white rounded-full shadow-sm flex flex-col items-center gap-3 border border-gray-100">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
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

    // // 设置定时器，每 5 秒自动刷新一次数据
    // const intervalId = setInterval(() => {
    //   // 这里调用 getOrders 时最好不要 setLoading(true)，否则页面会一直闪烁转圈
    //   // 我们可以做一个静默刷新的逻辑
    //   getOrders().then((data) => {
    //     setOrders(data || []);
    //   });
    // }, 5000); // 5000毫秒 = 5秒

    // // 组件卸载时清除定时器，防止内存泄漏
    // return () => clearInterval(intervalId);
  }, []);

  // 计算 Stats
  const stats = {
    total: orders.length,
    // Blue: In Transit
    active: orders.filter((o) => o.status === "in transit").length,
    // Green: Completed
    completed: orders.filter(
      (o) => o.status === "delivered" || o.status === "complete"
    ).length,
    // Yellow: Dispatching (Dispatching / Future)
    dispatching: orders.filter((o) => {
      const startTime = new Date(o.pickup_time);
      const now = new Date();
      return now < startTime || o.status === "dispatching";
    }).length,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <StatsCard
          title="In Transit"
          value={stats.active}
          icon={Truck}
          color="bg-blue-500 text-blue-700" // 对应 In Transit 状态色
        />
        <StatsCard
          title="Dispatching"
          value={stats.dispatching}
          icon={Clock}
          color="bg-yellow-500 text-yellow-700" // 对应 Dispatch 状态色
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
