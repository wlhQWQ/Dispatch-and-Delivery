import { useState, useEffect } from "react";
import {
  ShoppingCart,
  BarChart3,
  User,
  Inbox,
  AlertTriangle, // 引入警告图标
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { extractUsernameFromEmail, getUserInitials } from "../utils/userUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"; // 引入项目中已有的弹窗组件

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取用户 email 并提取 username
  const [userEmail, setUserEmail] = useState("");
  const username = extractUsernameFromEmail(userEmail);
  const userInitials = getUserInitials(userEmail);

  // 1. 定义状态：控制弹窗显示，记录用户本来想去哪
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  // 从 localStorage 获取 email
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  // 2. 判断当前是否在“下单流程”中
  const isCreatingOrder =
    location.pathname.includes("/new-order") ||
    location.pathname.includes("/delivery-options");

  // 3. 核心拦截逻辑
  const handleNavigation = (path) => {
    // 如果点击的是当前页面，啥也不干
    if (location.pathname === path) return;

    // 如果正在下单，且要去别的地方 -> 拦截弹窗
    if (isCreatingOrder) {
      setPendingPath(path); // 记下你想去哪（比如 '/dashboard/orders'）
      setShowExitDialog(true); // 打开确认弹窗
    } else {
      // 没在下单，直接放行
      navigate(path);
    }
  };

  // 4. 用户点击弹窗上的 "Continue" 后执行的动作
  const confirmExit = () => {
    setShowExitDialog(false);
    if (pendingPath) {
      navigate(pendingPath); // 去你原本想去的地方
      setPendingPath(null);
    }
  };

  const isActive = (path) => {
    if (path === "/dashboard/orders") {
      return (
        location.pathname.startsWith("/dashboard/orders") ||
        location.pathname === "/dashboard/new-order" ||
        location.pathname === "/dashboard/delivery-options"
      );
    }
    return location.pathname === path;
  };

  const menuItems = [
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/dashboard/orders",
    },
    {
      icon: Inbox,
      label: "Mailbox",
      path: "/dashboard/mailbox",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/dashboard/analytics",
    },
    {
      icon: User,
      label: "Profile",
      path: "/dashboard/profile",
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.post("/logout", null, { withCredentials: true });
      toast.success("Logged out");
    } catch (err) {
      console.error("Logout error:", err);
      // avoid stucking
      toast.error("Logout failed (cleared locally)");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");
      localStorage.removeItem("expiration");
      localStorage.removeItem("username");
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* --- Logo Area (左上角图标) --- */}
        {/* 这里的 onClick 也换成了 handleNavigation，实现点击 Logo 返回列表前的检查 */}
        <div
          className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleNavigation("/dashboard/orders")}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg">Dispatch</span>
          </div>
        </div>

        {/* --- Navigation --- */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full flex items-center gap-3 px-4 py-3 justify-start transition-all duration-200 ${
                  active
                    ? "bg-gray-100 text-gray-900 font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-black" : "text-gray-400"
                  }`}
                />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {username}
              </div>
              <div className="text-xs text-gray-500 truncate">{userEmail}</div>
            </div>
          </div>
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* 确认弹窗 */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Discard changes?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-500 text-base">
              You are currently creating a new shipment. If you leave this page
              now, all your entered data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg border-gray-200">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
            >
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
