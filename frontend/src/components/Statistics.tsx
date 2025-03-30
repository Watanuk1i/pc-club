import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

interface StatisticsData {
  total_computers: number;
  active_users: number;
  daily_revenue: number;
  average_session_time: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics');
        if (!response.ok) {
          throw new Error('Не удалось загрузить статистику');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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

  const statCards = [
    {
      title: 'Всего компьютеров',
      value: stats?.total_computers || 0,
      icon: <ComputerIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: 'Активных пользователей',
      value: stats?.active_users || 0,
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      title: 'Выручка за день',
      value: `${stats?.daily_revenue || 0}₽`,
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    },
    {
      title: 'Среднее время сессии',
      value: `${stats?.average_session_time || 0} мин`,
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Статистика клуба
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                  transition: 'all 0.3s'
                }
              }}
            >
              <CardContent>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box 
                    sx={{
                      backgroundColor: `${card.color}15`,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      color: card.color
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="div"
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Statistics; 