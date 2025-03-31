import React from 'react';
import { Card, CardProps } from '@mui/material';

interface CardWithHoverProps extends CardProps {
  children: React.ReactNode;
}

const CardWithHover: React.FC<CardWithHoverProps> = ({ children, sx, ...props }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          transition: 'all 0.3s'
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default CardWithHover; 