import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  History as HistoryIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

interface UserData {
  id: number;
  name: string;
  email: string;
  total_time: number;
  favorite_pc: string;
  booking_history: {
    date: string;
    pc_name: string;
    duration: number;
  }[];
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные пользователя');
        }
        const data = await response.json();
        setUserData(data);
        setEditForm({
          name: data.name,
          email: data.email
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить профиль');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении');
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  {userData?.name.charAt(0)}
                </Avatar>
                {editing ? (
                  <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Имя"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      margin="normal"
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="contained" type="submit">
                        Сохранить
                      </Button>
                      <Button variant="outlined" onClick={() => setEditing(false)}>
                        Отмена
                      </Button>
                    </Box>
                  </form>
                ) : (
                  <>
                    <Typography variant="h5" gutterBottom>
                      {userData?.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {userData?.email}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(true)}
                      sx={{ mt: 2 }}
                    >
                      Редактировать профиль
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <AccessTimeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {userData?.total_time} ч
                    </Typography>
                    <Typography color="textSecondary">
                      Общее время
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <StarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {userData?.favorite_pc}
                    </Typography>
                    <Typography color="textSecondary">
                      Любимый ПК
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <HistoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {userData?.booking_history.length}
                    </Typography>
                    <Typography color="textSecondary">
                      Всего бронирований
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                История бронирований
              </Typography>
              <List>
                {userData?.booking_history.map((booking, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ComputerIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`ПК: ${booking.pc_name}`}
                      secondary={`${booking.date} • ${booking.duration} ч`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile; 