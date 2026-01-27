import { useState } from "react";
import { Credential, ClientSystem } from "@/types/database";
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
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCopyWithAudit } from "@/hooks/useAuditLog";
import { usePermissions } from "@/hooks/usePermissions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CredentialCardProps {
  credential: Credential;
  system: ClientSystem;
  clientId: number;
}

const typeIcons: Record<string, React.ElementType> = {
  RDP: Monitor,
  VPN: Network,
  Database: Database,
  SSH: Server,
  "Web Portal": Globe,
  API: Globe,
  FTP: Server,
  Email: MoreHorizontal,
  Cloud: Globe,
  Other: MoreHorizontal,
};

const envColors: Record<string, string> = {
  Production: "bg-primary/10 text-primary",
  Test: "bg-amber-500/20 text-amber-600",
  DR: "bg-blue-500/20 text-blue-600",
  Development: "bg-purple-500/20 text-purple-600",
};

export const CredentialCard = ({ credential, system, clientId }: CredentialCardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { copyToClipboard } = useCopyWithAudit();
  const permissions = usePermissions();

  const handleCopy = async (text: string | null, field: string) => {
    if (!text) return;
    if (!permissions.canCopy) {
      toast.error("You don't have permission to copy credentials");
      return;
    }
    const success = await copyToClipboard(
      text,
      credential.credential_id,
      clientId,
      field
    );
    if (success) {
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleDelete = async () => {
    // This would be implemented with actual delete mutation
    toast.success("Credential deleted successfully");
    setShowDeleteConfirm(false);
  };

  const systemTypeName = system.system_type?.system_type_name || "Other";
  const Icon = typeIcons[systemTypeName] || MoreHorizontal;
  const envColor = envColors[system.environment || "Production"] || envColors.Production;

  return (
    <>
      <div className="p-3 rounded-lg border border-border bg-card space-y-2 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {system.system_name}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${envColor}`}>
                  {system.environment}
                </span>
                {credential.credential_type && (
                  <span className="text-[10px] text-muted-foreground">
                    {credential.credential_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Admin/Edit Actions */}
          {permissions.canEdit && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Edit credential"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              {permissions.canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete credential"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm">
        {(system.ip_address || system.host) && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">Host:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {system.ip_address || system.host}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(system.ip_address || system.host, "Host")}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "Host" ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {credential.username && (
          <div className="flex items-center justify-between group">
            <span className="text-muted-foreground">Username:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {credential.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(credential.username, "Username")}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === "Username" ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between group">
          <span className="text-muted-foreground">Password:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-foreground truncate max-w-[140px]">
              {showPassword ? credential.password_value : "••••••••"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-6 w-6 p-0"
            >
              {showPassword ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(credential.password_value, "Password")}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedField === "Password" ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {credential.notes && (
          <p className="text-muted-foreground text-xs italic pt-1 border-t border-border/50">
            {credential.notes}
          </p>
        )}
      </div>
    </div>

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title="Delete Credential"
      description={`Are you sure you want to delete this credential for ${system.system_name}? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
      variant="destructive"
    />
  </>
  );
};