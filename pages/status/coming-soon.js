import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    Link,
    OutlinedInput,
    styled,
    Typography,
} from '@mui/material';

import Head from 'next/head';
import Logo from 'src/components/Logo';

import FacebookIcon from '@mui/icons-material/Facebook';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';

const MainContent = styled(Box)(
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

const TypographyH1 = styled(Typography)(
    ({ theme }) => `
        font-size: ${theme.typography.pxToRem(75)};
`
);

let color = 'black';//webxtor SEO fix
let bgcolor = 'white';
if (typeof theme !== 'undefined' && theme.colors ) {
	color = theme.colors.alpha.black[50];
	bgcolor = theme.colors.alpha.white[100];
}
const TypographyH3 = styled(Typography)(
    ({ theme }) => `
        color: ${color};/*$000{theme.colors.alpha.black[50]};*/
`
);

const OutlinedInputWrapper = styled(OutlinedInput)(
    ({ theme }) => `
        background-color: ${bgcolor};/*$000{theme.colors.alpha.white[100]};*/
`
);

const ButtonNotify = styled(Button)(
    ({ theme }) => `
        margin-right: -${theme.spacing(1)};
`
);

export default function StatusComingSoon() {
    const calculateTimeLeft = () => {
        // const difference = +new Date(`2023`) - +new Date();
        const difference = +new Date(`2023`) - 1000 * 60 * 60 * 24 * 30 * 4 - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <Box textAlign="center" px={3}>
                <TypographyH1 variant="h1">{timeLeft[interval]}</TypographyH1>
                <TypographyH3 variant="h3">{interval}</TypographyH3>
            </Box>
        );
    });

    return (
        <>
            <Head>
                <title>Status - Coming Soon</title>
            </Head>
            <MainContent>
                <TopWrapper>
                    <Container maxWidth="md">
                        <Logo />
                        <Box textAlign="center" mb={3}>
                            <Container maxWidth="xs">
                                <Typography variant="h1" sx={{ mt: 4, mb: 2 }}>
                                    Coming Soon
                                </Typography>
                                <Typography
                                    variant="h3"
                                    color="text.secondary"
                                    fontWeight="normal"
                                    sx={{ mb: 4 }}
                                >
                                    We're diligently working on adding the final features before our much-anticipated launch!
                                </Typography>
                            </Container>
                          <img
                            alt="Coming Soon"
                            height={200}
                            src="/static/status/coming-soon.svg"
                          />
                        </Box>

                        <Box display="flex" justifyContent="center">
                            {timerComponents.length ? timerComponents : <>Time's up!</>}
                        </Box>

                        <Container maxWidth="sm">
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <FormControl variant="outlined" fullWidth>
                                    <OutlinedInputWrapper
                                        type="text"
                                        placeholder="Enter your email address here..."
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <ButtonNotify variant="contained" size="small">
                                                    Notify Me
                                                </ButtonNotify>
                                            </InputAdornment>
                                        }
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <MailTwoToneIcon />
                                            </InputAdornment>
                                        }
                                    />
                                    <FormHelperText>
                                    We'll send you an email as soon as our feature goes live!
                                    </FormHelperText>
                                </FormControl>
                                <Divider sx={{ my: 4 }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Link
                                        href="https://www.facebook.com/xrpl.to/"
                                        sx={{ mt: 2, display: 'inline-flex' }}
                                        underline="none"
                                        target="_blank"
                                        rel="noreferrer noopener nofollow"
                                    >
                                        <IconButton color="primary">
                                            <FacebookIcon />
                                        </IconButton>
                                    </Link>
                                  
                                    <Link
                                      href="https://www.twitter.com/xrplto/"
                                      sx={{ mt: 2, display: 'inline-flex' }}
                                      underline="none"
                                      target="_blank"
                                      rel="noreferrer noopener nofollow"
                                    >
                                        <IconButton color="primary">
                                            <TwitterIcon />
                                        </IconButton>
                                    </Link>

                                    <Link
                                        href="https://t.me/xrplto"
                                        sx={{ mt: 2, display: 'inline-flex' }}
                                        underline="none"
                                        target="_blank"
                                        rel="noreferrer noopener nofollow"
                                    >
                                        <IconButton color="primary">
                                            <TelegramIcon />
                                        </IconButton>
                                    </Link>

                                    <Link
                                      href="https://www.instagram.com/xrpl.to/"
                                      sx={{ mt: 2, display: 'inline-flex' }}
                                      underline="none"
                                      target="_blank"
                                      rel="noreferrer noopener nofollow"
                                    >
                                        <IconButton color="primary">
                                            <InstagramIcon />
                                        </IconButton>
                                    </Link>
                                </Box>
                            </Box>
                        </Container>
                    </Container>
                </TopWrapper>
            </MainContent>
        </>
    );
}

