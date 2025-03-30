import React, { useEffect, useState, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import NotificationService, { Notification } from '../services/NotificationService';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const notificationService = NotificationService.getInstance();

  const loadNotifications = useCallback(async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data);
  }, [notificationService]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
    handleMenuClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd.MM.yyyy HH:mm');
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '300px'
          }
        }}
      >
        <MenuItem>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Уведомления
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckIcon />}
            >
              Прочитать все
            </Button>
          )}
        </MenuItem>

        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="Нет уведомлений" />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                divider
                secondaryAction={
                  !notification.read && (
                    <IconButton
                      edge="end"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={notification.message}
                  secondary={formatDate(notification.created_at)}
                  style={{
                    opacity: notification.read ? 0.7 : 1
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationList; 