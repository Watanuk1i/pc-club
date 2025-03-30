import axios from 'axios';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  created_at: string;
  read: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private socket: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;

  private constructor() {
    // Задержка инициализации WebSocket для уменьшения нагрузки при старте
    setTimeout(() => this.initWebSocket(), 2000);
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initWebSocket() {
    try {
      // Проверяем, доступен ли Telegram WebApp
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        this.userId = tg.initDataUnsafe.user.id.toString();
      } else {
        // Если нет, используем временный ID
        this.userId = 'web-user';
      }

      if (this.socket?.readyState === WebSocket.OPEN) {
        return; // Соединение уже установлено
      }

      this.socket = new WebSocket(`ws://localhost:8000/ws/notifications/${this.userId}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket соединение установлено');
        this.reconnectAttempts = 0; // Сбрасываем счетчик попыток при успешном подключении
      };

      this.socket.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        this.handleNewNotification(notification);
      };

      this.socket.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
      };

      this.socket.onclose = () => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Попытка переподключения ${this.reconnectAttempts} из ${this.maxReconnectAttempts}`);
          setTimeout(() => this.initWebSocket(), this.reconnectTimeout);
        } else {
          console.log('Достигнуто максимальное количество попыток переподключения');
        }
      };
    } catch (error) {
      console.error('Ошибка при инициализации WebSocket:', error);
    }
  }

  private handleNewNotification(notification: Notification) {
    try {
      // Если доступен Telegram WebApp, отправляем уведомление через него
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(notification.message);
      }
      
      // Запрашиваем разрешение на отправку уведомлений, если оно не предоставлено
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Отправляем системное уведомление, если разрешено
      if (Notification.permission === 'granted') {
        new Notification('PC Club', { 
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Ошибка при обработке уведомления:', error);
    }
  }

  public async getNotifications(): Promise<Notification[]> {
    try {
      if (!this.userId) {
        return [];
      }
      const response = await axios.get(`/api/notifications/user/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении уведомлений:', error);
      return [];
    }
  }

  public async markAsRead(notificationId: number): Promise<void> {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Ошибка при отметке уведомления как прочитанного:', error);
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      if (!this.userId) {
        return;
      }
      await axios.put(`/api/notifications/user/${this.userId}/read-all`);
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    }
  }
}

export default NotificationService; 