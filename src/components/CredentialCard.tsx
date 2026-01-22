import { useState } from "react";
import { ClientCredential } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Monitor,
  Network,
  Server,
  Database,
  Globe,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface CredentialCardProps {
  credential: ClientCredential;
}

const typeIcons = {
  rdp: Monitor,
  vpn: Network,
  server: Server,
  database: Database,
  portal: Globe,
  other: MoreHorizontal,
};

const envColors = {
  production: "bg-accent/20 text-accent",
  test: "bg-amber-500/20 text-amber-600",
  dr: "bg-blue-500/20 text-blue-600",
  portal: "bg-purple-500/20 text-purple-600",
};

export const CredentialCard = ({ credential }: CredentialCardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (text: string | null, field: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const Icon = typeIcons[credential.credential_type] || MoreHorizontal;
  const envColor = envColors[credential.environment] || envColors.production;

  return (
    <div className="p-3 rounded-lg border border-border bg-card/50 space-y-2 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium capitalize">
              {credential.label || credential.credential_type}
            </p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${envColor}`}>
              {credential.environment}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        {(credential.ip_address || credential.hostname) && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">Host:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {credential.ip_address || credential.hostname}
                {credential.port && `:${credential.port}`}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(credential.ip_address || credential.hostname, "Host")}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "Host" ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {credential.url && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">URL:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {credential.url}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(credential.url, "URL")}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "URL" ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {credential.username && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">User:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {credential.username}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(credential.username, "Username")}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "Username" ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {credential.password && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">Pass:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[150px]">
                {showPassword ? credential.password : "••••••••"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-5 w-5"
              >
                {showPassword ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(credential.password, "Password")}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "Password" ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {credential.notes && (
          <p className="text-muted-foreground italic pt-1 border-t border-border/50">
            {credential.notes}
          </p>
        )}
      </div>
    </div>
  );
};
