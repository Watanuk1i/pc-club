interface ComputerStatus {
  status: string;
  result: number;
  remainTime?: number;
  currentDBTime?: string;
}

class ComputerService {
  private static instance: ComputerService;
  private statusCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): ComputerService {
    if (!ComputerService.instance) {
      ComputerService.instance = new ComputerService();
    }
    return ComputerService.instance;
  }

  async getComputerStatus(idInPDU: string, UUID: string): Promise<ComputerStatus> {
    try {
      const response = await fetch('ajax_PS/getStatus.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idInPDU,
          UUID
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении статуса компьютера');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при получении статуса:', error);
      throw error;
    }
  }

  startStatusChecking(idInPDU: string, UUID: string, interval: number, callback: (status: ComputerStatus) => void) {
    // Остановим предыдущую проверку для этого компьютера, если она была
    this.stopStatusChecking(UUID);

    const checkStatus = async () => {
      try {
        const status = await this.getComputerStatus(idInPDU, UUID);
        callback(status);
      } catch (error) {
        console.error('Ошибка при проверке статуса:', error);
      }
    };

    // Запускаем первую проверку сразу
    checkStatus();

    // Запускаем периодическую проверку
    const intervalId = setInterval(checkStatus, interval);
    this.statusCheckIntervals.set(UUID, intervalId);
  }

  stopStatusChecking(UUID: string) {
    const intervalId = this.statusCheckIntervals.get(UUID);
    if (intervalId) {
      clearInterval(intervalId);
      this.statusCheckIntervals.delete(UUID);
    }
  }

  async stopSession(UUID: string): Promise<void> {
    try {
      const response = await fetch('/api/stopSessionFromGuest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UUID
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при остановке сессии');
      }
    } catch (error) {
      console.error('Ошибка при остановке сессии:', error);
      throw error;
    }
  }
}

export const computerService = ComputerService.getInstance();
export type { ComputerStatus }; 