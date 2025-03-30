declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          enable: () => void;
          disable: () => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        sendData: (data: any) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          query_id?: string;
        };
      };
    };
  }
}

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  const onClose = () => {
    tg?.close();
  };

  const onToggleButton = () => {
    if (tg?.MainButton.isVisible) {
      tg.MainButton.hide();
    } else {
      tg?.MainButton.show();
    }
  };

  return {
    onClose,
    onToggleButton,
    tg,
    user: tg?.initDataUnsafe?.user,
  };
};

export default useTelegram; 