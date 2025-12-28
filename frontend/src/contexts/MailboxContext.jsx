import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { WS_URL } from "../constants";
import { fetchMailboxMessages, confirmMailboxAction } from "../api/mailboxApi";

/**
 * 统一把各种可能的后端格式“规范化”为前端统一格式
 */
function normalizeMessage(raw) {
    const now = new Date();

    // raw 是 string
    if (typeof raw === "string") {
        return {
            id: `${Date.now()}-${Math.random()}`,
            subject: "Notification",
            content: raw,
            timestamp: now,
            read: false,
            type: "INFO",
            orderId: null,
            actionRequired: null, // "pickup" | "delivery" | null
        };
    }

    const id = raw.id ?? raw.messageId ?? `${Date.now()}-${Math.random()}`;
    const subject = raw.subject ?? raw.title ?? raw.type ?? "Notification";
    const content = raw.content ?? raw.message ?? raw.text ?? "";
    const t = raw.timestamp ?? raw.time ?? raw.createdAt ?? null;

    let timestamp = now;
    if (t) {
        const d = new Date(t);
        if (!Number.isNaN(d.getTime())) timestamp = d;
    }

    // 从字段或文本推断 actionRequired
    const type = (raw.type ?? "").toString();
    const lower = `${type} ${subject} ${content}`.toLowerCase();

    let actionRequired = raw.actionRequired ?? null;
    if (!actionRequired) {
        if (lower.includes("pickup") || lower.includes("pick up") || lower.includes("pick-up") || lower.includes("PICKUP".toLowerCase())) {
            actionRequired = "pickup";
        } else if (lower.includes("deliver") || lower.includes("delivery") || lower.includes("drop off") || lower.includes("drop-off")) {
            actionRequired = "delivery";
        }
    }

    return {
        id,
        subject,
        content,
        timestamp,
        read: Boolean(raw.read) || false,
        type: type || "INFO",
        orderId: raw.orderId ?? raw.order_id ?? null,
        actionRequired, // "pickup" | "delivery" | null
    };
}

// API 失败时用的 sample（保证 demo 不空）
const fallbackSample = [
    normalizeMessage({
        id: 1,
        subject: "Robot arrived at pickup",
        content: "Your robot has arrived at pickup location. Please confirm pickup to continue.",
        time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        type: "PICKUP_ARRIVED",
        orderId: 12345,
    }),
    normalizeMessage({
        id: 2,
        subject: "Order delivered",
        content: "Your order has been delivered. Please confirm delivery.",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        type: "DELIVERY_ARRIVED",
        orderId: 12344,
    }),
];

const MailboxContext = createContext(null);

export function useMailbox() {
    const ctx = useContext(MailboxContext);
    if (!ctx) throw new Error("useMailbox must be used within MailboxProvider");
    return ctx;
}

export function MailboxProvider({ children }) {
    const [messages, setMessages] = useState([]);
    const [wsStatus, setWsStatus] = useState("disconnected"); // "connecting" | "connected" | "disconnected"
    const wsRef = useRef(null);
    const hasConnectedRef = useRef(false);
    const retryRef = useRef({ attempts: 0, timer: null });

    // 初次拉取 mailbox
    useEffect(() => {
        if (hasConnectedRef.current) return;
        hasConnectedRef.current = true;

        let cancelled = false;

        (async () => {
            try {
                const data = await fetchMailboxMessages();
                const normalized = Array.isArray(data) ? data.map(normalizeMessage) : [];
                if (!cancelled) {
                    setMessages(normalized.sort((a, b) => b.timestamp - a.timestamp));
                }
            } catch (e) {
                // 后端没写完也能 demo
                if (!cancelled) {
                    setMessages(fallbackSample);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // WebSocket 连接 + 自动重连
    useEffect(() => {
        function cleanup() {
            if (retryRef.current.timer) {
                clearTimeout(retryRef.current.timer);
                retryRef.current.timer = null;
            }
            if (wsRef.current) {
                try { wsRef.current.close(); } catch {}
                wsRef.current = null;
            }
            setWsStatus("disconnected");
        }

        function connect() {
            cleanup();
            setWsStatus("connecting");

            try {
                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    retryRef.current.attempts = 0;
                    setWsStatus("connected");
                };

                ws.onmessage = (evt) => {
                    let payload = evt.data;
                    try {
                        payload = JSON.parse(evt.data);
                    } catch {
                        // keep as string
                    }

                    const msg = normalizeMessage(payload);

                    setMessages((prev) => {
                        const next = [msg, ...prev];
                        // 去重（避免重复推送）
                        const seen = new Set();
                        const dedup = [];
                        for (const m of next) {
                            const key = `${m.id}`;
                            if (!seen.has(key)) {
                                seen.add(key);
                                dedup.push(m);
                            }
                        }
                        return dedup.sort((a, b) => b.timestamp - a.timestamp);
                    });

                    toast.info(msg.subject);
                };

                ws.onclose = () => {
                    setWsStatus("disconnected");
                    scheduleReconnect();
                };

                ws.onerror = () => {
                    setWsStatus("disconnected");
                    scheduleReconnect();
                };
            } catch {
                setWsStatus("disconnected");
                scheduleReconnect();
            }
        }

        function scheduleReconnect() {
            if (retryRef.current.timer) return;
            const attempts = retryRef.current.attempts + 1;
            retryRef.current.attempts = attempts;

            // 0.8s, 1.6s, 3.2s ... 上限 10s
            const delay = Math.min(10000, 800 * Math.pow(2, attempts - 1));
            retryRef.current.timer = setTimeout(() => {
                retryRef.current.timer = null;
                connect();
            }, delay);
        }

        connect();
        return () => cleanup();
    }, []);

    function markRead(messageId) {
        setMessages((prev) =>
            prev.map((m) => (String(m.id) === String(messageId) ? { ...m, read: true } : m))
        );
    }

    async function confirmAction(message) {
        // 前端先乐观更新：标记已读
        markRead(message.id);

        // 根据 actionRequired 推断 action
        const action =
            message.actionRequired === "pickup"
                ? "PICKUP"
                : message.actionRequired === "delivery"
                    ? "DELIVERY"
                    : "ACK";

        try {
            await confirmMailboxAction({
                messageId: message.id,
                orderId: message.orderId,
                action,
            });
            toast.success(action === "ACK" ? "Acknowledged" : `Confirmed ${action.toLowerCase()}`);
        } catch (e) {
            // 后端没写完也能 demo：只提示降级
            toast.message("Saved locally (backend confirm not available yet)");
        }
    }

    const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

    const value = useMemo(
        () => ({
            messages,
            setMessages,
            markRead,
            confirmAction,
            unreadCount,
            wsStatus,
        }),
        [messages, unreadCount, wsStatus]
    );

    return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}
