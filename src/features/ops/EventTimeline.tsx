import { CheckCircle2, MessageSquare, Send, XCircle } from "lucide-react";

export interface OpsEvent {
  id: string;
  action: string;
  comment: string | null;
  created_at: string;
  actorName: string;
}

const ICONS: Record<string, { Icon: typeof Send; className: string }> = {
  submitted: { Icon: Send, className: "bg-navy text-white" },
  approved: { Icon: CheckCircle2, className: "bg-brand text-white" },
  rejected: { Icon: XCircle, className: "bg-red-600 text-white" },
  commented: { Icon: MessageSquare, className: "bg-mist text-navy" },
};

export function EventTimeline({ events }: { events: OpsEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const { Icon, className } = ICONS[event.action] ?? ICONS.commented;
        return (
          <li key={event.id} className="flex gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-navy">
                <span className="font-semibold capitalize">{event.action}</span>{" "}
                by {event.actorName}
              </p>
              <p className="text-xs text-slate-body">
                {new Date(event.created_at).toLocaleString("en-GB")}
              </p>
              {event.comment ? (
                <p className="mt-1 rounded-md bg-mist/60 px-3 py-2 text-sm text-slate-body">
                  {event.comment}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
