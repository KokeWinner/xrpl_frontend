import React from "react";
import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = process.env.API_URL;

const Sitemap = () => {
  // This component does not render anything, as it's meant for server-side generation only.
  return null;
};

export const getServerSideProps = async ({ res }) => {
  try {
    const startTime = performance.now();

    const response = await axios.get(`${BASE_URL}/slugs`);
    const count = response.data?.count;
    const slugs = response.data?.slugs;
    const endTime = performance.now();
    const elapsedTime = (endTime - startTime).toFixed(2);

    console.log(`Sitemap generation: ${count} items took ${elapsedTime}ms`);

    const time = new Date().toISOString();

    // Sitemap generation
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://xrpl.to/</loc>
        <lastmod>${time}</lastmod>
        <changefreq>always</changefreq>
    </url>
    ${slugs.map((slug) => `
    <url>
        <loc>https://xrpl.to/token/${slug}</loc>
        <lastmod>${time}</lastmod>
        <changefreq>always</changefreq>
    </url>`).join('')}
    ${slugs.map((slug) => `
    <url>
        <loc>https://xrpl.to/trustset/${slug}</loc>
        <lastmod>${time}</lastmod>
        <changefreq>always</changefreq>
    </url>`).join('')}
</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.statusCode = 500;
    res.end();
  }
};

export default Sitemap;
