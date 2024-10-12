import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function SeeMoreTypography({ variant, text }) {
  const limit = 30;
  const [showContent, setShowContent] = useState(false);

  if (!text) {
    return null;
  }

  const truncatedText = showContent ? text : text.slice(0, limit) + '...';

  const handleToggleContent = () => {
    setShowContent(!showContent);
  };

  const linkText = showContent ? 'See Less' : 'See More';

  return (
    <Typography variant={variant}>
      {truncatedText}
      {text.length > limit && (
        <Link component="button" onClick={handleToggleContent} color="primary">
          {linkText}
        </Link>
      )}
    </Typography>
  );
}
