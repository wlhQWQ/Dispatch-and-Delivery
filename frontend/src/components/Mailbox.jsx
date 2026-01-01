import { useState } from "react";
import { Mail, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

// Sample messages data - ordered by time (most recent first)
const sampleMessages = [
  {
    id: 1,
    subject: "Order #12345 Delivered",
    content:
      "Dear Customer,\n\nWe are pleased to inform you that your order #12345 has been successfully delivered to the destination address. The recipient has confirmed receipt of the package.\n\nThank you for using our delivery service!",
    timestamp: new Date("2024-01-15T14:30:00"),
    read: false,
  },
  {
    id: 5,
    subject: "Pickup Confirmation",
    content:
      "Dear Customer,\n\nYour order #12344 has been picked up. \n\nThank you for your business!",
    timestamp: new Date("2024-01-14T16:45:00"),
    read: true,
  },
];

export function Mailbox() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState(sampleMessages);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    // 标记已读，但数据库没存目前没法实现
    setMessages(
      messages.map((msg) =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    );
  };

  const handleAcknowledge = () => {
    // 实现确认pickup/确认delivery
    console.log("Message acknowledged:", selectedMessage?.id);
    setIsDialogOpen(false);
  };

  const formatTime = (date) => {
    //显示多长时间前收到
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mailbox</h1>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                !message.read ? "border-l-4 border-l-blue-600" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${
                    !message.read ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Mail
                    className={`w-5 h-5 ${
                      !message.read ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        !message.read ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {message.subject}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {!message.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages
              </h3>
              <p className="text-gray-500">You don't have any messages yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Dialog 弹窗*/}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              {selectedMessage && formatTime(selectedMessage.timestamp)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
              {selectedMessage?.content}
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              onClick={handleAcknowledge}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
