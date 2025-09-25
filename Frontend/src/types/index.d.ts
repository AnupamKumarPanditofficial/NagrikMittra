// src/types/index.d.ts

// Defines the structure for a single complaint object
export interface Complaint {
  _id: string;
  userName: string;
  category: 'Roads' | 'Water' | 'Waste' | 'Electricity';
  description: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  submittedAt: string;
}