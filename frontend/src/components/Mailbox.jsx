import { useMemo, useState } from "react";
import { Mail, Clock, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useMailbox } from "../contexts/MailboxContext";

export function Mailbox() {
  const { messages, markRead, confirmAction } = useMailbox();

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  const formatTime = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actionLabel = (m) => {
    if (!m?.actionRequired) return "Acknowledge";
    if (m.actionRequired === "pickup") return "Confirm Pickup";
    if (m.actionRequired === "delivery") return "Confirm Delivery";
    return "Acknowledge";
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    markRead(message.id);
  };

  const handleConfirm = async () => {
    if (!selectedMessage) return;
    await confirmAction(selectedMessage);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mailbox</h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time notifications & order confirmations
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-2">
          {sorted.map((message) => (
            <div
              key={String(message.id)}
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
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className={`font-semibold truncate ${
                          !message.read ? "text-gray-900" : "text-gray-700"
                        }`}
                        title={message.subject}
                      >
                        {message.subject}
                      </h3>

                      {message.actionRequired && (
                        <Badge variant="secondary" className="shrink-0">
                          action required
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>

                  {/* 一行预览 */}
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {message.content}
                  </p>

                  {/* orderId */}
                  {message.orderId != null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Order: #{message.orderId}
                    </p>
                  )}
                </div>

                {!message.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                )}
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
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

      {/* Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              {selectedMessage ? formatTime(selectedMessage.timestamp) : ""}
              {selectedMessage?.orderId != null ? (
                <span className="ml-2">• Order #{selectedMessage.orderId}</span>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
              {selectedMessage?.content}
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>

            <Button
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {actionLabel(selectedMessage)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
