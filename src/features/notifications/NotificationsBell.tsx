"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

/** In-app notification bell: unread badge, animated dropdown, mark-as-read. */
export function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, link, read, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();
    const fetchItems = () =>
      supabase
        .from("notifications")
        .select("id, title, body, link, read, created_at")
        .order("created_at", { ascending: false })
        .limit(15)
        .then(({ data }) => {
          if (active && data) setItems(data);
        });
    fetchItems();
    const interval = setInterval(fetchItems, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markAllRead = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openItem = async (item: Notification) => {
    if (!item.read) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("notifications").update({ read: true }).eq("id", item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        className="relative rounded-md p-2 text-slate-body transition-colors hover:bg-mist hover:text-navy"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            <span className="absolute inset-0 rounded-full bg-brand animate-pulse-ring" aria-hidden />
            <span className="relative">{unread > 9 ? "9+" : unread}</span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="animate-dialog-in absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-2xl shadow-navy/15 sm:w-96">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-navy">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-body">
                Nothing yet. Activity that concerns you shows up here.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item)}
                  className={`block w-full border-b border-line/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-mist/60 ${
                    item.read ? "" : "bg-mist/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.read ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-body">{item.body}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-body/60">
                        {new Date(item.created_at).toLocaleString("en-GB")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
