import { Search, Bell, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function TopBar() {
  const navigate = useNavigate();

  const handleMailboxClick = () => {
    navigate("/dashboard/mailbox");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* mailbox*/}
      <div className="flex items-center gap-4 ml-4">
        <Button
          onClick={handleMailboxClick}
          variant="ghost"
          size="icon"
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
