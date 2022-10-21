import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';
import RecipeCard from '../../components/RecipeCard';
import Loader from '../../components/Loader';
import Content from '../../components/Content';

const RecipesPage: NextPage = () => {
  const { data: recipeData, isLoading: recipeLoading, isStale: isRecipesStale } = trpc.useQuery(['recipe.get-all'], { staleTime: Infinity });
  const { data: ingredientsData, isLoading: ingredientsLoading } = trpc.useQuery(['ingredient.get-all']);
  const { data: tagsData, isLoading: tagsLoading } = trpc.useQuery(['tag.get-all']);

  if (recipeLoading || ingredientsLoading || tagsLoading || !recipeData || !ingredientsData || !tagsData || isRecipesStale) {
    return (
      <Content>
        <Loader text='Loading recipes...' />
      </Content>
    );
  }
  return (
    <Content>
      <div className='wrap grid w-full grid-cols-1 flex-col justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recipeData
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
      </div>
    </Content>
  );
};

export default RecipesPage;

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
