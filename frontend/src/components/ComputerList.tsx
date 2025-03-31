import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Tv as TvIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { mockComputers, getComputersByZone, getStatusColor, getStatusText, Computer } from '../mocks/computersMock';
import useTelegram from '../hooks/useTelegram';
import LoadingState from './common/LoadingState';
import CardWithHover from './common/CardWithHover';
import { ComputerStatus } from '../types/computer';

interface BookingDialogProps {
  open: boolean;
  computer: Computer | null;
  onClose: () => void;
  onBook: (hours: number) => void;
}

interface SpecsDialogProps {
  open: boolean;
  computer: Computer | null;
  onClose: () => void;
}

const SpecsDialog: React.FC<SpecsDialogProps> = ({ open, computer, onClose }) => {
  const { tg } = useTelegram();

  useEffect(() => {
    if (open) {
      tg?.BackButton.show();
      tg?.BackButton.onClick(onClose);
    } else {
      tg?.BackButton.hide();
      tg?.BackButton.offClick(onClose);
    }
  }, [open, onClose, tg]);

  if (!computer) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={!!tg}>
      <DialogTitle>Конфигурация {computer.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant="body1">
            {computer.specs}
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>Стоимость:</strong> {computer.price_per_hour} руб/час
          </Typography>
        </Stack>
      </DialogContent>
      {!tg && (
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

const BookingDialog: React.FC<BookingDialogProps> = ({ open, computer, onClose, onBook }) => {
  const [hours, setHours] = useState(1);
  const { tg } = useTelegram();
  const totalCost = computer ? hours * computer.price_per_hour : 0;

  useEffect(() => {
    if (open && computer && tg) {
      const mainButton = tg.MainButton;
      mainButton.text = `Забронировать за ${totalCost} руб`;
      mainButton.show();
      mainButton.onClick(() => {
        onBook(hours);
        onClose();
      });
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
    } else {
      tg?.MainButton.hide();
      tg?.MainButton.offClick(() => {});
      tg?.BackButton.hide();
      tg?.BackButton.offClick(onClose);
    }
  }, [open, hours, computer, onClose, onBook, tg, totalCost]);

  const handleBook = () => {
    onBook(hours);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={!!tg}>
      <DialogTitle>Забронировать {computer?.name}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Количество часов"
          type="number"
          fullWidth
          value={hours}
          onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1 }}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Стоимость: {totalCost}₽
        </Typography>
      </DialogContent>
      {!tg && (
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button onClick={handleBook} color="primary">
            Забронировать
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

const ComputerCard: React.FC<{ 
  computer: Computer; 
  onBook: (computer: Computer) => void;
  onShowSpecs: (computer: Computer) => void;
}> = ({ computer, onBook, onShowSpecs }) => {
  const getStatusIcon = (status: ComputerStatus) => {
    switch (status) {
      case 'available': return <CheckCircleIcon />;
      case 'occupied': return <TimerIcon />;
      case 'maintenance': return <ErrorIcon />;
      default: return <ComputerIcon />;
    }
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <ComputerIcon sx={{ mr: 1 }} />
            <Typography variant="body1" component="div">
              {computer.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => onShowSpecs(computer)}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Chip
            size="small"
            icon={getStatusIcon(computer.status)}
            label={getStatusText(computer.status)}
            color={getStatusColor(computer.status)}
          />
          <Typography variant="body2" color="text.secondary">
            {computer.price_per_hour} ₽/час
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button
          size="small"
          color="primary"
          disabled={computer.status !== 'available'}
          onClick={() => onBook(computer)}
          fullWidth
        >
          Забронировать
        </Button>
      </CardActions>
    </Card>
  );
};

const ComputerList: React.FC = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [specsDialogOpen, setSpecsDialogOpen] = useState(false);
  const zones = getComputersByZone();
  const { tg } = useTelegram();

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    fetchComputers();
  }, [tg]);

  const fetchComputers = async () => {
    try {
      const response = await fetch('/api/computers');
      if (!response.ok) {
        throw new Error('Не удалось загрузить список компьютеров');
      }
      const data = await response.json();
      setComputers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (computer: Computer) => {
    setSelectedComputer(computer);
    setBookingDialogOpen(true);
  };

  const handleShowSpecs = (computer: Computer) => {
    setSelectedComputer(computer);
    setSpecsDialogOpen(true);
  };

  const handleBookingSubmit = async (hours: number) => {
    if (!selectedComputer) return;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          computer_id: selectedComputer.id,
          hours: hours
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать бронирование');
      }

      setBookingDialogOpen(false);
      fetchComputers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при бронировании');
    }
  };

  return (
    <LoadingState loading={loading} error={error}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Доступные компьютеры
        </Typography>
        <Grid container spacing={3}>
          {computers.map((computer) => (
            <Grid item xs={12} sm={6} md={4} key={computer.id}>
              <ComputerCard
                computer={computer}
                onBook={handleBookClick}
                onShowSpecs={handleShowSpecs}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <BookingDialog
        computer={selectedComputer}
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        onBook={handleBookingSubmit}
      />
      <SpecsDialog
        open={specsDialogOpen}
        computer={selectedComputer}
        onClose={() => setSpecsDialogOpen(false)}
      />
    </LoadingState>
  );
};

export default ComputerList; 