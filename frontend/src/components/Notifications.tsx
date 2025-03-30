import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Не удалось загрузить уведомления');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Не удалось отметить уведомление как прочитанное');
      }
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Не удалось отметить уведомление как прочитанное',
        severity: 'error'
      });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Не удалось удалить уведомление');
      }
      setNotifications(notifications.filter(notif => notif.id !== id));
      setSnackbar({
        open: true,
        message: 'Уведомление удалено',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Не удалось удалить уведомление',
        severity: 'error'
      });
    }
  };

  const getNotificationIcon = (type: string, read: boolean) => {
    const iconProps = { color: read ? 'disabled' as const : 'primary' as const };
    switch (type) {
      case 'error':
        return <ErrorIcon {...iconProps} color={read ? 'disabled' : 'error'} />;
      case 'success':
        return <CheckCircleIcon {...iconProps} color={read ? 'disabled' : 'success'} />;
      case 'warning':
        return <NotificationsActiveIcon {...iconProps} color={read ? 'disabled' : 'warning'} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <NotificationsIcon sx={{ mr: 2 }} />
        <Typography variant="h5">
          Уведомления
        </Typography>
      </Box>

      <Paper elevation={2}>
        {notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">
              Нет новых уведомлений
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  }
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type, notification.read)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: notification.read ? 'text.primary' : 'primary.main',
                      fontWeight: notification.read ? 'normal' : 'bold'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications; 