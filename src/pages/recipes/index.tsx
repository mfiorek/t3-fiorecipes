import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';
import { selectedRecipeAtom } from '../../state/atoms';
import { useAtomValue } from 'jotai';
import RecipeCard from '../../components/RecipeCard';
import Loader from '../../components/Loader';
import Content from '../../components/Content';
import Recipe from '../../components/sites/Recipe';

const RecipePage: NextPage = () => {
  const selectedRecipe = useAtomValue(selectedRecipeAtom);

  const { data: recipeData, isLoading: recipeLoading } = trpc.useQuery(['recipe.get-all']);
  const { data: ingredientsData, isLoading: ingredientsLoading } = trpc.useQuery(['ingredient.get-all']);
  const { data: tagsData, isLoading: tagsLoading } = trpc.useQuery(['tag.get-all']);

  if (recipeLoading || ingredientsLoading || tagsLoading || !recipeData || !ingredientsData || !tagsData) {
    return (
      <Content>
        <Loader text='Loading recipes...' />;
      </Content>
    );
  }
  return (
    <Content>
      {selectedRecipe ? (
        <Recipe recipe={selectedRecipe} ingredients={ingredientsData} tags={tagsData} />
      ) : (
        <div className='wrap flex w-full flex-col justify-center gap-4 lg:flex-row'>
          {recipeData.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </Content>
  );
};

export default RecipePage;

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
