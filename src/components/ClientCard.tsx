import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  TrendingUp,
  User,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClientCardProps {
  client: Client;
}

export const ClientCard = ({ client }: ClientCardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "active":
        return "bg-accent/20 text-accent";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-amber-500/20 text-amber-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Header with avatar */}
      <div className="gradient-primary p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground text-xl font-semibold">
          {client.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-primary-foreground truncate">
            {client.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary-foreground/70 text-sm font-mono">
              {client.pcc}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                client.status
              )}`}
            >
              {client.status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 space-y-3 bg-card border-b border-border">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm truncate">{client.email}</span>
          </div>
          <Button
            variant="icon"
            size="icon-sm"
            onClick={() => handleCopy(client.email, "Email")}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedField === "Email" ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm">{client.phone}</span>
          </div>
          <Button
            variant="icon"
            size="icon-sm"
            onClick={() => handleCopy(client.phone, "Phone")}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedField === "Phone" ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Portfolio Info */}
      <div className="p-4 bg-card border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Portfolio Overview
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-sm font-semibold">{client.portfolio.totalValue}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Briefcase className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-semibold">{client.portfolio.accounts}</p>
            <p className="text-xs text-muted-foreground">Accounts</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm font-semibold">{client.joinDate}</p>
            <p className="text-xs text-muted-foreground">Joined</p>
          </div>
        </div>
      </div>

      {/* Account Manager */}
      {client.accountManager && (
        <div className="p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Manager</p>
              <p className="text-sm font-medium">{client.accountManager}</p>
            </div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      <div className="p-4 bg-secondary/30">
        <p className="text-xs text-muted-foreground text-center">
          Last activity: {client.portfolio.lastActivity}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-card grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="h-10">
          <Mail className="w-4 h-4 mr-2" />
          Email Client
        </Button>
        <Button variant="accent" size="sm" className="h-10">
          <Phone className="w-4 h-4 mr-2" />
          Call Client
        </Button>
      </div>
    </div>
  );
};
