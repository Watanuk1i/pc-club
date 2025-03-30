export interface Computer {
  id: number;
  name: string;
  type: 'pc' | 'tv';
  zone: string;
  bootcamp?: number;
  status: 'free' | 'busy' | 'maintenance';
  specs?: {
    cpu: string;
    gpu: string;
    ram: string;
    monitor: string;
  };
  price: number;
}

const generateComputers = (): Computer[] => {
  const computers: Computer[] = [];

  // Генерируем стандартные ПК
  for (let i = 1; i <= 15; i++) {
    computers.push({
      id: i,
      name: `PC ${i}`,
      type: 'pc',
      zone: 'Стандарт',
      status: Math.random() > 0.7 ? 'busy' : Math.random() > 0.9 ? 'maintenance' : 'free',
      specs: {
        cpu: 'Intel Core i7-13700K',
        gpu: 'NVIDIA RTX 4070',
        ram: '32GB DDR5',
        monitor: '240Hz 27" ASUS TUF'
      },
      price: 100
    });
  }

  // Генерируем VIP буткемпы
  for (let camp = 1; camp <= 3; camp++) {
    for (let i = 1; i <= 5; i++) {
      computers.push({
        id: 15 + (camp - 1) * 5 + i,
        name: `VIP ${i}`,
        type: 'pc',
        zone: 'VIP',
        bootcamp: camp,
        status: Math.random() > 0.7 ? 'busy' : Math.random() > 0.9 ? 'maintenance' : 'free',
        specs: {
          cpu: 'Intel Core i9-13900K',
          gpu: 'NVIDIA RTX 4090',
          ram: '64GB DDR5',
          monitor: '360Hz 27" ASUS ROG'
        },
        price: 200
      });
    }
  }

  // Добавляем ТВ зоны
  const tvZones: Computer[] = [
    {
      id: 31,
      name: 'PlayStation 5',
      type: 'tv' as const,
      zone: 'TV Zone',
      status: 'free',
      specs: {
        cpu: 'PlayStation 5',
        gpu: 'AMD RDNA 2',
        ram: '16GB GDDR6',
        monitor: '65" 4K HDR TV'
      },
      price: 250
    },
    {
      id: 32,
      name: 'Xbox Series X',
      type: 'tv' as const,
      zone: 'TV Zone',
      status: 'busy',
      specs: {
        cpu: 'Xbox Series X',
        gpu: 'AMD RDNA 2',
        ram: '16GB GDDR6',
        monitor: '65" 4K HDR TV'
      },
      price: 250
    },
    {
      id: 33,
      name: 'Nintendo Switch',
      type: 'tv' as const,
      zone: 'TV Zone',
      status: 'free',
      specs: {
        cpu: 'Nintendo Switch',
        gpu: 'NVIDIA Tegra X1',
        ram: '4GB',
        monitor: '55" 4K HDR TV'
      },
      price: 200
    }
  ];

  return [...computers, ...tvZones];
};

export const mockComputers = generateComputers();

export const getComputersByZone = () => {
  const zones = new Map<string, Map<number | null, Computer[]>>();
  
  mockComputers.forEach(computer => {
    if (!zones.has(computer.zone)) {
      zones.set(computer.zone, new Map([[null, []]]));
    }
    
    const zoneMap = zones.get(computer.zone)!;
    
    if (computer.bootcamp) {
      if (!zoneMap.has(computer.bootcamp)) {
        zoneMap.set(computer.bootcamp, []);
      }
      zoneMap.get(computer.bootcamp)?.push(computer);
    } else {
      zoneMap.get(null)?.push(computer);
    }
  });

  return zones;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'free':
      return 'success';
    case 'busy':
      return 'error';
    case 'maintenance':
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'free':
      return 'Свободен';
    case 'busy':
      return 'Занят';
    case 'maintenance':
      return 'Обслуживание';
    default:
      return status;
  }
}; 