import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { performance } from 'perf_hooks';

// Material
import {
  Container,
  Grid,
  Link,
  Box,
  styled,
  Toolbar,
  Typography,
  Pagination
} from '@mui/material';


// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

import ScrollToTop from 'src/components/ScrollToTop';

const BASE_URL = process.env.API_URL;

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

const Sitemap = ({ tokens, slug }) => {
  const totalCount = tokens.length;
  const perPage = 300;
  const pageCount = Math.ceil(totalCount / perPage);

  const [page, setPage] = useState(1);
  const [slugs, setSlugs] = useState(tokens);

  const capitalizedText = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleChangePage = (event, newPage) => {
    if (page === newPage) return;

    setPage(newPage);
    gotoTop(event);
  };

  const gotoTop = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor'
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  const { darkMode } = useContext(AppContext);

  useEffect(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pSlugs = tokens.slice(startIndex, endIndex);

    setSlugs(pSlugs);
  }, [page]);

  return (
    <OverviewWrapper>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
        <Typography variant="h1" sx={{ mt: 4 }}>
          {`${capitalizedText(slug)} Sitemap`}
        </Typography>

        <Grid container rowSpacing={2} alignItems="center" sx={{ mt: 3 }}>
          {slugs.map((token) => {
            return (
              <Grid
                key={token}
                item
                xs={12}
                sm={6}
                md={3}
                lg={2}
                sx={{
                  padding: '5px !important',
                  width: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <Link
                  href={`/${slug}/${token}`}
                  underline="none"
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  sx={{
                    fontSize: 15,
                    color: darkMode ? '#007B55 !important  ' : '#147DFE !important',
                    '&:hover': {
                      color: 'rgb(160, 160, 160) !important'
                    }
                  }}
                >
                  {capitalizedText(token)}
                </Link>
              </Grid>
            );
          })}
        </Grid>

        <Pagination
          variant="rounded"
          page={page}
          count={pageCount}
          onChange={handleChangePage}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}
        />

        <Grid container sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Link
              href={`/sitemap/trustlines`}
              underline="none"
              rel="noreferrer noopener nofollow"
              sx={{
                fontSize: 15,
                color: darkMode ? '#007B55 !important  ' : '#147DFE !important',
                '&:hover': {
                  color: 'rgb(160, 160, 160) !important'
                }
              }}
            >
              Trustlines Sitemap
            </Link>
          </Grid>
        </Grid>
      </Container>

      <ScrollToTop />

      <Footer />
    </OverviewWrapper>
  );
};

export const getServerSideProps = async (ctx) => {
  let slugs = [];
  let exch = null;
  let H24 = null;
  let global = null;
  let count = 0;
  let total = 0;
  const time = new Date().toISOString();

  const { slug } = { slug: 'token' }; //ctx.params; //webxtor disabling dynamic slug: renamed [slug].js to token.js

  try {
    var t1 = performance.now();

    const res = await axios.get(`${BASE_URL}/slugs`);

    count = res.data?.count;
    slugs = res.data?.slugs;
    exch = res.data?.exch;
    total = res.data?.total;
    H24 = res.data?.H24;
    global = res.data?.global;

    var t2 = performance.now();
    var dt = (t2 - t1).toFixed(2);

    let ogp = {};

    ogp.canonical = 'https://xrpl.to';
    ogp.title = slug.charAt(0).toUpperCase() + slug.substr(1) + ' Sitemap';
    ogp.url = 'https://xrpl.to/';
    ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
    ogp.desc = "Discover XRPL tokens with ease! XRPL.to's Tokens Sitemap provides a streamlined overview of all available tokens on the XRP Ledger for easy access and exploration.";

    console.log(`3. sitemap/token.xml count: ${count} took: ${dt}ms [${time}]`);
    return {
      props: {
        tokens: slugs,
        slug,
        data: {
          exch,
          total,
          H24,
          global
        },
        ogp
      }
    };
  } catch (e) {
    console.log(e);
    return {
      props: {
        tokens: [],
        slug: '',
        data: {
          exch,
          total,
          H24,
          global
        },
        ogp
      }
    };
  }

  /* =============================
        // Change freq
            always = describe documents that change each time they are accessed
            hourly
            daily
            weekly
            monthly
            yearly
            never = describe archived URLs
    =============================*/
};

export default Sitemap;
