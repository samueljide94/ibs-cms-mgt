import { Client } from "@/types/client";

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Samuel Ogunlade",
    email: "osamuel@example.com",
    phone: "+1 (555) 123-4567",
    pcc: "A200137964",
    status: "active",
    portfolio: {
      totalValue: "$125,430.00",
      accounts: 3,
      lastActivity: "2 hours ago",
    },
    accountManager: "Sarah Johnson",
    joinDate: "Jan 2023",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 234-5678",
    pcc: "A200137582",
    status: "active",
    portfolio: {
      totalValue: "$89,250.00",
      accounts: 2,
      lastActivity: "1 day ago",
    },
    accountManager: "Mike Chen",
    joinDate: "Mar 2022",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 345-6789",
    pcc: "A220000275",
    status: "pending",
    portfolio: {
      totalValue: "$45,780.00",
      accounts: 1,
      lastActivity: "5 days ago",
    },
    accountManager: "Sarah Johnson",
    joinDate: "Nov 2023",
  },
];

export const searchClients = (query: string): Client | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return mockClients.find(
    (client) =>
      client.name.toLowerCase().includes(normalizedQuery) ||
      client.email.toLowerCase().includes(normalizedQuery) ||
      client.pcc.toLowerCase().includes(normalizedQuery)
  ) || null;
};
