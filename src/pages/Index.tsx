import { ExtensionPopup } from "@/components/ExtensionPopup";

const Index = () => {
  return (
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
            🌟 Client Support Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            Chrome Extension Preview
          </p>
        </div>

        {/* The popup component */}
        <ExtensionPopup />

        {/* Instructions */}
        <div className="mt-6 text-center max-w-[360px]">
          <p className="text-xs text-muted-foreground">
            Demo: <span className="font-mono">admin</span> /{" "}
            <span className="font-mono">vaug@</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching: Samuel, A200137964, or jane.smith
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
