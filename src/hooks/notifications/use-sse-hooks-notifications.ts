// Add this at the top of the file
export interface Notification {
  id: number | string;
  title: string;
  message?: string;
  description?: string;
  type?: string;
  read: boolean;
}

// Rest of the file remains the same