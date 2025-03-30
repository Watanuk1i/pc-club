import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon
} from '@mui/icons-material';

const Profile: React.FC = () => {
  // В будущем данные будут загружаться из API
  const user = {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    level: 'Постоянный клиент',
    bonusPoints: 150,
    totalBookings: 12
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mr: 2
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">{user.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {user.level}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={user.email}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText
                primary="Телефон"
                secondary={user.phone}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText
                primary="Бонусные баллы"
                secondary={`${user.bonusPoints} баллов`}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="Всего бронирований"
                secondary={user.totalBookings}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 