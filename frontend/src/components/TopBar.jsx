import { Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useMailbox } from "../contexts/MailboxContext";

export function TopBar() {
    const navigate = useNavigate();
    const { unreadCount, wsStatus } = useMailbox();

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

            {/* Mailbox */}
            <div className="flex items-center gap-4 ml-4">
                <div className="text-xs text-gray-500">
                    WS: <span className={wsStatus === "connected" ? "text-green-600" : "text-gray-500"}>{wsStatus}</span>
                </div>

                <Button
                    onClick={handleMailboxClick}
                    variant="ghost"
                    size="icon"
                    className="relative p-2"
                    aria-label="Open mailbox"
                >
                    <Bell className="w-5 h-5" />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1">
              <Badge className="h-5 min-w-5 px-1 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </span>
                    )}
                </Button>
            </div>
        </header>
    );
}
