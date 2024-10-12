import {
  Box,
  Typography,
  Container,
  Button,
  OutlinedInput,
  styled
} from '@mui/material';
import Head from 'next/head';

const MainContent = styled(Box) (
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
`
);

const TopWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  width: 100%;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing(6)};
`
);

const OutlinedInputWrapper = styled(OutlinedInput)(
  ({ theme }) => `
    background-color: ${theme.colors.alpha.white[100]};
`
);

const ButtonSearch = styled(Button)(
  ({ theme }) => `
    margin-right: -${theme.spacing(1)};
`
);

function Status404() {
  return (
    <>
      <Head>
        <title>Status - 404</title>
      </Head>
      <MainContent>
        <TopWrapper>
          <Container maxWidth="md">
            <Box textAlign="center">
              <img alt="404" height={180} src="/static/status/404.svg" />
              <Typography variant="h2" sx={{ my: 2 }}>
                The page you were looking for doesn't exist.
              </Typography>
              {/* <Typography
                variant="h4"
                color="text.secondary"
                fontWeight="normal"
                sx={{ mb: 4 }}
              >
                It's on us, we moved the content to a different page. The search
                below should help!
              </Typography> */}
              <Button href="/" variant="contained">
                Go to homepage
              </Button>
            </Box>
          </Container>
        </TopWrapper>
      </MainContent>
    </>
  );
}

export default Status404;
