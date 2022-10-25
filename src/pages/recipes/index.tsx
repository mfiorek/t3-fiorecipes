import { useEffect, useState } from 'react';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { inferQueryOutput, trpc } from '../../utils/trpc';
import { useAtomValue } from 'jotai';
import { searchAtom } from '../../state/atoms';
import AutoAnimate from '../../components/AutoAnimate';
import RecipeCard from '../../components/RecipeCard';
import Loader from '../../components/Loader';
import Content from '../../components/Content';

const RecipesPage: NextPage = () => {
  const { data: recipeData, isLoading: recipeLoading, isStale: isRecipesStale } = trpc.useQuery(['recipe.get-all'], { staleTime: Infinity });
  const { data: ingredientsData, isLoading: ingredientsLoading } = trpc.useQuery(['ingredient.get-all']);
  const { data: tagsData, isLoading: tagsLoading } = trpc.useQuery(['tag.get-all']);

  const recipeIdsArray = recipeData?.map((recipe) => recipe.id) || null;
  const { data: presignedUrlsData, isLoading: presignedUrlLoading } = trpc.useQuery(['s3.getMultiplePresignedUrls', { arrayOfRecipeIds: recipeIdsArray }], {
    staleTime: 900 * 1000,
    cacheTime: 900 * 1000,
  });

  const searchWords = useAtomValue(searchAtom);
  const [filteredRecipies, setFilteredRecipies] = useState<inferQueryOutput<'recipe.get-all'>>([]);

  useEffect(() => {
    let recipiesToSearchIn = recipeData;
    searchWords.forEach((searchWord) => {
      recipiesToSearchIn = recipiesToSearchIn?.filter((recipe) => {
        const nameMatch =
          recipe.name
            .toLowerCase()
            .split(' ')
            .findIndex((tiltleWord) => tiltleWord.startsWith(searchWord.toLocaleLowerCase())) !== -1;
        const ingredientMatch = recipe.ingredientOnRecipe.findIndex((ior) => ior.ingredient.name.toLowerCase().startsWith(searchWord.toLocaleLowerCase())) !== -1;
        const tagMatch = recipe.tags.findIndex((tag) => tag.name.toLowerCase().startsWith(searchWord.toLocaleLowerCase())) !== -1;

        return nameMatch || ingredientMatch || tagMatch;
      });
    });
    setFilteredRecipies(recipiesToSearchIn || []);
  }, [recipeData, searchWords]);

  if (recipeLoading || ingredientsLoading || tagsLoading || presignedUrlLoading || !recipeData || !ingredientsData || !tagsData || !presignedUrlsData || isRecipesStale) {
    return (
      <Content>
        <Loader text='Loading recipes...' />
      </Content>
    );
  }
  return (
    <Content>
      <AutoAnimate className='wrap grid w-full grid-cols-1 flex-col justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredRecipies
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} presignedUrl={presignedUrlsData.get(recipe.id)} />
          ))}
      </AutoAnimate>
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
