import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, UserPlus, LogIn, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/clientWithFallback";
import simplexLogo from "@/assets/simplex-logo.png";
import { PositionType } from "@/types/database";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const POSITIONS: { value: PositionType; label: string }[] = [
  { value: "MD", label: "Managing Director" },
  { value: "Management", label: "Management" },
  { value: "HOD", label: "Head of Department" },
  { value: "QA", label: "Quality Assurance" },
  { value: "DevOps", label: "DevOps" },
  { value: "Engineer", label: "Engineer" },
  { value: "Senior", label: "Senior" },
  { value: "Junior", label: "Junior" },
  { value: "Trainee", label: "Trainee" },
  { value: "NYSC", label: "NYSC" },
  { value: "IT_Swiss", label: "IT/Swiss" },
];

export const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [position, setPosition] = useState<PositionType>("Junior");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp } = useAuth();

  const validateEmail = (email: string) => {
    return email.endsWith("@simplexsystem.com");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Only @simplexsystem.com email addresses are allowed");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          // Handle rate limiting specifically
          if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
            setError('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            setError(error.message);
          }
        }
      } else {
        // Validate signup fields
        if (!firstName.trim() || !lastName.trim()) {
          setError("First name and last name are required");
          setIsLoading(false);
          return;
        }

        const dayNum = parseInt(birthDay);
        if (!birthDay || dayNum < 1 || dayNum > 31) {
          setError("Please enter a valid day (1-31)");
          setIsLoading(false);
          return;
        }

        if (!birthMonth) {
          setError("Please select your birth month");
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          // Handle rate limiting specifically for signup
          if (signUpError.message.includes('rate limit') || signUpError.message.includes('too many requests')) {
            setError('Too many signup attempts. Please wait a few minutes before trying again.');
          } else {
            setError(signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        // Get the current user after signup
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Create web_user profile
          const { error: profileError } = await supabase
            .from("web_users")
            .insert({
              auth_user_id: user.id,
              email: email,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              birth_day: dayNum,
              birth_month: birthMonth,
              position: position,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // Don't show error to user, they can still login
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary py-8 px-4 text-center">
        <div className="max-w-sm mx-auto">
          <img
            src={simplexLogo}
            alt="Simplex Business Solutions"
            className="h-12 mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-primary-foreground">
            IBS Portal
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            {mode === "login"
              ? "Sign in to access client credentials"
              : "Create your account"}
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date of Birth
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Day (1-31)"
                      min={1}
                      max={31}
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="h-11"
                      disabled={isLoading}
                      required
                    />
                    <Select
                      value={birthMonth}
                      onValueChange={setBirthMonth}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={position}
                    onValueChange={(val) => setPosition(val as PositionType)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@simplexsystem.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Only @simplexsystem.com emails are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            {mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};