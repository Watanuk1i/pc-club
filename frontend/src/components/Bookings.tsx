import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface Booking {
  id: number;
  computer_name: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/bookings');
        if (!response.ok) {
          throw new Error('Не удалось загрузить список бронирований');
        }
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : [
          {
            id: 1,
            computer_name: 'PC-1',
            start_time: '2024-02-20T14:00:00',
            end_time: '2024-02-20T16:00:00',
            status: 'active'
          },
          {
            id: 2,
            computer_name: 'PC-2',
            start_time: '2024-02-21T10:00:00',
            end_time: '2024-02-21T12:00:00',
            status: 'completed'
          }
        ]);
      } catch (err) {
        console.error('Ошибка при загрузке бронирований:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        // Используем тестовые данные в случае ошибки
        setBookings([
          {
            id: 1,
            computer_name: 'PC-1',
            start_time: '2024-02-20T14:00:00',
            end_time: '2024-02-20T16:00:00',
            status: 'active'
          },
          {
            id: 2,
            computer_name: 'PC-2',
            start_time: '2024-02-21T10:00:00',
            end_time: '2024-02-21T12:00:00',
            status: 'completed'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
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
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Мои бронирования
      </Typography>
      <List>
        {bookings.length === 0 ? (
          <ListItem>
            <ListItemText primary="У вас пока нет бронирований" />
          </ListItem>
        ) : (
          bookings.map((booking) => (
            <ListItem
              key={booking.id}
              secondaryAction={
                booking.status === 'active' && (
                  <IconButton edge="end" aria-label="cancel">
                    <CancelIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={booking.computer_name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {formatDateTime(booking.start_time)}
                    </Typography>
                    {' - '}
                    <Typography component="span" variant="body2" color="text.primary">
                      {formatDateTime(booking.end_time)}
                    </Typography>
                    <br />
                    <Chip
                      size="small"
                      label={getStatusText(booking.status)}
                      color={getStatusColor(booking.status) as any}
                      sx={{ mt: 1 }}
                    />
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default Bookings; 