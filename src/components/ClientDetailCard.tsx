import { ClientWithSystems } from "@/types/database";
import { CredentialCard } from "@/components/CredentialCard";
import { Building2, Calendar, FileText, Server } from "lucide-react";

interface ClientDetailCardProps {
  client: ClientWithSystems;
}

export const ClientDetailCard = ({ client }: ClientDetailCardProps) => {
  // Group systems by environment
  const groupedSystems = client.systems.reduce((acc, system) => {
    const env = system.environment || "Production";
    if (!acc[env]) acc[env] = [];
    acc[env].push(system);
    return acc;
  }, {} as Record<string, typeof client.systems>);

  const envOrder = ["Production", "Test", "DR", "Development"];

  const totalCredentials = client.systems.reduce(
    (sum, sys) => sum + sys.credentials.length,
    0
  );

  return (
    <div className="animate-slide-up bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-primary-foreground truncate">
              {client.client_name}
            </h2>
            <p className="text-primary-foreground/70 text-sm font-mono">
              {client.client_code}
            </p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Server className="w-4 h-4" />
            {client.systems.length} systems
          </span>
          <span>{totalCredentials} credentials</span>
        </div>
        {client.industry && (
          <span className="text-muted-foreground">{client.industry}</span>
        )}
      </div>

      {client.notes && (
        <div className="px-4 py-3 bg-muted/10 border-b border-border">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{client.notes}</p>
          </div>
        </div>
      )}

      {/* Credentials */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {client.systems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No systems configured for this client
          </p>
        ) : (
          envOrder.map((env) => {
            const systems = groupedSystems[env];
            if (!systems || systems.length === 0) return null;

            return (
              <div key={env}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span>{env}</span>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                    {systems.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {systems.map((system) =>
                    system.credentials.map((cred) => (
                      <CredentialCard
                        key={cred.credential_id}
                        credential={cred}
                        system={system}
                        clientId={client.client_id}
                      />
                    ))
                  )}
                  {systems.every((s) => s.credentials.length === 0) && (
                    <p className="text-xs text-muted-foreground py-2">
                      No credentials stored for {env.toLowerCase()} systems
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-muted/20 border-t border-border">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>
            Added: {new Date(client.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};