// This file will define the shape of our admin-related data objects

export interface SubAdmin {
  _id: string;
  email: string;
  centerName: string;
  status: 'Active' | 'Inactive';
}

export interface Task {
  _id: string;
  description: string;
  assignedCenter: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export interface StatCardData {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}