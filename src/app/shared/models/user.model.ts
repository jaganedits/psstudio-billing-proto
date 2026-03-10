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
