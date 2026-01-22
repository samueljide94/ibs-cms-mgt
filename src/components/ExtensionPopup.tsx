import { AuthScreen } from "@/components/AuthScreen";
import { DashboardScreen } from "@/components/DashboardScreen";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const ExtensionPopup = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-[360px] h-[540px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-[540px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50">
      {!user ? <AuthScreen /> : <DashboardScreen />}
    </div>
  );
};
