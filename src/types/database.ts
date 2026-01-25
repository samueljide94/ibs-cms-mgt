// Database types for IBS Portal

export type AppRole = 'Admin' | 'Manager' | 'Viewer';
export type PositionType = 'MD' | 'Management' | 'QA' | 'HOD' | 'DevOps' | 'Engineer' | 'Senior' | 'Junior' | 'Trainee' | 'NYSC' | 'IT_Swiss';
export type EnvironmentType = 'Production' | 'Test' | 'DR' | 'Development';

// Positions that have restricted edit access
export const RESTRICTED_POSITIONS: PositionType[] = ['Junior', 'Trainee', 'NYSC', 'IT_Swiss'];

export interface WebUser {
  user_id: number;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  birth_day: number;
  birth_month: string;
  position: PositionType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: number;
  role: AppRole;
}

export interface Client {
  client_id: number;
  client_code: string;
  client_name: string;
  industry: string | null;
  division: string | null;
  contact_person: string | null;
  contact_email: string | null;
  notes: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemType {
  system_type_id: number;
  system_type_name: string;
  description: string | null;
  is_active: boolean;
}

export interface ClientSystem {
  system_id: number;
  client_id: number;
  system_type_id: number;
  system_name: string;
  environment: EnvironmentType | null;
  host: string | null;
  ip_address: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  system_type?: SystemType;
}

export interface Credential {
  credential_id: number;
  system_id: number;
  credential_type: string | null;
  username: string | null;
  password_value: string;
  notes: string | null;
  expiry_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CredentialAudit {
  audit_id: number;
  credential_id: number | null;
  user_id: number | null;
  action: 'VIEW' | 'COPY' | 'EDIT' | 'DELETE' | 'CREATE';
  field_copied: string | null;
  client_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
}

// Combined types for UI
export interface ClientWithSystems extends Client {
  systems: (ClientSystem & { credentials: Credential[] })[];
}

export interface CredentialWithContext extends Credential {
  system: ClientSystem;
  client: Client;
}