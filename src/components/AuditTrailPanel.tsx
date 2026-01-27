import { useState } from "react";
import { useAuditLogs, useClientAuditLogs } from "@/hooks/useAuditLog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { History, User, Clock, Copy, Eye, Edit3, Trash2, LogIn, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const actionIcons: Record<string, React.ElementType> = {
  VIEW: Eye,
  COPY: Copy,
  EDIT: Edit3,
  DELETE: Trash2,
  CREATE: Edit3,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  ACCESS_DENIED: ShieldAlert,
};

const actionColors: Record<string, string> = {
  VIEW: "text-blue-500 bg-blue-500/10",
  COPY: "text-amber-500 bg-amber-500/10",
  EDIT: "text-purple-500 bg-purple-500/10",
  DELETE: "text-red-500 bg-red-500/10",
  CREATE: "text-green-500 bg-green-500/10",
  LOGIN: "text-emerald-500 bg-emerald-500/10",
  LOGOUT: "text-gray-500 bg-gray-500/10",
  ACCESS_DENIED: "text-red-600 bg-red-600/10",
};

interface AuditTrailPanelProps {
  clientId?: number;
  clientName?: string;
}

export const AuditTrailPanel = ({ clientId, clientName }: AuditTrailPanelProps) => {
  const [open, setOpen] = useState(false);
  
  // Use client-specific logs if clientId provided, otherwise all logs
  const { data: clientLogs, isLoading: clientLoading } = useClientAuditLogs(clientId || null);
  const { data: allLogs, isLoading: allLoading } = useAuditLogs(100);
  
  const logs = clientId ? clientLogs : allLogs;
  const isLoading = clientId ? clientLoading : allLoading;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          Audit Trail
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {clientName ? `${clientName} - Audit Trail` : "System Audit Trail"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => {
                const Icon = actionIcons[log.action] || Eye;
                const colorClass = actionColors[log.action] || "text-gray-500 bg-gray-500/10";

                return (
                  <div
                    key={log.audit_id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.action}</span>
                          {log.field_copied && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {log.field_copied}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>User #{log.user_id || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                          </span>
                          <span className="text-muted-foreground/70">
                            ({formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })})
                          </span>
                        </div>
                        {log.user_agent && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
                            {log.user_agent.substring(0, 60)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No audit records found</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
