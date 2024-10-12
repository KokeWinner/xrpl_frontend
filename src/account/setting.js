import React from 'react';
import axios from 'axios'
import FormData from 'form-data';
import { useState, useEffect, useRef } from 'react';

// Material
import { withStyles } from '@mui/styles';
import {
    styled,
    Card,
    IconButton,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components

const CardWrapper = styled('div')(
    ({ theme }) => `
    border: dashed 3px;
    border-radius: 5px;
    padding: 5px;
    // width: fit-content;
    &:hover {
        cursor: pointer;
    }
`
);

const CardWrapperCircle = styled('div')(
    ({ theme }) => `
    border: dashed 3px;
    border-radius: 50%;
    padding: 5px;
    width: fit-content;
    overflow: hidden;
    &:hover {
        cursor: pointer;
    }
`
);

const CardOverlay = styled('div')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    background: black;
    inset: 0;
    opacity: 0;
    z-index: 1;
    transition: opacity 0.5s;
    &:hover {
        opacity: 0.6;
    }
`
);

const CardOverlayCircle = styled('div')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    background: black;
    inset: 0;
    opacity: 0;
    z-index: 1;
    transition: opacity 0.5s;
    &:hover {
        opacity: 0.6;
    }
`
);

const FILE_UNCHANGED = 0;
const FILE_NEW = 1;
const FILE_REMOVED = 2;

export default function EditProfile() {
    const BASE_URL = process.env.API_URL;

    const fileRef1 = useRef();
    const fileRef2 = useRef();
    
    const { accountProfile, doLogIn, openSnackbar } = useContext(AppContext);
    const account = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(accountProfile?.name || '');
    const [description, setDescription] = useState(accountProfile?.description || '');

    const logoImageUrl = accountProfile?.logo?`https://s1.xrpl.to/profile/${accountProfile.logo}`:null;
    const bannerImageUrl = accountProfile?.banner?`https://s1.xrpl.to/profile/${accountProfile.banner}`:null;

    // Logo image
    const [fileUrl1, setFileUrl1] = useState(logoImageUrl);
    const [file1, setFile1] = useState(null);
    // Banner image
    const [fileUrl2, setFileUrl2] = useState(bannerImageUrl);
    const [file2, setFile2] = useState(null);

    const checkChanged = () => {
        if (!accountProfile) return false;

        if (file1)
            return true;
        else if (fileUrl1 !== logoImageUrl)
            return true;

        if (file2)
            return true;
        else if (fileUrl2 !== bannerImageUrl)
            return true;

        if (name !== accountProfile.name) return true;

        if (description !== accountProfile.description) return true;

        return false;
    }

    const checkValidation = () => {
        if (!checkChanged()) return false;
        if (!file1 && !fileUrl1) return false;
        if (!name) return false;
        if (description && description.length > 1000) return false;
        
        return true;
    }

    let canSaveChanges = checkValidation();

    const getFileFlagArray = () => {
        let flag = [0, 0]; // 0: Not changed 1: New File 2: Removed
        if (file1) {
            flag[0] = FILE_NEW;
        } else if (!fileUrl1) {
            flag[0] = FILE_REMOVED;
        }

        if (file2) {
            flag[1] = FILE_NEW;
        } else if (!fileUrl2) {
            flag[1] = FILE_REMOVED;
        }

        return flag;
    }

    const onEditProfile = async () => {
        if (!account || !accountToken) {
            openSnackbar('Please login', 'error');
            return;
        }
        setLoading(true);
        try {
            let res;

            const formdata = new FormData();

            let fileFlag = getFileFlagArray();

            if (fileFlag[0] === FILE_NEW)
                formdata.append('imgProfile', file1);
            if (fileFlag[1] === FILE_NEW)
                formdata.append('imgProfile', file2);

            const data = {};
            data.name = name;
            data.description = description;
            data.fileFlag = fileFlag;

            formdata.append('account', account);
            formdata.append('data', JSON.stringify(data));
            
            res = await axios.post(`${BASE_URL}/account/edit`, formdata, {
                headers: { "Content-Type": "multipart/form-data", 'x-access-token': accountToken }
            });

            if (res.status === 200) {
                const ret = res.data;
                if (ret.status) {
                    const profile = ret.profile;
                    doLogIn(profile);

                    openSnackbar('Edit profile successful!', 'success')
                    window.location.href = `/account/${profile.account}`;
                    // setFile(null);
                } else {
                    const err = ret.err;
                    openSnackbar(err, 'error')
                }
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const processFile = (pickedFile, idx) => {
        if (!pickedFile) return false;

        const fileName = pickedFile.name;
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(fileName)[1];
        if (ext)
            ext = ext.toLowerCase();
        if (ext === 'jpg' || ext === 'png' || ext === 'gif') {
            const size = pickedFile.size;
            if (size < 10240000) {
                // setExt(ext);
                if (idx === 1)
                    setFile1(pickedFile);
                else if (idx === 2)
                    setFile2(pickedFile);

                // This is used as src of image
                const reader = new FileReader();
                reader.readAsDataURL(pickedFile)
                reader.onloadend = function (e) {
                    if (idx === 1)
                        setFileUrl1(reader.result); // data:image/jpeg;base64
                    else if (idx === 2)
                        setFileUrl2(reader.result);
                }
                return true;
            } else {
                openSnackbar('You can only upload images size less than 10MB', 'error');
            }
        }
        return false;
    }

    const handleFileSelect1 = (e) => {
        const pickedFile = e.target.files[0];
        const ret = processFile(pickedFile, 1);
        if (!ret)
            fileRef1.current.value = null;
    }

    const handleFileSelect2 = (e) => {
        const pickedFile = e.target.files[0];
        const ret = processFile(pickedFile, 2);
        if (!ret)
            fileRef2.current.value = null;
    }

    const handleResetFile1 = (e) => {
        e.stopPropagation();
        setFile1(null);
        setFileUrl1(null);
        fileRef1.current.value = null;
    }

    const handleResetFile2 = (e) => {
        e.stopPropagation();
        setFile2(null);
        setFileUrl2(null);
        fileRef2.current.value = null;
    }

    return (
        <>
            <Stack spacing={1} sx={{mt: 4, mb:3}}>
                <Typography variant="h1a">Edit Profile</Typography>
                <Typography variant='p2'><Typography variant='s2'>*</Typography> Required fields</Typography>
                <Typography variant='p4' sx={{pt:2, pb:1}}>Logo image <Typography variant='s2'>*</Typography></Typography>
                <Typography variant='p3'>This image will also be used for navigation. 350 x 350 recommended.(Max: 10MB)</Typography>
                <CardWrapperCircle>
                    <input
                        ref={fileRef1}
                        style={{ display: 'none' }}
                        // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
                        // accept='image/*'
                        accept='.png, .jpg, .gif'
                        id='contained-button-file'
                        // multiple
                        type='file'
                        onChange={handleFileSelect1}
                    />
                    <Card
                        sx={{
                            display: 'flex',
                            width: 140,
                            height: 140,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            position: 'relative'
                        }}
                    >
                        <CardOverlayCircle
                            onClick={() => fileRef1.current.click()}
                        >
                            <IconButton
                                aria-label='close' onClick={(e) => handleResetFile1(e)}
                                sx={fileUrl1 ? { position: 'absolute', right: '1vw', top: '1vh' } : { display: 'none' }}
                            >
                                <CloseIcon color='white' />
                            </IconButton>
                        </CardOverlayCircle>
                        <img src={fileUrl1} alt='' style={fileUrl1 ? {objectFit:'cover', width: '100%', height: '100%', overflow:'hidden'} : { display: 'none' }} />
                        <ImageIcon fontSize='large' sx={fileUrl1 ? { display: 'none' } : {width: 64, height: 64}} />
                    </Card>
                </CardWrapperCircle>

                <Typography variant='p4' sx={{pt:2, pb:1}}>Banner image</Typography>
                <Typography variant='p3'>This image will appear at the top of your account page. Avoid including too much text in this banner image, as the dimensions change on different devices. 1400 x 350 recommended.(Max: 10MB)</Typography>
                <CardWrapper>
                    <input
                        ref={fileRef2}
                        style={{ display: 'none' }}
                        // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
                        // accept='image/*'
                        accept='.png, .jpg, .gif'
                        id='contained-button-file'
                        // multiple
                        type='file'
                        onChange={handleFileSelect2}
                    />
                    <Card
                        sx={{
                            display: 'flex',
                            // maxWidth: 700,
                            height: 200,
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'auto',
                            position: 'relative'
                        }}
                    >
                        <CardOverlay
                            onClick={() => fileRef2.current.click()}
                        >
                            <IconButton
                                aria-label='close' onClick={(e) => handleResetFile2(e)}
                                sx={fileUrl2 ? { position: 'absolute', right: '1vw', top: '1vh' } : { display: 'none' }}
                            >
                                <CloseIcon color='white' />
                            </IconButton>
                        </CardOverlay>
                        <img src={fileUrl2} alt='' style={fileUrl2 ? {objectFit:'cover', width: '100%', height: '100%', overflow:'hidden'} : { display: 'none' }} />
                        <ImageIcon fontSize='large' sx={fileUrl2 ? { display: 'none' } : {width: 100, height: 100}} />
                    </Card>
                </CardWrapper>

                <Typography variant='p4' sx={{pt:2, pb:1}}>Name <Typography variant='s2'>*</Typography></Typography>

                <TextField
                    id='id_profile_name'
                    placeholder='Account Name'
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
            </Stack>

            <Stack spacing={2} mb={3}>
                <Typography variant='p4'>Description</Typography>
                <Typography variant='p3'>
                    Only 0 of 1000 characters allowed.
                </Typography>
                <TextField
                    placeholder=''
                    margin='dense'
                    multiline
                    maxRows={4}
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    sx={{
                        '&.MuiTextField-root': {
                            marginTop: 1,
                            minHeight: 10
                        },
                        '& .MuiOutlinedInput-root': {
                            height: 100,
                            alignItems: 'start'
                        }
                    }}
                />
            </Stack>

            <Stack alignItems='right'>
                <LoadingButton
                    disabled={!canSaveChanges}
                    variant='contained'
                    loading={loading}
                    loadingPosition='start'
                    startIcon={<SendIcon />}
                    onClick={onEditProfile}
                    sx={{ mt: 5, mb: 6 }}
                >
                    Save Changes
                </LoadingButton>
            </Stack>
        </>
    );
}
