import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWebUser } from "./useWebUser";

type AuditAction = 'VIEW' | 'COPY' | 'EDIT' | 'DELETE' | 'CREATE';

interface AuditParams {
  credential_id?: number;
  client_id?: number;
  action: AuditAction;
  field_copied?: string;
}

export const useCredentialAudit = () => {
  const { data: webUser } = useWebUser();

  return useMutation({
    mutationFn: async (params: AuditParams) => {
      const { error } = await supabase
        .from("credential_audit")
        .insert({
          credential_id: params.credential_id,
          client_id: params.client_id,
          user_id: webUser?.user_id,
          action: params.action,
          field_copied: params.field_copied,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;
    },
  });
};

export const useCopyWithAudit = () => {
  const audit = useCredentialAudit();

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