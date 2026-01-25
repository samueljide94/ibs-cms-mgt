import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { DashboardScreen } from "@/components/DashboardScreen";
import { Loader2 } from "lucide-react";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return !user ? <AuthScreen /> : <DashboardScreen />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;