import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Computer as ComputerIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Компьютеры"
          value="/"
          icon={<ComputerIcon />}
        />
        <BottomNavigationAction
          label="Бронирования"
          value="/bookings"
          icon={<EventNoteIcon />}
        />
        <BottomNavigationAction
          label="Профиль"
          value="/profile"
          icon={<PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation; 