// Database types for the application
export type CredentialType = 'rdp' | 'vpn' | 'server' | 'database' | 'portal' | 'other';
export type EnvironmentType = 'production' | 'test' | 'dr' | 'portal';

export interface Client {
  id: string;
  name: string;
  code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientCredential {
  id: string;
  client_id: string;
  credential_type: CredentialType;
  environment: EnvironmentType;
  label: string | null;
  ip_address: string | null;
  hostname: string | null;
  port: string | null;
  username: string | null;
  password: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

// Combined type for search results
export interface ClientWithCredentials extends Client {
  credentials: ClientCredential[];
}
