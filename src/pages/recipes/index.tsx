import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import RecipeCard from '../../components/RecipeCard';
import Loader from '../../components/Loader';

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(['recipe.get-all']);

  return (
    <>
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

      <main className='flex min-h-screen flex-col bg-zinc-400 text-zinc-800'>
        <Navbar />
        <div className='mx-auto flex w-full max-w-5xl grow flex-col items-center bg-zinc-200 shadow-2xl'>
          {isLoading || !data ? (
            <Loader text='Loading recipes...' />
          ) : (
            <div className='wrap flex w-full flex-col justify-center gap-4 p-4 lg:flex-row'>
              {data.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
