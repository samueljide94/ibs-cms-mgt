import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/clientWithFallback";
import { WebUser, UserRole, RESTRICTED_POSITIONS, ADMIN_POSITIONS, EDIT_POSITIONS } from "@/types/database";
import { useAuth } from "./useAuth";

export const useWebUser = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["web-user", user?.id],
    queryFn: async (): Promise<WebUser | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("web_users")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as WebUser | null;
    },
    enabled: !!user?.id,
  });
};

export const useUserRoles = () => {
  const { data: webUser } = useWebUser();
  
  return useQuery({
    queryKey: ["user-roles", webUser?.user_id],
    queryFn: async (): Promise<UserRole[]> => {
      if (!webUser?.user_id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", webUser.user_id);

      if (error) throw error;
      return (data || []) as UserRole[];
    },
    enabled: !!webUser?.user_id,
  });
};

// Check if user has Admin role OR is in MD position
export const useIsAdmin = () => {
  const { data: webUser } = useWebUser();
  const { data: roles } = useUserRoles();
  
  // Admin role explicitly assigned
  const hasAdminRole = roles?.some(r => r.role === 'Admin') ?? false;
  
  // MD position automatically gets admin access
  const isMD = webUser?.position === 'MD';
  
  return hasAdminRole || isMD;
};

// Check if user can edit (MD to Senior, plus Developer)
export const useCanEdit = () => {
  const { data: webUser } = useWebUser();
  const isAdmin = useIsAdmin();
  
  // Admins can always edit
  if (isAdmin) return true;
  if (!webUser) return false;
  
  // Check if user is in an edit-allowed position
  return EDIT_POSITIONS.includes(webUser.position);
};

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();
  const { data: webUser } = useWebUser();
  
  return useMutation({
    mutationFn: async (nickname: string) => {
      if (!webUser?.user_id) throw new Error("User not found");

      const { error } = await supabase
        .from("web_users")
        .update({ nickname })
        .eq("user_id", webUser.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-user"] });
    },
  });
};