import {
  Home,
  ShoppingCart,
  Users,
  Package,
  Settings,
  BarChart3,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: ShoppingCart,
      label: "Orders",
      active: true,
      path: "/dashboard/orders",
    },
    { icon: User, label: "Profile", active: false },
    { icon: BarChart3, label: "Analytics", active: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900">Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Button
                  variant="ghost"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 justify-start ${
                    item.active
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 truncate">John Doe</div>
            <div className="text-gray-500 truncate">User</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
