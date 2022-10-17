import React from 'react';
import Head from 'next/head';

const FiorecipesHead = () => {
  return (
    <Head>
      <title>fiorecipes</title>
      <meta name='description' content='fiorecipes - simple app to keep track of your recipes' />
      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='manifest' href='/site.webmanifest' />
      <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#3f6212' />
      <meta name='msapplication-TileColor' content='#e4e4e7' />
      <meta name='theme-color' content='#e4e4e7' />
    </Head>
  );
};

export default FiorecipesHead;
