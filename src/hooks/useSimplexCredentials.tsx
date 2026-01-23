import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientWithCredentials } from "@/types/database";

export const useSimplexCredentials = () => {
  return useQuery({
    queryKey: ["simplex-credentials"],
    queryFn: async (): Promise<ClientWithCredentials | null> => {
      // Get Simplex client (the company)
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .or("code.eq.SIMPLEX,name.ilike.%simplex%")
        .limit(1)
        .maybeSingle();

      if (clientError) throw clientError;
      if (!client) return null;

      // Get all credentials for Simplex
      const { data: credentials, error: credError } = await supabase
        .from("client_credentials")
        .select("*")
        .eq("client_id", client.id)
        .order("environment", { ascending: true });

      if (credError) throw credError;

      return {
        ...client,
        credentials: credentials || [],
      } as ClientWithCredentials;
    },
    staleTime: 60000,
  });
};
