import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';
import RecipeCard from '../../components/RecipeCard';
import Loader from '../../components/Loader';
import Content from '../../components/Content';

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(['recipe.get-all']);

  return (
    <>
      <Content>
          {isLoading || !data ? (
            <Loader text='Loading recipes...' />
          ) : (
            <div className='wrap flex w-full flex-col justify-center gap-4 lg:flex-row'>
              {data.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
      </Content>
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
