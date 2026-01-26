import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useWebUser, useUpdateNickname, useIsAdmin } from "@/hooks/useWebUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Shield, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";
import simplexLogo from "@/assets/simplex-logo.png";

const SettingsContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: webUser, isLoading } = useWebUser();
  const isAdmin = useIsAdmin();
  const updateNickname = useUpdateNickname();
  
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize nickname when webUser loads
  useState(() => {
    if (webUser?.nickname) {
      setNickname(webUser.nickname);
    }
  });

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      toast.error("Nickname cannot be empty");
      return;
    }
    
    setIsSaving(true);
    try {
      await updateNickname.mutateAsync(nickname.trim());
      toast.success("Nickname updated successfully");
    } catch (error) {
      toast.error("Failed to update nickname");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img
              src={simplexLogo}
              alt="Simplex Business Solutions"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-sm font-semibold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your profile details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">First Name</Label>
                <p className="font-medium">{webUser?.first_name || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Name</Label>
                <p className="font-medium">{webUser?.last_name || "-"}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="font-medium">{webUser?.email || user?.email || "-"}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname (Editable)</Label>
              <div className="flex gap-2">
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveNickname} 
                  disabled={isSaving || nickname === webUser?.nickname}
                  size="sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : nickname === webUser?.nickname ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is how you'll appear to others
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role & Position Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Role & Access</CardTitle>
                <CardDescription>Your position and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Position</Label>
                <p className="font-medium capitalize">
                  {webUser?.position?.replace("_", " ") || "Not Assigned"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Access Level</Label>
                <p className="font-medium">
                  {isAdmin ? (
                    <span className="text-primary">Administrator</span>
                  ) : (
                    "Standard User"
                  )}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Birthday</Label>
              <p className="font-medium">
                {webUser?.birth_day && webUser?.birth_month 
                  ? `${webUser.birth_day} ${webUser.birth_month}` 
                  : "-"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>
                To update your position, birthday, or other details, please contact an administrator.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {webUser?.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                webUser?.is_active 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {webUser?.is_active ? "Active" : "Inactive"}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Settings = () => {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
};

export default Settings;
