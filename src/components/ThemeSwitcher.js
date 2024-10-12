import React, { useContext } from 'react';

// Material
import { IconButton } from '@mui/material';

// Iconify Icons
import { Icon } from '@iconify/react';
import baselineBrightnessHigh from '@iconify/icons-ic/baseline-brightness-high';
import baselineBrightness4 from '@iconify/icons-ic/baseline-brightness-4';

import { AppContext } from 'src/AppContext';

export default function ThemeSwitcher() {
  const { darkMode, toggleTheme } = useContext(AppContext);

  return (
    <IconButton
      onClick={() => {
        toggleTheme();
      }}
    >
      {darkMode ? (
        <Icon icon={baselineBrightness4} />
      ) : (
        <Icon icon={baselineBrightnessHigh} />
      )}
    </IconButton>
  );
}
