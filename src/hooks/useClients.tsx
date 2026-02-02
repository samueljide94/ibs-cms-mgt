import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/clientWithFallback";
import { Client, ClientWithSystems, ClientSystem, Credential } from "@/types/database";

export const useSearchClients = (searchTerm: string) => {
  return useQuery({
    queryKey: ["clients", "search", searchTerm],
    queryFn: async (): Promise<ClientWithSystems | null> => {
      if (!searchTerm.trim()) return null;

      const normalizedTerm = searchTerm.toLowerCase().trim();

      // Search clients by name or code
      const { data: clients, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .or(`client_name.ilike.%${normalizedTerm}%,client_code.ilike.%${normalizedTerm}%`)
        .eq("is_active", true)
        .limit(1);

      if (clientError) throw clientError;

      let client: Client | null = clients?.[0] as Client | null;

      // If no client found, search by system host or IP
      if (!client) {
        const { data: systems, error: sysError } = await supabase
          .from("client_systems")
          .select("client_id")
          .or(`host.ilike.%${normalizedTerm}%,ip_address.ilike.%${normalizedTerm}%`)
          .eq("is_active", true)
          .limit(1);

        if (sysError) throw sysError;

        if (systems?.[0]) {
          const { data: foundClient, error } = await supabase
            .from("clients")
            .select("*")
            .eq("client_id", systems[0].client_id)
            .eq("is_active", true)
            .maybeSingle();

          if (error) throw error;
          client = foundClient as Client | null;
        }
      }

      if (!client) return null;

      // Get all systems for this client
      const { data: systemsData, error: sysDataError } = await supabase
        .from("client_systems")
        .select(`
          *,
          system_types (*)
        `)
        .eq("client_id", client.client_id)
        .eq("is_active", true)
        .order("environment", { ascending: true });

      if (sysDataError) throw sysDataError;

      // Get credentials for each system
      const systemsWithCredentials = await Promise.all(
        (systemsData || []).map(async (system) => {
          const { data: credentials, error: credError } = await supabase
            .from("credential_vault")
            .select("*")
            .eq("system_id", system.system_id);

          if (credError) throw credError;

          return {
            ...system,
            system_type: system.system_types,
            credentials: (credentials || []) as Credential[],
          } as ClientSystem & { credentials: Credential[] };
        })
      );

      return {
        ...client,
        systems: systemsWithCredentials,
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
        .eq("is_active", true)
        .neq("client_code", "SIMPLEX")
        .order("client_name", { ascending: true });

      if (error) throw error;
      return (data || []) as Client[];
    },
    staleTime: 60000,
  });
};

export const useClientWithSystems = (clientId: number) => {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async (): Promise<ClientWithSystems | null> => {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (clientError) throw clientError;
      if (!client) return null;

      const { data: systemsData, error: sysError } = await supabase
        .from("client_systems")
        .select(`
          *,
          system_types (*)
        `)
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("environment", { ascending: true });

      if (sysError) throw sysError;

      const systemsWithCredentials = await Promise.all(
        (systemsData || []).map(async (system) => {
          const { data: credentials, error: credError } = await supabase
            .from("credential_vault")
            .select("*")
            .eq("system_id", system.system_id);

          if (credError) throw credError;

          return {
            ...system,
            system_type: system.system_types,
            credentials: (credentials || []) as Credential[],
          } as ClientSystem & { credentials: Credential[] };
        })
      );

      return {
        ...(client as Client),
        systems: systemsWithCredentials,
      };
    },
    enabled: !!clientId,
    staleTime: 30000,
  });
};