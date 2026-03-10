export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Staff' | 'Viewer';
  status: 'Active' | 'Inactive';
  profileImage: string;
  addDate: string;
  lastLogin: string;
}

export interface LoginActivity {
  id: number;
  userId: number;
  loginTime: string;
  logoutTime: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Failed';
  failureReason: string;
}
