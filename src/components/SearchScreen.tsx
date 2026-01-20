import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientCard } from "@/components/ClientCard";
import { searchClients } from "@/data/mockClients";
import { Client } from "@/types/client";
import {
  Search,
  LogOut,
  Loader2,
  UserX,
  Sparkles,
} from "lucide-react";

interface SearchScreenProps {
  username: string;
  onLogout: () => void;
}

type SearchState = "idle" | "loading" | "found" | "not-found";

export const SearchScreen = ({ username, onLogout }: SearchScreenProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [foundClient, setFoundClient] = useState<Client | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setSearchState("loading");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    const client = searchClients(searchTerm);
    
    if (client) {
      setFoundClient(client);
      setSearchState("found");
    } else {
      setFoundClient(null);
      setSearchState("not-found");
    }
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchState("idle");
    setFoundClient(null);
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              Welcome, {username}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onLogout}
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
            placeholder="Search by name, email, or PCC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-20 h-11 bg-card border-0 shadow-card"
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSearch}
            disabled={!searchTerm.trim() || searchState === "loading"}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
          >
            {searchState === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {searchState === "idle" && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Search for Clients</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
              Enter a name, email address, or PCC number to find client information
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Try searching:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Samuel", "A200137964", "jane.smith"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchTerm(term);
                    }}
                    className="px-3 py-1.5 text-xs font-mono bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {searchState === "loading" && (
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

        {searchState === "not-found" && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <UserX className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Client Found</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mb-4">
              We couldn't find a client matching "{searchTerm}"
            </p>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear Search
            </Button>
          </div>
        )}

        {searchState === "found" && foundClient && (
          <ClientCard client={foundClient} />
        )}
      </div>

      {/* Footer */}
      {searchState === "found" && (
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
