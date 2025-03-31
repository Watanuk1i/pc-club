export type ComputerStatus = 'available' | 'occupied' | 'maintenance';

export interface Computer {
  id: number;
  name: string;
  status: ComputerStatus;
  specs: string;
  price_per_hour: number;
}

export const getStatusColor = (status: ComputerStatus): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'available':
      return 'success';
    case 'occupied':
      return 'warning';
    case 'maintenance':
      return 'error';
  }
};

export const getStatusText = (status: ComputerStatus): string => {
  switch (status) {
    case 'available':
      return 'Доступен';
    case 'occupied':
      return 'Занят';
    case 'maintenance':
      return 'На обслуживании';
  }
}; 