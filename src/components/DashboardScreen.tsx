import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientDetailCard } from "@/components/ClientDetailCard";
import { useSearchClients, useAllClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  LogOut,
  Loader2,
  Building2,
  Sparkles,
  Database,
} from "lucide-react";

export const DashboardScreen = () => {
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: searchResult, isLoading: isSearching, isError } = useSearchClients(activeSearch);
  const { data: allClients } = useAllClients();

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

  const displayName = user?.email?.split("@")[0] || "User";
  const hasSearched = activeSearch.length > 0;

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground truncate max-w-[180px]">
              {displayName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients, IPs, usernames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-20 h-11 bg-card border-0 shadow-card"
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isSearching}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {!hasSearched && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Search for Clients</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mb-4">
              Search by client name, IP address, or username
            </p>
            
            {allClients && allClients.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                  <Database className="w-3 h-3" />
                  {allClients.length} clients in database
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allClients.slice(0, 5).map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSearchTerm(client.name);
                        setActiveSearch(client.name);
                      }}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors truncate max-w-[120px]"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(!allClients || allClients.length === 0) && (
              <div className="mt-6 p-4 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">
                  No clients in database yet. Add clients to get started.
                </p>
              </div>
            )}
          </div>
        )}

        {isSearching && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Searching...</h3>
            <p className="text-sm text-muted-foreground">
              Looking for matching clients
            </p>
          </div>
        )}

        {hasSearched && !isSearching && !searchResult && (
          <div className="p-6 text-center animate-fade-in">
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

        {hasSearched && !isSearching && searchResult && (
          <ClientDetailCard client={searchResult} />
        )}
      </div>

      {/* Footer */}
      {hasSearched && searchResult && (
        <div className="p-3 bg-secondary/50 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="w-full text-muted-foreground"
          >
            <Search className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </div>
      )}
    </div>
  );
};
