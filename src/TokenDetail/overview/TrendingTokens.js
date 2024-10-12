// Material
import {
	useTheme,
	styled,
	Link,
	CardHeader,
	Stack,
	Typography,
	Table,
	TableRow,
	TableBody,
	TableCell,
	Box,
	useMediaQuery, // Import for media query
  } from '@mui/material';
  import { tableCellClasses } from "@mui/material/TableCell";
  import WhatshotIcon from '@mui/icons-material/Whatshot';
  import StackStyle from 'src/components/StackStyle';
  
  // Context
  import { useContext } from 'react';
  import { AppContext } from 'src/AppContext';
  
  import { useState, useEffect } from 'react';
  import axios from 'axios';
  
  import {
	LazyLoadImage,
	LazyLoadComponent
  } from 'react-lazy-load-image-component';
  
  const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
	borderRadius: '50%',
	overflow: 'hidden'
  }));
  
  const TrendingTokens = () => {
	const BASE_URL = process.env.API_URL;
	const theme = useTheme();
	const { darkMode } = useContext(AppContext);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Using media query for responsiveness
  
	const [trendingList, setTrendingList] = useState([]);
  
	useEffect(() => {
	  function getTrendingTokens() {
		axios.get(`${BASE_URL}/tokens?start=0&limit=10&sortBy=trendingScore&sortType=desc&filter=&tags=&showNew=false&showSlug=false`)
		  .then(res => {
			let ret = res.status === 200 ? res.data : undefined;
			if (ret) {
			  setTrendingList(ret.tokens);
			}
		  }).catch(err => {
			console.log("Error on getting TrendingTokens!", err);
		  }).then(function () {
			// always executed
		  });
	  }
	  getTrendingTokens();
	}, []);
  
	return (
	  <StackStyle sx={{ mt: 4 }}>
		<Stack direction="row" alignItems="center" spacing={0.1}>
		  <CardHeader title='Trending XRPL Tokens' subheader='' sx={{ p: 2 }} />
		  <WhatshotIcon style={{ color: 'orange' }} sx={{ marginBottom: '9px !important', ml: '-5px !important' }} />
		</Stack>
		<Table sx={{
		  [`& .${tableCellClasses.root}`]: {
			borderBottom: "1px solid",
			borderBottomColor: theme.palette.divider,
			padding: isMobile ? theme.spacing(1) : theme.spacing(2) // Adjusting padding based on screen size
		  }
		}}>
		  <TableBody>
			{
			  trendingList.map((row, index) => {
				const {
				  md5,
				  id,
				  name,
				  user,
				  slug,
				  kyc,
				  isOMCF,
				} = row;
				
				const imgUrl = `https://s1.xrpl.to/token/${md5}`;
				const link = `/token/${slug}`;
			
				const rank = id; // index + 1;
				
				return (
				  <TableRow
					sx={{
					  '&:hover': {
						'& .MuiTableCell-root': {
						  backgroundColor: darkMode
							? '#232326 !important'
							: '#D9DCE0 !important'
						}
					  }
					}}
					key={id} // Change this line
				  >
					<TableCell align="left">
					  <Link
						underline="none"
						color="inherit"
						href={link}
						rel="noreferrer noopener nofollow"
						key={md5}
					  >
						<Box
						  display="flex"
						  alignItems="center"
						  justifyContent="space-between"
						  flex={2}
						  sx={{ pl: 0, pr: 0 }}
						>
						  <Stack direction="row" spacing={1} alignItems="center">
							<TokenImage
							  src={imgUrl}
							  width={32}
							  height={32}
							  onError={(event) => (event.target.src = '/static/alt.webp')}
							/>
							<Stack direction="row" spacing={1}>
							  <Typography
								variant="token"
								color={isOMCF !== 'yes'
								? darkMode
								  ? '#fff'
								  : '#222531'
								: darkMode
								  ? '#007B55'
								  : '#5569ff'}
								noWrap
							  >
								{user}
							  </Typography>
							  <Typography
								variant="caption"
								color={isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : ''}
								noWrap
							  >
								{name}
								{kyc && (
								  <Typography variant="kyc" sx={{ ml: 0.2 }}>
									KYC
								  </Typography>
								)}
							  </Typography>
							</Stack>
						  </Stack>
						</Box>
					  </Link>
					</TableCell>
					<TableCell align="right">#{rank}</TableCell>
				  </TableRow>
				);
			  })
			}
		  </TableBody>
		</Table>
		<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
		  <Link color={ darkMode ? '#22B14C': '#3366FF' } underline="none"
				href={`/trending-tokens`}
		  >{'View More >'}</Link>
		</div>
	  </StackStyle>
	);
  };
  
  export default TrendingTokens;

