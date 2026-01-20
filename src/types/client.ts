export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  pcc: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  portfolio: {
    totalValue: string;
    accounts: number;
    lastActivity: string;
  };
  accountManager?: string;
  joinDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    role: string;
  } | null;
}
