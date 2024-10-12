import React from 'react';
import axios from 'axios';
import FormData from 'form-data';
import { useState, useEffect, useRef } from 'react';

// Material
import { withStyles } from '@mui/styles';
import {
  styled,
  Avatar,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  ListItemButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

// Iconify
import { Icon } from '@iconify/react';


// Loader
import { ClipLoader } from 'react-spinners';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Utils
import { fNumber } from 'src/utils/formatNumber';
import { CATEGORIES } from 'src/utils/constants';

// Components
import LoadingTextField from 'src/components/LoadingTextField';
import AddCostDialog from './AddCostDialog';
import _ from 'lodash';

const CardWrapper = styled('div')(
  ({ theme }) => `
    border: dashed 3px;
    border-radius: 5px;
    padding: 5px;
    width: fit-content;
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

const CardWrapper3 = styled('div')(
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

const DisabledButton = withStyles({
  root: {
    '&.Mui-disabled': {
      pointerEvents: 'unset', // allow :hover styles to be triggered
      cursor: 'not-allowed' // and custom cursor can be defined without :hover state
    }
  }
})(Button);

const CustomSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    border_left: 'none'
  }
}));

export default function ImportCollection() {
  const BASE_URL = 'https://api.xrpnft.com/api';

  const fileRef1 = useRef();
  const fileRef2 = useRef();
  const fileRef3 = useRef();
  const fileRef4 = useRef();

  const { accountProfile, openSnackbar } = useContext(AppContext);
  const accountAdmin = accountProfile?.account;
  const accountToken = accountProfile?.token;

  const [loading, setLoading] = useState(false);

  const [loadingTaxons, setLoadingTaxons] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('NONE');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('normal');
  const [privateCollection, setPrivateCollection] = useState('no');

  const [issuer, setIssuer] = useState(''); // rJeBz69krYh8sXb8uKsEE22ADzbi1Z4yF2
  const [taxons, setTaxons] = useState([]);

  const [selectedTaxons, setSelectedTaxons] = useState([]);
  const [rarity, setRarity] = useState('score');

  // Logo image
  const [fileUrl1, setFileUrl1] = useState(null);
  const [file1, setFile1] = useState(null);
  // Featured image
  const [fileUrl2, setFileUrl2] = useState(null);
  const [file2, setFile2] = useState(null);
  // Banner image
  const [fileUrl3, setFileUrl3] = useState(null);
  const [file3, setFile3] = useState(null);

  const [valid1, setValid1] = useState(false); // Name validation check
  const [valid2, setValid2] = useState(false); // Slug validation check
  const [passphrase, setPassPhrase] = useState('');
  const [validPassword, setValidPassword] = useState(true);

  let canImport =
    file1 &&
    issuer &&
    name &&
    slug &&
    valid1 &&
    valid2 &&
    validPassword &&
    taxons.length > 0;

  const getTaxons = (issuer) => {
    if (!accountAdmin || !accountToken) {
      openSnackbar('Please login', 'error');
      return;
    }

    setLoadingTaxons(true);

    // https://api.xrpnft.com/api/taxon/issuer/rJeBz69krYh8sXb8uKsEE22ADzbi1Z4yF2
    axios
      .get(`${BASE_URL}/taxon/issuer/${issuer}`, {
        headers: {
          'x-access-account': accountAdmin,
          'x-access-token': accountToken
        }
      })
      .then((res) => {
        try {
          if (res.status === 200 && res.data) {
            const ret = res.data;
            setTaxons(ret.taxons);
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => {
        console.log('err->>', err);
      })
      .then(function () {
        // Always executed
        setLoadingTaxons(false);
      });
  };

  useEffect(() => {
    if (!issuer) {
      setTaxons([]);
      setSelectedTaxons([]);
    } else {
      getTaxons(issuer);
    }
  }, [issuer]);

  const onImportCollection = async () => {
    if (!accountAdmin || !accountToken) {
      openSnackbar('Please login', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;

      const formdata = new FormData();

      let fileFlag = [true, false, false, false];
      formdata.append('imgCollection', file1);
      if (file2) {
        fileFlag[1] = true;
        formdata.append('imgCollection', file2);
      }
      if (file3) {
        fileFlag[2] = true;
        formdata.append('imgCollection', file3);
      }

      const data = {};
      data.name = name;
      data.category = category;
      data.slug = slug;
      data.description = description;
      data.fileFlag = fileFlag;
      // data.type = type;
      data.private = privateCollection;
      data.taxon = selectedTaxons;
      data.rarity = rarity;

      data.passphrase = passphrase;

      formdata.append('issuer', issuer);
      formdata.append('account', accountAdmin);
      formdata.append('data', JSON.stringify(data));

      // https://api.xrpnft.com/api/collection/import
      res = await axios.post(`${BASE_URL}/collection/import`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-account': accountAdmin,
          'x-access-token': accountToken
        }
      });

      if (res.status === 200) {
        const ret = res.data;
        if (ret.status) {
          const data = ret.data;
          /*{
                        "name": "FRACTAL-BBB",
                        "externalLink": "",
                        "description": "",
                        "collection": "",
                        "Flags": 13,
                        "Issuer": "rEBKhngY8izMvRrgGg3Yh5zdiQgHH9cExg",
                        "minter": "xrpnft.com",
                        "image": "QmbUaafMaftkUTt44DVdTaSwgKzf51UWMD4NNNc7Jt4fCf",
                        "URI": "516D656A506E6E6775635A5664723637583937324C313842726A366F317241503842794754796137645259763234",
                        "uuid": "d1dcfe3cac80409793629707de2aafbf",
                        "minted": false,
                        "_id": "6308bc3d7a1dec795f21fc33"
                    } */
          openSnackbar('Import collection successful!', 'success');
          window.location.href = `/congrats/importcollection/${data.slug}`;
        } else {
          // { status: false, data: null, err: 'ERR_URL_SLUG' }
          const err = ret.err;
          openSnackbar(err, 'error');
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
    if (ext) ext = ext.toLowerCase();
    if (ext === 'jpg' || ext === 'png' || ext === 'gif') {
      const size = pickedFile.size;
      if (size < 10240000) {
        // setImgExt(ext);
        if (idx === 1) setFile1(pickedFile);
        else if (idx === 2) setFile2(pickedFile);
        else if (idx === 3) setFile3(pickedFile);

        // This is used as src of image
        const reader = new FileReader();
        reader.readAsDataURL(pickedFile);
        reader.onloadend = function (e) {
          if (idx === 1) setFileUrl1(reader.result); // data:image/jpeg;base64
          else if (idx === 2) setFileUrl2(reader.result);
          else if (idx === 3) setFileUrl3(reader.result);
        };
        return true;
      } else {
        openSnackbar('You can only upload images size less than 10MB', 'error');
      }
    }
    return false;
  };

  const handleFileSelect1 = (e) => {
    const pickedFile = e.target.files[0];
    const ret = processFile(pickedFile, 1);
    if (!ret) fileRef1.current.value = null;
  };

  const handleFileSelect2 = (e) => {
    const pickedFile = e.target.files[0];
    const ret = processFile(pickedFile, 2);
    if (!ret) fileRef2.current.value = null;
  };

  const handleFileSelect3 = (e) => {
    const pickedFile = e.target.files[0];
    const ret = processFile(pickedFile, 3);
    if (!ret) fileRef3.current.value = null;
  };

  const handleResetFile1 = (e) => {
    e.stopPropagation();
    setFile1(null);
    setFileUrl1(null);
    fileRef1.current.value = null;
  };

  const handleResetFile2 = (e) => {
    e.stopPropagation();
    setFile2(null);
    setFileUrl2(null);
    fileRef2.current.value = null;
  };

  const handleResetFile3 = (e) => {
    e.stopPropagation();
    setFile3(null);
    setFileUrl3(null);
    fileRef3.current.value = null;
  };

  const handleChangeType = (event, newType) => {
    // setType(newType);
  };

  const handleChangePrivate = (event, newValue) => {
    setPrivateCollection(newValue);
  };

  const handleChangeCategory = (event) => {
    const value = event.target.value;
    setCategory(value);
  };

  const handleListItemClick = (event, newTaxon) => {
    setSelectedTaxons((prev) => {
      const tempTaxons = [...prev];
      const existingIndex = tempTaxons.findIndex((t) => t === newTaxon);
      if (existingIndex > -1) {
        tempTaxons.splice(existingIndex, 1);
      } else {
        tempTaxons.push(newTaxon);
      }

      return tempTaxons;
    });
  };

  const handleChangeIssuer = (e) => {
    setIssuer(e.target.value);
  };

  const handleChangeRarity = (event) => {
    const value = event.target.value;
    setRarity(value);
  };

  const handleClickSelectAllTaxons = (isSelectAll = true) => {
    setSelectedTaxons(isSelectAll ? _.map(taxons, 'taxon') : []);
  };

  return (
    <>
      <Stack spacing={1} sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h1a">Import a Collection</Typography>
        <Typography variant="p2">
          <Typography variant="s2">*</Typography> Required fields
        </Typography>
      </Stack>
      <Stack spacing={2} mb={3}>
        <Typography variant="p4">
          Issuer <Typography variant="s2">*</Typography>
        </Typography>
        <Typography variant="p3">
          Input Issuer address that you want to import collection.
        </Typography>
        <Typography variant="p3">
          ex. rJeBz69krYh8sXb8uKsEE22ADzbi1Z4yF2
        </Typography>
        <TextField
          id="textIssuer"
          // autoFocus
          fullWidth
          variant="outlined"
          placeholder="Issuer Address"
          margin="dense"
          onChange={handleChangeIssuer}
          autoComplete="new-password"
          inputProps={{ autoComplete: 'off' }}
          value={issuer}
          onFocus={(event) => {
            event.target.select();
          }}
          onKeyDown={(e) => e.stopPropagation()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.7 }}>
                <PermIdentityIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                {loadingTaxons && <ClipLoader color="#ff0000" size={15} />}
              </InputAdornment>
            )
          }}
        />
      </Stack>
      <Stack spacing={2} mb={3}>
        <Stack
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
        >
          <Typography variant="p4">
            Taxons <Typography variant="s2">*</Typography>
          </Typography>
          <Button
            variant="outlined"
            sx={{ py: 0.5, px: 1.5 }}
            disabled={!taxons || taxons.length === 0}
            onClick={() =>
              handleClickSelectAllTaxons(
                taxons.length !== selectedTaxons.length
              )
            }
          >
            {taxons.length > 0 && taxons.length === selectedTaxons.length
              ? 'Unselect All'
              : 'Select All'}
          </Button>
        </Stack>
        <Typography variant="p3">
          Select taxon that you want to import.
        </Typography>

        {!taxons ||
          (taxons.length === 0 && (
            <Stack alignItems="center">
              <Typography variant="s2">
                [ Input issuer address to get Taxons list ]
              </Typography>
            </Stack>
          ))}

        {taxons?.map((tx, idx) => {
          return (
            <Stack key={idx}>
              {idx > 0 && <Divider sx={{ mt: 1, mb: 1 }} />}
              <ListItemButton
                // selected={taxon === tx.taxon}
                selected={selectedTaxons.includes(tx.taxon)}
                onClick={(event) => handleListItemClick(event, tx.taxon)}
                sx={{ pt: 2, pb: 2 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="s3">{idx + 1}. </Typography>
                  <Typography variant="s4">Taxon:</Typography>
                  <Typography variant="s3" color="#33C2FF" noWrap>
                    {tx.taxon}{' '}
                  </Typography>
                  <Typography variant="s4">NFTs:</Typography>
                  <Typography variant="s3" color="#33C2FF" noWrap>
                    {tx.count}{' '}
                  </Typography>
                </Stack>
              </ListItemButton>
            </Stack>
          );
        })}
      </Stack>
      <Stack spacing={2} mb={3}>
        <Typography variant="p4" sx={{ pt: 2, pb: 1 }}>
          Logo image <Typography variant="s2">*</Typography>
        </Typography>
        <Typography variant="p3">
          This image will also be used for navigation. 350 x 350
          recommended.(Max: 10MB)
        </Typography>
        <CardWrapperCircle>
          <input
            ref={fileRef1}
            style={{ display: 'none' }}
            // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
            // accept='image/*'
            accept=".png, .jpg, .gif"
            id="contained-button-file1"
            // multiple
            type="file"
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
            <CardOverlayCircle onClick={() => fileRef1.current.click()}>
              <IconButton
                aria-label="close"
                onClick={(e) => handleResetFile1(e)}
                sx={
                  fileUrl1
                    ? { position: 'absolute', right: '1vw', top: '1vh' }
                    : { display: 'none' }
                }
              >
                <CloseIcon color="white" />
              </IconButton>
            </CardOverlayCircle>
            <img
              src={fileUrl1}
              alt=""
              style={
                fileUrl1
                  ? {
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden'
                    }
                  : { display: 'none' }
              }
            />
            <ImageIcon
              fontSize="large"
              sx={fileUrl1 ? { display: 'none' } : { width: 64, height: 64 }}
            />
          </Card>
        </CardWrapperCircle>
        <Typography variant="p4" sx={{ pt: 2, pb: 1 }}>
          Featured image
        </Typography>
        <Typography variant="p3">
          This image will be used for featuring your collection on the homepage,
          category pages, or other promotional areas of XRPNFT.COM. 600 x 400
          recommended.(Max: 10MB)
        </Typography>
        <CardWrapper>
          <input
            ref={fileRef2}
            style={{ display: 'none' }}
            // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
            // accept='image/*'
            accept=".png, .jpg, .gif"
            id="contained-button-file2"
            // multiple
            type="file"
            onChange={handleFileSelect2}
          />
          <Card
            sx={{
              display: 'flex',
              width: 320,
              height: 240,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            <CardOverlay onClick={() => fileRef2.current.click()}>
              <IconButton
                aria-label="close"
                onClick={(e) => handleResetFile2(e)}
                sx={
                  fileUrl2
                    ? { position: 'absolute', right: '1vw', top: '1vh' }
                    : { display: 'none' }
                }
              >
                <CloseIcon color="white" />
              </IconButton>
            </CardOverlay>
            <img
              src={fileUrl2}
              alt=""
              style={
                fileUrl2
                  ? {
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden'
                    }
                  : { display: 'none' }
              }
            />
            <ImageIcon
              fontSize="large"
              sx={fileUrl2 ? { display: 'none' } : { width: 100, height: 100 }}
            />
          </Card>
        </CardWrapper>

        <Typography variant="p4" sx={{ pt: 2, pb: 1 }}>
          Banner image
        </Typography>
        <Typography variant="p3">
          This image will appear at the top of your collection page. Avoid
          including too much text in this banner image, as the dimensions change
          on different devices. 1400 x 350 recommended.(Max: 10MB)
        </Typography>
        <CardWrapper3>
          <input
            ref={fileRef3}
            style={{ display: 'none' }}
            // accept='image/*,video/*,audio/*,webgl/*,.glb,.gltf'
            // accept='image/*'
            accept=".png, .jpg, .gif"
            id="contained-button-file3"
            // multiple
            type="file"
            onChange={handleFileSelect3}
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
            <CardOverlay onClick={() => fileRef3.current.click()}>
              <IconButton
                aria-label="close"
                onClick={(e) => handleResetFile3(e)}
                sx={
                  fileUrl3
                    ? { position: 'absolute', right: '1vw', top: '1vh' }
                    : { display: 'none' }
                }
              >
                <CloseIcon color="white" />
              </IconButton>
            </CardOverlay>
            <img
              src={fileUrl3}
              alt=""
              style={
                fileUrl3
                  ? {
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden'
                    }
                  : { display: 'none' }
              }
            />
            <ImageIcon
              fontSize="large"
              sx={fileUrl3 ? { display: 'none' } : { width: 100, height: 100 }}
            />
          </Card>
        </CardWrapper3>

        <Typography variant="p4" sx={{ pt: 2, pb: 1 }}>
          Name <Typography variant="s2">*</Typography>
        </Typography>

        <LoadingTextField
          id="id_collection_name"
          placeholder="Example: My XRPL NFTs"
          type="COLLECTION_NAME"
          startText=""
          value={name}
          setValid={setValid1}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Stack>

      <Stack spacing={2} mb={3}>
        <Typography variant="p4">Category</Typography>
        <Typography variant="p3">
          This helps your NFT to be found when people search by Category. Once
          you set, you can not change Category when you edit your collection.
        </Typography>
        <CustomSelect
          id="select_category"
          value={category}
          onChange={handleChangeCategory}
          MenuProps={{ disableScrollLock: true }}
        >
          {CATEGORIES.map((cat, idx) => (
            <MenuItem key={idx} value={cat.title} sx={{ pt: 2, pb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {cat.icon}
                <Typography variant="d4">{cat.title}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </CustomSelect>
      </Stack>

      <Stack spacing={2} mb={3}>
        <Typography variant="p4">
          URL <Typography variant="s2">*</Typography>
        </Typography>
        <Typography variant="p3">
          Customize your URL on XRPNFT.COM. Must only contain lowercase letters,
          numbers, and hyphens.
        </Typography>

        <LoadingTextField
          id="id_collection_slug"
          placeholder="my-xrpl-nfts"
          type="COLLECTION_SLUG"
          startText="https://xrpnft.com/collection/"
          value={slug}
          setValid={setValid2}
          onChange={(e) => {
            const value = e.target.value;
            const newSlug = value ? value.replace(/[^a-z0-9-]/g, '') : '';
            setSlug(newSlug);
          }}
        />
      </Stack>

      <Stack spacing={2} mb={3}>
        <Typography variant="p4">
          Type <Typography variant="s2">*</Typography>
        </Typography>
        <Typography variant="p3">Select your collection type.</Typography>

        <Stack spacing={1} pl={0}>
          <Typography variant="p3">
            <Typography variant="s2">Normal:</Typography> Imported collections
            will have Normal type.
          </Typography>
        </Stack>

        <ToggleButtonGroup
          color="primary"
          value={type}
          exclusive
          size="small"
          onChange={handleChangeType}
        >
          <ToggleButton value="normal" sx={{ pl: 2, pr: 2 }}>
            Normal
          </ToggleButton>
          <ToggleButton disabled value="bulk" sx={{ pl: 3, pr: 3 }}>
            Bulk
          </ToggleButton>
          <ToggleButton disabled value="random" sx={{ pl: 3, pr: 3 }}>
            Random
          </ToggleButton>
          <ToggleButton disabled value="sequence" sx={{ pl: 3, pr: 3 }}>
            Sequence
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={2} mb={3}>
        <Typography variant="p4">Description</Typography>
        <Typography variant="p3">
          <Link href="https://www.markdownguide.org/cheat-sheet/">
            Markdown
          </Link>{' '}
          syntax is supported. 0 of 1000 characters used.
        </Typography>
        <TextField
          placeholder=""
          margin="dense"
          multiline
          maxRows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
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

      <Stack spacing={2} mb={3}>
        <Typography variant="p4">
          Rarity <Typography variant="s2">*</Typography>
        </Typography>
        <Typography variant="p3">
          Select your collection's rarity calculation method.&nbsp;
          <Link
            target="_blank"
            href={`https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c`}
            rel="noreferrer noopener nofollow"
          >
            Read More
          </Link>
        </Typography>

        <Stack spacing={1} pl={0}>
          <Typography variant="p3">
            <Typography variant="s2">Standard:</Typography> Simply compare the
            rarest trait of each NFT(%).
          </Typography>
          <Typography variant="p3">
            <Typography variant="s2">Average:</Typography> Average the rarity of
            traits that exist on the NFT(%).
          </Typography>
          <Typography variant="p3">
            <Typography variant="s2">Statistical:</Typography> Multiply all of
            its trait rarities together(%).
          </Typography>
          <Typography variant="p3">
            <Typography variant="s2">Score:</Typography> Sum of the Rarity Score
            of all of its trait values(not %, just a value).
          </Typography>
          <Typography variant="p3">
            <Typography variant="s2">Self:</Typography> Rarity and Rank are
            included in each NFT metadata.
          </Typography>
        </Stack>

        <FormControl sx={{ ml: 5 }}>
          {/* <FormLabel id="on-sale-sub-filter">On Sale sub</FormLabel> */}
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={rarity}
            onChange={handleChangeRarity}
          >
            <FormControlLabel
              value="standard"
              control={<Radio />}
              label="Standard"
            />
            <FormControlLabel
              value="average"
              control={<Radio />}
              label="Average"
            />
            <FormControlLabel
              value="statistical"
              control={<Radio />}
              label="Statistical"
            />
            <FormControlLabel value="score" control={<Radio />} label="Score" />
            <FormControlLabel value="self" control={<Radio />} label="Self" />
          </RadioGroup>
        </FormControl>
      </Stack>

      {/* <Stack spacing={2} mb={3}>
                <Typography variant='p4'>Private <Typography variant='s2'>*</Typography></Typography>
                <Typography variant='p3'>
                    Make your collection private when you need to upload NFTs or do something private.
                    You can make collection public again after you've done all things.
                </Typography>

                <ToggleButtonGroup
                    color="primary"
                    value={privateCollection}
                    exclusive
                    size="small"
                    onChange={handleChangePrivate}
                >
                    <ToggleButton value="no" sx={{pl:2, pr:2, pt: 0.3, pb: 0.3}}>No</ToggleButton>
                    <ToggleButton value="yes" sx={{pl:2, pr:2, pt: 0.3, pb: 0.3}}>Yes</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            <Stack spacing={2} mb={3}>
                <Typography variant='p4'>Passphrase <Typography variant='s2'>*</Typography></Typography>
                <Typography variant='p3'>
                    Contact support to get your own passphrase for your account. Once you get your passphrase, you can use it for 10 times only, if you want more, contact support again to get the new passphrase.
                </Typography>

                <Link
                    href="https://xrpnft.com/discord"
                    sx={{ mt: 1.5, display: 'inline-flex' }}
                    underline="none"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    <Typography variant='s2' color="#33C2FF">Contact us on Discord</Typography>
                </Link>

                <LoadingTextField
                    id='id_create_collection_passphrase'
                    type='PASSPHRASE_CREATE_COLLECTION'
                    placeholder='Passphrase'
                    startText=''
                    value={passphrase}
                    setValid={setValidPassword}
                    onChange={(e) => {
                        setPassPhrase(e.target.value)
                    }}
                />
            </Stack> */}

      <Stack alignItems="right">
        <LoadingButton
          disabled={!canImport}
          variant="contained"
          loading={loading}
          loadingPosition="start"
          startIcon={<SendIcon />}
          onClick={onImportCollection}
          sx={{ mt: 5, mb: 6 }}
        >
          Import
        </LoadingButton>
      </Stack>
    </>
  );
}
