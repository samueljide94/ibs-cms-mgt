import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWebUser } from "./useWebUser";
import { Notification } from "@/types/database";
import { useEffect } from "react";

export type NotificationType = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE' 
  | 'COPY' 
  | 'EDIT' 
  | 'DELETE' 
  | 'PERMISSION_CHANGE' 
  | 'ACCESS_DENIED'
  | 'SYSTEM_ALERT';

interface CreateNotificationParams {
  user_ids?: number[];  // Specific users to notify
  type: NotificationType;
  title: string;
  message?: string;
  reference_type?: string;
  reference_id?: number;
  notify_admins?: boolean;
}

// Input validation for notification content
const validateNotificationInput = (params: CreateNotificationParams): void => {
  if (!params.title || params.title.trim().length === 0) {
    throw new Error('Notification title is required');
  }
  if (params.title.length > 200) {
    throw new Error('Notification title must be under 200 characters');
  }
  if (params.message && params.message.length > 1000) {
    throw new Error('Notification message must be under 1000 characters');
  }
};

// Sanitize text to remove potentially dangerous content
const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

// Hook to send notifications
export const useSendNotification = () => {
  const queryClient = useQueryClient();
  const { data: webUser } = useWebUser();

  return useMutation({
    mutationFn: async (params: CreateNotificationParams) => {
      // Validate input before processing
      validateNotificationInput(params);
      
      // Sanitize content
      const sanitizedTitle = sanitizeText(params.title);
      const sanitizedMessage = params.message ? sanitizeText(params.message) : undefined;
      
      const notifications = [];
      
      // If specific users are provided
      if (params.user_ids && params.user_ids.length > 0) {
        for (const userId of params.user_ids) {
          notifications.push({
            user_id: userId,
            type: params.type,
            title: sanitizedTitle,
            message: sanitizedMessage,
            reference_type: params.reference_type,
            reference_id: params.reference_id,
          });
        }
      }

      // If notifying admins
      if (params.notify_admins) {
        // Get all admin users
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "Admin");

        // Get all MD users
        const { data: mdUsers } = await supabase
          .from("web_users")
          .select("user_id")
          .eq("position", "MD");

        const adminUserIds = new Set([
          ...(adminRoles?.map(r => r.user_id) || []),
          ...(mdUsers?.map(u => u.user_id) || []),
        ]);

        for (const userId of adminUserIds) {
          // Don't duplicate if already in user_ids
          if (!params.user_ids?.includes(userId)) {
            notifications.push({
              user_id: userId,
              type: params.type,
              title: sanitizedTitle,
              message: sanitizedMessage,
              reference_type: params.reference_type,
              reference_id: params.reference_id,
            });
          }
        }
      }

      if (notifications.length > 0) {
        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Hook to get current user's notifications
export const useUserNotifications = () => {
  const { data: webUser } = useWebUser();

  return useQuery({
    queryKey: ["notifications", webUser?.user_id],
    queryFn: async (): Promise<Notification[]> => {
      if (!webUser?.user_id) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", webUser.user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!webUser?.user_id,
  });
};

// Hook to get unread count
export const useUnreadNotificationCount = () => {
  const { data: notifications } = useUserNotifications();
  return notifications?.filter(n => !n.is_read).length || 0;
};

// Hook to mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("notification_id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Hook to mark all as read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { data: webUser } = useWebUser();

  return useMutation({
    mutationFn: async () => {
      if (!webUser?.user_id) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", webUser.user_id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Real-time subscription hook
export const useNotificationSubscription = () => {
  const { data: webUser } = useWebUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!webUser?.user_id) return;

    const channel = supabase
      .channel(`notifications:${webUser.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${webUser.user_id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [webUser?.user_id, queryClient]);
};
