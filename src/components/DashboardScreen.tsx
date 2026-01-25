import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientDetailCard } from "@/components/ClientDetailCard";
import { useSearchClients, useAllClients } from "@/hooks/useClients";
import { useSimplexCredentials } from "@/hooks/useSimplexCredentials";
import { useAuth } from "@/hooks/useAuth";
import { useWebUser } from "@/hooks/useWebUser";
import simplexLogo from "@/assets/simplex-logo.png";
import {
  Search,
  LogOut,
  Loader2,
  Building2,
  Database,
  Shield,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react";

export const DashboardScreen = () => {
  const { signOut } = useAuth();
  const { data: webUser } = useWebUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [showSimplex, setShowSimplex] = useState(false);

  const { data: searchResult, isLoading: isSearching } = useSearchClients(activeSearch);
  const { data: allClients } = useAllClients();
  const { data: simplexData } = useSimplexCredentials();

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm.trim());
    }
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearch("");
  };

  const displayName = webUser
    ? webUser.nickname || `${webUser.first_name} ${webUser.last_name}`
    : "User";
  const hasSearched = activeSearch.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={simplexLogo}
                alt="Simplex Business Solutions"
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-foreground">
                  IBS Portal
                </h1>
                <p className="text-xs text-muted-foreground">
                  Client Credential Hub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {webUser?.position?.replace("_", " ") || "Team Member"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-primary py-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-primary-foreground">
              Search Client Credentials
            </h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Find credentials by client name, code, IP, or hostname
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clients, IPs, hostnames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-24 h-12 bg-card border-0 shadow-lg text-base"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Simplex Company Credentials - Always visible when not searching */}
        {!hasSearched && simplexData && (
          <div className="mb-6 animate-fade-in">
            <button
              onClick={() => setShowSimplex(!showSimplex)}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Simplex Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    Company VPN & Server Access
                  </p>
                </div>
              </div>
              {showSimplex ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-primary" />
              )}
            </button>

            {showSimplex && (
              <div className="mt-4 animate-fade-in">
                <ClientDetailCard client={simplexData} />
              </div>
            )}
          </div>
        )}

        {/* Quick Access Clients */}
        {!hasSearched && allClients && allClients.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Quick Access ({allClients.length} clients)
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allClients.slice(0, 12).map((client) => (
                <button
                  key={client.client_id}
                  onClick={() => {
                    setSearchTerm(client.client_name);
                    setActiveSearch(client.client_name);
                  }}
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate">
                      {client.client_code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {client.client_name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Searching...</h3>
            <p className="text-sm text-muted-foreground">
              Looking for matching clients
            </p>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !isSearching && !searchResult && (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Client Found</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mb-4">
              We couldn't find a client matching "{activeSearch}"
            </p>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !isSearching && searchResult && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Search Result
              </h3>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Search className="w-4 h-4 mr-2" />
                New Search
              </Button>
            </div>
            <ClientDetailCard client={searchResult} />
          </div>
        )}
      </main>
    </div>
  );
};