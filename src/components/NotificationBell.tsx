import { useState } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useUserNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationSubscription,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const notificationTypeColors: Record<string, string> = {
  LOGIN: "bg-green-500",
  LOGOUT: "bg-gray-500",
  CREATE: "bg-blue-500",
  COPY: "bg-amber-500",
  EDIT: "bg-purple-500",
  DELETE: "bg-red-500",
  PERMISSION_CHANGE: "bg-orange-500",
  ACCESS_DENIED: "bg-red-600",
  SYSTEM_ALERT: "bg-primary",
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = useUserNotifications();
  const unreadCount = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Subscribe to real-time notifications
  useNotificationSubscription();

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="w-3 h-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markRead.mutate(notification.notification_id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        notificationTypeColors[notification.type] || "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
