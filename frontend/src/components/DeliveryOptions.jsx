// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Bot, Plane, Check, Loader2, ArrowLeft, Clock } from "lucide-react";
// import { Button } from "./ui/button";
// import { StepIndicator } from "./StepIndicator";
// import { createOrder } from "../api/orderApi";

// export function DeliveryOptions() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const shippingData = location.state;

//   const [selectedMethod, setSelectedMethod] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!shippingData) navigate("/dashboard/new-order");
//   }, [shippingData, navigate]);

//   const deliveryMethods = [
//     {
//       id: "robot",
//       name: "Autonomous Robot",
//       price: 15.0,
//       duration: 45, // int
//       icon: Bot,
//       desc: "Best for ground delivery.",
//     },
//     {
//       id: "drone",
//       name: "Flying Drone",
//       price: 25.0,
//       duration: 15, // int
//       icon: Plane,
//       desc: "Fastest aerial delivery.",
//     },
//   ];

//   const handleConfirm = async () => {
//     if (!selectedMethod) return;
//     setLoading(true);

//     try {
//       const method = deliveryMethods.find((m) => m.id === selectedMethod);
//       const rawItems = shippingData.rawItems || [];

//       // 1. 数据转换：Array -> String Description
//       const descriptionString = rawItems
//         .map((item) => `${item.name}`)
//         .join(", ");

//       // 2. 数据转换：Total Weight
//       const totalWeight = rawItems.reduce(
//         (sum, item) => sum + (parseFloat(item.weight) || 0),
//         0
//       );

//       // 3. 组装 API Payload (严格遵守 Snake Case)
//       // 调用preview route去updated uration和price
//       // 再submit data
//       const payload = {
//         from_address: shippingData.from_address,
//         to_address: shippingData.to_address,
//         duration: method.duration, // int
//         price: method.price, // float
//         item_description: descriptionString, // string
//         weight: totalWeight, // float
//       };

//       console.log("Submitting Payload:", payload);

//       // 4. 发送
//       const result = await createOrder(payload);

//       if (result.success) {
//         navigate("/dashboard/orders", { state: { refresh: true } });
//       } else {
//         alert("Server returned failure.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to submit order.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!shippingData) return null;

//   return (
//     <div className="max-w-4xl mx-auto pb-10">
//       <StepIndicator currentStep={2} />

//       <div className="flex items-center gap-4 mb-6 mt-4">
//         <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
//           <ArrowLeft className="w-5 h-5" />
//         </Button>
//         <h1 className="text-2xl font-bold">Select Delivery Method</h1>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {deliveryMethods.map((method) => {
//           const isSelected = selectedMethod === method.id;
//           const Icon = method.icon;
//           return (
//             <div
//               key={method.id}
//               onClick={() => setSelectedMethod(method.id)}
//               className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
//                 isSelected
//                   ? "border-black bg-gray-50 ring-1 ring-black"
//                   : "border-gray-200 bg-white hover:border-gray-300"
//               }`}
//             >
//               {isSelected && (
//                 <div className="absolute top-4 right-4 bg-black text-white rounded-full p-1">
//                   <Check size={14} />
//                 </div>
//               )}

//               <div className="flex justify-between items-start mb-4">
//                 <div
//                   className={`p-3 rounded-lg ${
//                     isSelected
//                       ? "bg-black text-white"
//                       : "bg-gray-100 text-gray-600"
//                   }`}
//                 >
//                   <Icon size={24} />
//                 </div>
//                 <div className="text-right">
//                   <div className="text-xl font-bold">
//                     ${method.price.toFixed(2)}
//                   </div>
//                   <div className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
//                     <Clock size={12} /> {method.duration} min
//                   </div>
//                 </div>
//               </div>
//               <h3 className="font-bold text-lg">{method.name}</h3>
//               <p className="text-sm text-gray-500">{method.desc}</p>
//             </div>
//           );
//         })}
//       </div>

//       <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
//         <div>
//           <p className="text-sm text-gray-500">Estimated Total</p>
//           <p className="text-3xl font-bold">
//             $
//             {selectedMethod
//               ? deliveryMethods
//                   .find((m) => m.id === selectedMethod)
//                   .price.toFixed(2)
//               : "0.00"}
//           </p>
//         </div>
//         <Button
//           onClick={handleConfirm}
//           disabled={!selectedMethod || loading}
//           className="bg-black text-white hover:bg-gray-800 py-6 px-10 text-lg shadow-md"
//         >
//           {loading ? (
//             <>
//               <Loader2 className="mr-2 animate-spin" /> Processing
//             </>
//           ) : (
//             "Confirm & Pay"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Plane,
  Check,
  Loader2,
  ArrowLeft,
  Clock,
  Map as MapIcon,
  MapPin,
} from "lucide-react";
import { Button } from "./ui/button";
import { StepIndicator } from "./StepIndicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// 引入 API
import { createOrder, previewRoute } from "../api/orderApi";

export function DeliveryOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingData = location.state;

  // State
  const [deliveryMethods, setDeliveryMethods] = useState([]); // 存储从后端获取的动态选项
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true); // 算路 Loading
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交 Loading

  // Map Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapRouteData, setMapRouteData] = useState(null); // 存储要显示的路线数据

  // 1. 初始化：如果没有数据，踢回上一页
  useEffect(() => {
    if (!shippingData) {
      navigate("/dashboard/new-order");
      return;
    }

    // 2. 调用 Preview Route API 获取动态价格和时长
    const fetchRoutes = async () => {
      setIsLoadingRoutes(true);
      try {
        const routes = await previewRoute({
          from_address: shippingData.from_address,
          to_address: shippingData.to_address,
        });
        setDeliveryMethods(routes);
      } catch (error) {
        alert("Failed to calculate routes. Please try again.");
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, [shippingData, navigate]);

  // 处理 View Map 点击
  const handleViewMap = (e, method) => {
    e.stopPropagation(); // 防止触发卡片选择
    setMapRouteData(method); // 设置当前要在地图上显示的路线数据
    setIsMapOpen(true);
  };

  // 处理最终提交
  const handleConfirm = async () => {
    if (!selectedMethodId) return;
    setIsSubmitting(true);

    try {
      // 找到用户选中的那个动态方案
      const selectedOption = deliveryMethods.find(
        (m) => m.id === selectedMethodId
      );

      // 处理物品描述字符串
      const rawItems = shippingData.rawItems || [];
      const descriptionString = rawItems
        .map((item) => `${item.name}`)
        .join(", ");
      const totalWeight = rawItems.reduce(
        (sum, item) => sum + (parseFloat(item.weight) || 0),
        0
      );

      // 3. 整合所有数据 (Address + Calculated Price/Duration + Items)
      const finalPayload = {
        from_address: shippingData.from_address,
        to_address: shippingData.to_address,
        pickup_time: new Date().toISOString(), // 假设立即发货
        duration: selectedOption.duration, // 来自 Preview API
        price: selectedOption.price, // 来自 Preview API
        item_description: descriptionString,
        weight: totalWeight,
        // 可选：把算好的 route 也传回去存起来
        // route: selectedOption.route
      };

      await createOrder(finalPayload);

      // 成功跳转
      navigate("/dashboard/orders", { state: { refresh: true } });
    } catch (error) {
      alert("Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shippingData) return null;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <StepIndicator currentStep={2} />

      <div className="flex items-center gap-4 mb-6 mt-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Select Delivery Method
        </h1>
      </div>

      {/* Loading State for Route Calculation */}
      {isLoadingRoutes ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">
            Calculating best routes & prices...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {deliveryMethods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            const Icon = method.id === "drone" ? Plane : Bot; // 简单的图标映射逻辑

            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethodId(method.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
                  ${
                    isSelected
                      ? "border-black bg-gray-50 ring-1 ring-black shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-black text-white rounded-full p-1.5 shadow-sm">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                <div className="flex justify-between items-start mb-5">
                  <div
                    className={`p-3.5 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}
                  >
                    <Icon size={28} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${method.price.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1 mt-1 bg-green-50 px-2 py-1 rounded-full">
                      <Clock size={12} /> {method.duration} min
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {method.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {method.description}
                </p>

                {/* --- 恢复功能：View Map Button --- */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
                  onClick={(e) => handleViewMap(e, method)}
                >
                  <MapIcon className="w-4 h-4 mr-2" /> View Map Route
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Estimated Total
          </p>
          <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
            $
            {selectedMethodId
              ? deliveryMethods
                  .find((m) => m.id === selectedMethodId)
                  ?.price.toFixed(2)
              : "0.00"}
          </p>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedMethodId || isSubmitting || isLoadingRoutes}
          className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 py-7 px-10 text-lg font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>

      {/* --- Map Preview Dialog --- */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 border-b border-gray-100 bg-white z-10">
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              <span>Route Preview: {mapRouteData?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="h-[400px] bg-slate-50 flex flex-col items-center justify-center text-gray-400 relative">
            {/* 这里是地图占位符，以后你可以接入 Google Maps */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover"></div>

            <div className="z-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 max-w-sm text-center">
              <MapPin className="w-10 h-10 text-blue-500" />
              <div>
                <p className="text-gray-900 font-semibold mb-1">
                  Route Visualization
                </p>
                <p className="text-xs text-gray-500">
                  Showing route data for{" "}
                  <span className="font-mono text-blue-600">
                    {mapRouteData?.route || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
