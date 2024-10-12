import axios from 'axios';
import { useRef, useState } from 'react';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha, styled, useTheme,
    Avatar,
    Backdrop,
    Chip,
    Dialog,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

import {
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';

// Iconify
import { Icon } from '@iconify/react';
import infoFilled from '@iconify/icons-ep/info-filled';
import baselineGetApp from '@iconify/icons-ic/baseline-get-app';

// Loader
import { PulseLoader } from "react-spinners";

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Redux
import { useSelector } from "react-redux";
import { selectMetrics } from "src/redux/statusSlice";


// Components
//import { ImageSelect } from './ImageSelect';
import EditDialog from './EditDialog';
import AddDialog from './AddDialog';

const AdminDialog = styled(Dialog)(({ theme }) => ({
    // boxShadow: theme.customShadows.z0,
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(1px)', // Fix on Mobile
    // backgroundColor: alpha(theme.palette.background.paper, 0.0),
    // borderRadius: '0px',
    // padding: '0.5em'
    // backgroundColor: alpha("#00AB88", 0.99),
}));





const KYCTypography = withStyles({
    root: {
        color: "#34B60C",
        borderRadius: '6px',
        border: '0.05em solid #34B60C',
        //fontSize: '0.5rem',
        lineHeight: '1.2',
        paddingLeft: '3px',
        paddingRight: '3px',
    }
})(Typography);

const NoneKYCTypography = withStyles({
    root: {
        color: "#454F5B",
        borderRadius: '6px',
        border: '0.05em solid #454F5B',
        //fontSize: '0.5rem',
        lineHeight: '1.2',
        paddingLeft: '3px',
        paddingRight: '3px',
    }
})(Typography);

const CoinNameTypography = withStyles({
    root: {
        color: "#3366FF"
    }
})(Typography);

const Label = withStyles({
    root: {
        color: alpha('#637381', 0.99)
    }
})(Typography);

const TokenImage = styled(Avatar)(({ theme }) => ({
    '&:hover': {
        cursor: 'pointer',
        opacity: 0.6
    },
}));

export default function EditTokenDialog({token, setToken}) {
    // const metrics = useSelector(selectMetrics);

    const theme = useTheme();
    const fileRef = useRef();

    const BASE_URL = process.env.API_URL;
    const { accountProfile, openSnackbar } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const {
        issuer,
        name,
        currency,
        md5,
        dateon
    } = token;

    // const imgUrl = `/static/tokens/${md5}.${token.ext}`;
    const imgUrl = `https://s1.xrpl.to/token/${md5}`;

    const [file, setFile] = useState(null);

    const [kyc, setKYC] = useState(token.kyc);

    const [ext, setExt] = useState(token.ext || "");

    const [imgData, setImgData] = useState(imgUrl);

    const [user, setUser] = useState(token.user);

    const [domain, setDomain] = useState(token.domain);

    const [date, setDate] = useState(token.date);

    const [slug, setSlug] = useState(token.slug);

    const [whitepaper, setWhitePaper] = useState(token.whitepaper);

    const [twitter, setTwitter] = useState(token.social?.twitter);
    const [facebook, setFacebook] = useState(token.social?.facebook);
    const [linkedin, setLinkedIn] = useState(token.social?.linkedin);
    const [instagram, setInstagram] = useState(token.social?.instagram);
    const [telegram, setTelegram] = useState(token.social?.telegram);
    const [discord, setDiscord] = useState(token.social?.discord);
    const [youtube, setYoutube] = useState(token.social?.youtube);
    const [medium, setMedium] = useState(token.social?.medium); // medium.com
    const [twitch, setTwitch] = useState(token.social?.twitch); // twitch.tv
    const [tiktok, setTiktok] = useState(token.social?.tiktok); // tiktok
    const [reddit, setReddit] = useState(token.social?.reddit); // reddit

    const [tags, setTags] = useState(token.tags);

    const handleDeleteTags = (tagToDelete) => () => {
        setTags((tags) => tags.filter((tag) => tag !== tagToDelete));
    };

    const onAddTag = (val) => {
        let newTags = [];
        const found = tags?tags.find(t => t === val):undefined;
        if (found) {
            return;
        }
        if (tags) {
            newTags.push(...tags);
            newTags.push(val);
            setTags(newTags);
        } else {
            setTags([val]);
        }
    };

    const onUpdateToken = async (data) => {
        let finish = false;
        setLoading(true);
        try {
            let res;

            const accountAdmin = accountProfile.account;
            const accountToken = accountProfile.token;

            const formdata = new FormData();
            formdata.append('avatar', file);
            formdata.append('account', accountAdmin);
            formdata.append('data', JSON.stringify(data));
            
            /*const res = await axios.post(`${BASE_URL}/admin/update_token`, formdata, {
                headers: { "Content-Type": "multipart/form-data" }
            });*/
            
            /*const body = {accountAdmin, data};

            res = await axios.post(`${BASE_URL}/admin/update_token`, body);*/

            res = await axios.post(`${BASE_URL}/admin/update_token`, formdata, {
                headers: { "Content-Type": "multipart/form-data", 'x-access-account': accountAdmin, 'x-access-token': accountToken }
            });

            if (res.status === 200) {
                const ret = res.data;
                if (ret.status) {
                    // Update myself
                    Object.assign(token, data);
                    token.time = Date.now();
                    setFile(null);
                    openSnackbar('Successfully changed the token info', 'success');
                    finish = true;
                } else {
                    // { status: false, data: null, err: 'ERR_URL_SLUG' }
                    const err = ret.err;
                    if (err === 'ERR_TRANSFER')
                        openSnackbar('Upload image error, please try again', 'error');
                    else if (err === 'ERR_GENERAL')
                        openSnackbar('Invalid data, please check again', 'error');
                    else if (err === 'ERR_URL_SLUG')
                        openSnackbar('Duplicated URL Slug', 'error');
                    else
                        openSnackbar('Internal error occured', 'error');
                }
            }
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
        if (finish)
            setToken(null);
    };

    const handleSave = () => {
        const check = slug?slug.replace(/[^a-zA-Z0-9-]/g, ""):null;
        if (!check || check !== slug) {
            openSnackbar('Invalid URL Slug, only alphabetic(A-Z, a-z, 0-9, -) allowed', 'error');
            return;
        }
        /*
        amount: 9989.174941923571,
        holders: 15415,
        kyc: true,
        offers: 57,
        trustlines: 18771,
        slug: "47c6a1d2de5ad3391a58e4f0523c16a3",
        verified: false,
        ext: "jpg"
        */

        const newToken = {};
        newToken.md5 = md5;
        newToken.domain = domain;
        newToken.user = user;
        newToken.kyc = kyc;
        newToken.ext = ext;
        newToken.date = date;

        if (slug)
            newToken.slug = slug;
        else
            newToken.slug = md5;

        newToken.whitepaper = whitepaper;
        if (tags)
            newToken.tags = tags;

        const social = {};
        if (twitter)
            social.twitter = twitter;
        if (facebook)
            social.facebook = facebook;
        if (linkedin)
            social.linkedin = linkedin;
        if (instagram)
            social.instagram = instagram;
        if (telegram)
            social.telegram = telegram;
        if (discord)
            social.discord = discord;
        if (youtube)
            social.youtube = youtube;
        if (medium)
            social.medium = medium;
        if (twitch)
            social.twitch = twitch;
        if (tiktok)
            social.tiktok = tiktok;
        if (reddit)
            social.reddit = reddit;
        
        // if (Object.keys(social).length !== 0)
        newToken.social = social;

        onUpdateToken(newToken);
    }

    const handleClose = () => {
        setToken(null);
    }

    const handleFileSelect = (e) => {
        const pickedFile = e.target.files[0];
        if (pickedFile) {
            const fileName = pickedFile.name;
            var re = /(?:\.([^.]+))?$/;
            var newExt = re.exec(fileName)[1];
            if (newExt)
                newExt = newExt.toLowerCase();

            if (newExt === 'jpg' || newExt === 'png') {
                setExt(newExt);
                setFile(pickedFile);
                // This is used as src of image
                const reader = new FileReader();
                reader.readAsDataURL(pickedFile)
                reader.onloadend = function (e) {
                    setImgData(reader.result); // data:image/jpeg;base64
                }
            }
        }
    }

    const handleGetDate = () => {
        setLoading(true);
        // https://api.xrplorer.com/custom/getTokenBirth?issuer=rPdNJ8vZtneXFnmpxfe6bN3pSiwdXKsz6t&currency=5842656172647300000000000000000000000000
        axios.get(`https://api.xrplorer.com/custom/getTokenBirth?issuer=${issuer}&currency=${currency}`)
            .then(res => {
                let ret = res.status === 200 ? res.data : undefined;
                if (ret && ret.date) {
                    let date_fixed = '';
                    try {
                        date_fixed = ret.date.split('T')[0];
                    } catch (e) {}
                    setDate(date_fixed);
                }
            }).catch(err => {
                // console.log("Error on getting created date!!!", err);
                openSnackbar('Date is still unknown, you can manually edit it', 'error');
            }).then(function () {
                // always executed
                setLoading(false);
            });
    }

    /*
        React js Resize Image Before Upload
        https://www.tutsmake.com/react-js-resize-image-before-upload/
        
        Uploading and Resizing Images with React JS
        https://github.com/CodeAT21/React-image-resize-before-upload
    */

    return (
        <>
        <Backdrop
            sx={{ color: "#000", zIndex: (theme) => theme.zIndex.modal + 1 }}
            open={loading}
        >
            {/* <HashLoader color={"#00AB55"} size={50} /> */}
            <PulseLoader color={"#FF4842"} size={10} />
        </Backdrop>
        
        <AdminDialog onClose={handleClose} open={true} sx={{p:5}} fullWidth={true} maxWidth={'md'}>
            <DialogTitle sx={{pl:4,pr:4,pt:1,pb:1}}>
                <input
                    ref={fileRef}
                    style={{ display: 'none' }}
                    // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
                    // accept='image/*'
                    accept='.png, .jpg'
                    id='contained-button-file'
                    multiple={false}
                    type='file'
                    onChange={handleFileSelect}
                />
                <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
                    <Stack direction='row' alignItems='center'>
                        <TokenImage alt={name} src={imgData}
                            sx={{ mr: 1, width: 56, height: 56 }}
                            onClick={() => fileRef.current.click()}
                        />
                        <CoinNameTypography variant="h5" noWrap color="primary">
                            {name}
                        </CoinNameTypography>
                    </Stack>

                    <Stack direction='row' sx={{p:0}} spacing={2} alignItems='center'>
                        <Tooltip title={'Save'}>
                            <IconButton color='primary' onClick={handleSave} size="large" edge="end" aria-label="save">
                                <CheckIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={'Cancel'}>
                            <IconButton color='error' onClick={handleClose} size="large" edge="end" aria-label="save">
                                <CloseIcon fontSize="inherit"/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </DialogTitle>
            <Divider />
            <Table sx={{
                [`& .${tableCellClasses.root}`]: {
                    borderBottom: "0px solid",
                    borderBottomColor: theme.palette.divider
                }
            }}>
                <TableBody>
                    <TableRow>
                        <TableCell align="right" sx={{pt:1, pb:0, width: '15%'}}>
                            <Label variant="subtitle2" noWrap>Issuer</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:1, pb:0, width: '40%'}}>
                            <Stack direction="row" spacing={1} alignItems='center' sx={{mr:2}}>
                                <Label variant="subtitle2" noWrap>{issuer}</Label>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://bithomp.com/explorer/${issuer}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <IconButton edge="end" aria-label="bithomp">
                                        <Avatar alt="bithomp" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                    </IconButton>
                                </Link>
                            </Stack>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Currency</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction="row" spacing={1} alignItems='center'>
                                <Label variant="subtitle2" noWrap>{name}</Label>
                                <Label variant="caption" noWrap>({currency})</Label>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0.5, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>MD5</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0.5, pb:0.2}}>
                            <Stack direction='row' spacing={1}>
                                <Label variant="subtitle2" noWrap>{md5}</Label>
                                <Label variant="subtitle2" noWrap>{ext.toUpperCase()}</Label>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Domain</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://${domain}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" noWrap color='primary'>{domain}</Typography>
                                </Link>
                                <EditDialog label='Domain' value={domain} setValue={setDomain}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>User</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Typography variant="subtitle2" noWrap color='primary'>{user}</Typography>
                                <EditDialog label='User' value={user} setValue={setUser}/>
                                <Tooltip title={'Click to toggle'}>
                                    <Link
                                        component="button"
                                        underline="none"
                                        variant="body2"
                                        color="inherit"
                                        onClick={() => {
                                            setKYC(!kyc);
                                        }}
                                    >
                                        <Typography variant={kyc?"kyc":"nokyc"}>KYC</Typography>
                                    </Link>
                                </Tooltip>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}></TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}></TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Created Date</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Typography variant="subtitle2" color='primary'>{date}</Typography>
                                <Tooltip title={'Get date from online'}>
                                    <IconButton onClick={handleGetDate} size="small" edge="end" aria-label="getdate">
                                        <Icon icon={baselineGetApp} />
                                    </IconButton>
                                </Tooltip>

                                <EditDialog label='Date' value={date} setValue={setDate}/>

                                <Label variant="caption" noWrap>{new Date(dateon).toISOString().split('.')[0].replace('T', ' ')}</Label>
                                <Tooltip title={'Token discovered date by the Ledger Scanner.'}>
                                    <Icon icon={infoFilled} />
                                </Tooltip>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>URL Slug</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`token/${slug}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{slug}</Typography>
                                </Link>
                                <EditDialog label='URL Slug' value={slug} setValue={setSlug}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}></TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}></TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Whitepaper</Label>
                        </TableCell>
                        <TableCell align="left" colSpan={3} sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`${whitepaper}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{whitepaper}</Typography>
                                </Link>
                                <EditDialog label='Whitepaper URL' value={whitepaper} setValue={setWhitePaper}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "1px solid",
                            borderBottomColor: theme.palette.divider
                        }
                    }}>
                        <TableCell align="right" sx={{pt:0, pb:0.5}}>
                            <Label variant="subtitle2" noWrap>Tags</Label>
                        </TableCell>
                        <TableCell align="left" colSpan={3} sx={{pt:0, pb:0.5}}>
                            <Grid container spacing={1} justifyContent="flex-start">
                                {tags && tags.map((tag, idx) => {
                                    return (
                                        <Grid item key={md5 + idx + tag}>
                                            <Chip
                                                size="small"
                                                label={tag}
                                                onDelete={handleDeleteTags(tag)}
                                            />
                                        </Grid>
                                    );
                                })}
                                <Grid item>
                                    <AddDialog label='Tag' onAddTag={onAddTag}/>
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Table sx={{
                [`& .${tableCellClasses.root}`]: {
                    borderBottom: "0px solid",
                    borderBottomColor: theme.palette.divider
                },
                tableLayout: 'fixed',
                width: '100%',
                mb: 3
            }}>
                <TableBody>
                    <TableRow>
                        <TableCell align="right" sx={{pt:1, pb:0.2, width: '15%'}}>
                            <Label variant="subtitle2" noWrap>Twitter</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:1, pb:0.2, width: '25%'}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://twitter.com/${twitter}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{twitter}</Typography>
                                </Link>
                                <EditDialog label='Twitter' value={twitter} setValue={setTwitter}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:1, pb:0.2, width: '15%'}}>
                            <Label variant="subtitle2" noWrap>YouTube</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:1, pb:0.2, width: '45%'}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://www.youtube.com/${youtube}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{youtube}</Typography>
                                </Link>
                                <EditDialog label='YouTube' value={youtube} setValue={setYoutube}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Facebook</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://www.facebook.com/${facebook}/`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{facebook}</Typography>
                                </Link>
                                <EditDialog label='Facebook' value={facebook} setValue={setFacebook}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Medium</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://medium.com/${medium}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{medium}</Typography>
                                </Link>
                                <EditDialog label='Medium' value={medium} setValue={setMedium}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>LinkedIn</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://www.linkedin.com/company/${linkedin}/`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{linkedin}</Typography>
                                </Link>
                                <EditDialog label='LinkedIn' value={linkedin} setValue={setLinkedIn}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Twitch</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://twitch.tv/${twitch}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{twitch}</Typography>
                                </Link>
                                <EditDialog label='Twitch' value={twitch} setValue={setTwitch}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Instagram</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://www.instagram.com/${instagram}/`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{instagram}</Typography>
                                </Link>
                                <EditDialog label='Instagram' value={instagram} setValue={setInstagram}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Tiktok</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://tiktok.com/${tiktok}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{tiktok}</Typography>
                                </Link>
                                <EditDialog label='Tiktok' value={tiktok} setValue={setTiktok}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Discord</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://discord.gg/${discord}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{discord}</Typography>
                                </Link>
                                <EditDialog label='Discord' value={discord} setValue={setDiscord}/>
                            </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Reddit</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://reddit.com/${reddit}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{reddit}</Typography>
                                </Link>
                                <EditDialog label='Reddit' value={reddit} setValue={setReddit}/>
                            </Stack>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="right" sx={{pt:0, pb:0.2}}>
                            <Label variant="subtitle2" noWrap>Telegram</Label>
                        </TableCell>
                        <TableCell align="left" sx={{pt:0, pb:0.2}}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://t.me/${telegram}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="subtitle2" color='primary'>{telegram}</Typography>
                                </Link>
                                <EditDialog label='Telegram' value={telegram} setValue={setTelegram}/>
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </AdminDialog>
        </>
    );
}
