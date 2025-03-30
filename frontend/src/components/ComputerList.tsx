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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { mockComputers, getComputersByZone, getStatusColor, getStatusText, Computer } from '../mocks/computersMock';
import useTelegram from '../hooks/useTelegram';

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

  if (!computer?.specs) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={!!tg}>
      <DialogTitle>Конфигурация {computer.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant="body1">
            <strong>CPU:</strong> {computer.specs.cpu}
          </Typography>
          <Typography variant="body1">
            <strong>GPU:</strong> {computer.specs.gpu}
          </Typography>
          <Typography variant="body1">
            <strong>RAM:</strong> {computer.specs.ram}
          </Typography>
          <Typography variant="body1">
            <strong>Монитор:</strong> {computer.specs.monitor}
          </Typography>
          <Divider />
          <Typography variant="body1">
            <strong>Стоимость:</strong> {computer.price} руб/час
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

  useEffect(() => {
    if (open && computer && tg) {
      const mainButton = tg.MainButton;
      mainButton.text = `Забронировать за ${computer.price * hours} руб`;
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
  }, [open, hours, computer, onClose, onBook, tg]);

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
        {computer && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Стоимость: {computer.price * hours} руб.
          </Typography>
        )}
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
  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {computer.type === 'pc' ? <ComputerIcon sx={{ mr: 1 }} /> : <TvIcon sx={{ mr: 1 }} />}
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
            label={getStatusText(computer.status)}
            color={getStatusColor(computer.status) as any}
          />
          <Typography variant="body2" color="text.secondary">
            {computer.price} ₽/час
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button
          size="small"
          color="primary"
          disabled={computer.status !== 'free'}
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
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [specsDialogOpen, setSpecsDialogOpen] = useState(false);
  const zones = getComputersByZone();
  const { tg } = useTelegram();

  useEffect(() => {
    tg?.ready();
    tg?.expand();
  }, [tg]);

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
    
    const bookingData = {
      computerId: selectedComputer.id,
      hours: hours,
      totalPrice: selectedComputer.price * hours,
      userId: tg?.initDataUnsafe?.user?.id
    };

    // Отправляем данные в Telegram
    tg?.sendData(JSON.stringify(bookingData));
    
    // Здесь также можно отправить данные на ваш сервер
    console.log('Бронирование:', bookingData);
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      {Array.from(zones.entries()).map(([zoneName, bootcamps]) => (
        <Accordion key={zoneName} defaultExpanded={zoneName === 'VIP'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{zoneName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Array.from(bootcamps.entries()).map(([bootcampNum, computers]) => (
              <Box key={bootcampNum ?? 'main'} mb={bootcampNum ? 2 : 0}>
                {bootcampNum && (
                  <Typography variant="subtitle1" gutterBottom>
                    Буткемп {bootcampNum}
                  </Typography>
                )}
                <Grid container spacing={1}>
                  {computers.map((computer) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={computer.id}>
                      <ComputerCard 
                        computer={computer} 
                        onBook={handleBookClick}
                        onShowSpecs={handleShowSpecs}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <BookingDialog
        open={bookingDialogOpen}
        computer={selectedComputer}
        onClose={() => setBookingDialogOpen(false)}
        onBook={handleBookingSubmit}
      />

      <SpecsDialog
        open={specsDialogOpen}
        computer={selectedComputer}
        onClose={() => setSpecsDialogOpen(false)}
      />
    </Box>
  );
};

export default ComputerList; 