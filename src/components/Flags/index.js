import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

const FlagIcon = ({ icon, tooltip }) => (
  <Tooltip title={tooltip}>
    <Icon icon={icon} style={{ fontSize: '24px' }} />
  </Tooltip>
);

export default function FlagsContainer({ Flags }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {Flags & 1 && <FlagIcon icon="mdi:transfer" tooltip="Transferable" />}
      {Flags & 2 && <FlagIcon icon="mdi:cash-multiple" tooltip="Only XRP" />}
      {Flags & 4 && <FlagIcon icon="mdi:account-key" tooltip="TrustLine Required" />}
      {Flags & 8 && <FlagIcon icon="mdi:lock" tooltip="Burnable" />}
    </Stack>
  );
}