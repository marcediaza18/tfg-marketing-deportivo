import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

export function ConfirmDeleteDialog({
  open,
  itemLabel,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  itemLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Seguro que quieres eliminar <strong>{itemLabel}</strong>? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
