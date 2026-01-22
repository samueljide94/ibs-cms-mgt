import { ClientWithCredentials } from "@/types/database";
import { CredentialCard } from "@/components/CredentialCard";
import { Building2, Calendar, FileText } from "lucide-react";

interface ClientDetailCardProps {
  client: ClientWithCredentials;
}

export const ClientDetailCard = ({ client }: ClientDetailCardProps) => {
  // Group credentials by environment
  const groupedCredentials = client.credentials.reduce((acc, cred) => {
    const env = cred.environment;
    if (!acc[env]) acc[env] = [];
    acc[env].push(cred);
    return acc;
  }, {} as Record<string, typeof client.credentials>);

  const envOrder = ['production', 'test', 'dr', 'portal'];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="gradient-primary p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-primary-foreground truncate">
              {client.name}
            </h2>
            {client.code && (
              <p className="text-primary-foreground/70 text-sm font-mono">
                {client.code}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Client Info */}
      {client.notes && (
        <div className="p-4 bg-card border-b border-border">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{client.notes}</p>
          </div>
        </div>
      )}

      {/* Credentials */}
      <div className="p-4 bg-card space-y-4 max-h-[320px] overflow-y-auto">
        {client.credentials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No credentials stored for this client
          </p>
        ) : (
          envOrder.map((env) => {
            const creds = groupedCredentials[env];
            if (!creds || creds.length === 0) return null;
            
            return (
              <div key={env}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="capitalize">{env}</span>
                  <span className="text-[10px] bg-secondary px-1.5 rounded">
                    {creds.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {creds.map((cred) => (
                    <CredentialCard key={cred.id} credential={cred} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-secondary/30 border-t border-border">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Added: {new Date(client.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
