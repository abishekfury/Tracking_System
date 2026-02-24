import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme, size }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: 0,
    margin: 16,
    maxHeight: 'calc(100vh - 32px)',
    ...(size === 'small' && {
      maxWidth: 400,
    }),
    ...(size === 'medium' && {
      maxWidth: 600,
    }),
    ...(size === 'large' && {
      maxWidth: 900,
    }),
    ...(size === 'fullscreen' && {
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: 0,
      borderRadius: 0,
    }),
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
  borderRadius: '16px 16px 0 0',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:first-of-type': {
    paddingTop: theme.spacing(3),
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
  gap: theme.spacing(1),
}));

const Modal = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  actions,
  size = 'medium',
  closable = true,
  hideBackdrop = false,
  TransitionComponent = Transition,
  ...props
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={closable ? onClose : undefined}
      TransitionComponent={TransitionComponent}
      size={size}
      hideBackdrop={hideBackdrop}
      disableEscapeKeyDown={!closable}
      {...props}
    >
      {title && (
        <StyledDialogTitle>
          <Box>
            <Typography variant="h6" component="div" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {closable && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </StyledDialogTitle>
      )}
      
      <StyledDialogContent dividers={Boolean(title && actions)}>
        {children}
      </StyledDialogContent>
      
      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

// Specialized modal components
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}) => {
  const Button = React.lazy(() => import('./Button'));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="small"
      actions={
        <React.Suspense fallback={null}>
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            color={danger ? 'error' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </React.Suspense>
      }
    >
      <Typography>{message}</Typography>
    </Modal>
  );
};

export const FormModal = ({ children, ...props }) => (
  <Modal size="medium" {...props}>
    {children}
  </Modal>
);

export const ViewModal = ({ children, ...props }) => (
  <Modal size="large" {...props}>
    {children}
  </Modal>
);

export const FullscreenModal = ({ children, ...props }) => (
  <Modal size="fullscreen" {...props}>
    {children}
  </Modal>
);

export default Modal;