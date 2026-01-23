import { ExtensionPopup } from "@/components/ExtensionPopup";
import { AuthProvider } from "@/hooks/useAuth";

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50 flex items-center justify-center p-6">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-accent rounded-full opacity-10 blur-3xl" />
        </div>

        <div className="relative">
          {/* Extension preview label */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              🔐 Support Credentials Hub
            </h1>
            <p className="text-muted-foreground text-sm">
              Source of Truth for Client Access
            </p>
          </div>

          {/* The popup component */}
          <ExtensionPopup />

          {/* Instructions */}
          <div className="mt-6 text-center max-w-[360px]">
            <p className="text-xs text-muted-foreground">
              Create an account or sign in to access client credentials
            </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Index;
