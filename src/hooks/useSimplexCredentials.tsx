import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/clientWithFallback";
import { ClientWithSystems, Client, ClientSystem, Credential } from "@/types/database";

export const useSimplexCredentials = () => {
  return useQuery({
    queryKey: ["simplex-credentials"],
    queryFn: async (): Promise<ClientWithSystems | null> => {
      // Get Simplex client (the company)
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("client_code", "SIMPLEX")
        .maybeSingle();

      if (clientError) throw clientError;
      if (!client) return null;

      // Get all systems for Simplex
      const { data: systemsData, error: sysError } = await supabase
        .from("client_systems")
        .select(`
          *,
          system_types (*)
        `)
        .eq("client_id", (client as Client).client_id)
        .eq("is_active", true)
        .order("environment", { ascending: true });

      if (sysError) throw sysError;

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
        ...(client as Client),
        systems: systemsWithCredentials,
      };
    },
    staleTime: 60000,
  });
};