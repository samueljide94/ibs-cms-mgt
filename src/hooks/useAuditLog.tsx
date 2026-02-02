import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/clientWithFallback";
import { useWebUser } from "./useWebUser";
import { CredentialAudit } from "@/types/database";

export type AuditAction = 'VIEW' | 'COPY' | 'EDIT' | 'DELETE' | 'CREATE' | 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED';

interface AuditLogParams {
  credential_id?: number;
  client_id?: number;
  action: AuditAction;
  field_copied?: string;
  details?: string;
}

export const useAuditLog = () => {
  const { data: webUser } = useWebUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AuditLogParams) => {
      const { error } = await supabase
        .from("credential_audit")
        .insert({
          credential_id: params.credential_id,
          client_id: params.client_id,
          user_id: webUser?.user_id,
          action: params.action,
          field_copied: params.field_copied || params.details,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

// View all audit logs (for audit trail visibility)
export const useAuditLogs = (limit = 50) => {
  return useQuery({
    queryKey: ["audit-logs", limit],
    queryFn: async (): Promise<CredentialAudit[]> => {
      const { data, error } = await supabase
        .from("credential_audit")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as CredentialAudit[];
    },
  });
};

// Audit log for specific client
export const useClientAuditLogs = (clientId: number | null) => {
  return useQuery({
    queryKey: ["audit-logs", "client", clientId],
    queryFn: async (): Promise<CredentialAudit[]> => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from("credential_audit")
        .select("*")
        .eq("client_id", clientId)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as CredentialAudit[];
    },
    enabled: !!clientId,
  });
};

// Hook to copy with audit logging
export const useCopyWithAudit = () => {
  const audit = useAuditLog();

  const copyToClipboard = async (
    text: string, 
    credentialId: number, 
    clientId: number, 
    fieldName: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      await audit.mutateAsync({
        credential_id: credentialId,
        client_id: clientId,
        action: 'COPY',
        field_copied: fieldName,
      });
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  };

  return { copyToClipboard, isLoading: audit.isPending };
};
