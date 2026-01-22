import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientCredential, ClientWithCredentials } from "@/types/database";

export const useSearchClients = (searchTerm: string) => {
  return useQuery({
    queryKey: ["clients", "search", searchTerm],
    queryFn: async (): Promise<ClientWithCredentials | null> => {
      if (!searchTerm.trim()) return null;

      const normalizedTerm = searchTerm.toLowerCase().trim();

      // Search clients by name or code
      const { data: clients, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .or(`name.ilike.%${normalizedTerm}%,code.ilike.%${normalizedTerm}%`)
        .limit(1);

      if (clientError) throw clientError;

      let client: Client | null = clients?.[0] as Client | null;

      // If no client found, search by credential username or IP
      if (!client) {
        const { data: credentials, error: credError } = await supabase
          .from("client_credentials")
          .select("client_id")
          .or(`username.ilike.%${normalizedTerm}%,ip_address.ilike.%${normalizedTerm}%`)
          .limit(1);

        if (credError) throw credError;

        if (credentials?.[0]) {
          const { data: foundClient, error } = await supabase
            .from("clients")
            .select("*")
            .eq("id", credentials[0].client_id)
            .maybeSingle();

          if (error) throw error;
          client = foundClient as Client | null;
        }
      }

      if (!client) return null;

      // Get all credentials for this client
      const { data: allCredentials, error: allCredError } = await supabase
        .from("client_credentials")
        .select("*")
        .eq("client_id", client.id)
        .order("environment", { ascending: true });

      if (allCredError) throw allCredError;

      return {
        ...client,
        credentials: (allCredentials || []) as ClientCredential[],
      };
    },
    enabled: !!searchTerm.trim(),
    staleTime: 30000,
  });
};

export const useAllClients = () => {
  return useQuery({
    queryKey: ["clients", "all"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Client[];
    },
    staleTime: 60000,
  });
};
