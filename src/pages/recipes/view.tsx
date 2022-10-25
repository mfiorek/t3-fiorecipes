import React, { useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { inferQueryOutput, trpc } from '../../utils/trpc';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../components/Button';
import Content from '../../components/Content';
import Loader from '../../components/Loader';

interface ViewRecipeContentsProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
  presignedUrls: inferQueryOutput<'s3.getMultiplePresignedUrls'>;
}
const ViewRecipeContents: React.FC<ViewRecipeContentsProps> = ({ recipe, presignedUrls }) => {
  const [servings, setServings] = useState<number>(recipe.servings);

  const presignedUrl = presignedUrls?.get(recipe.id);

  const incrementServings = () => {
    setServings(Number(servings) + 1);
  };
  const decrementServings = () => {
    if (Number(servings) > 1) {
      setServings(Number(servings) - 1);
    }
  };

  return (
    <Content>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex items-start justify-between'>
          <h1 className='text-4xl font-semibold'>{recipe.name}</h1>
          <div className='flex gap-2'>
            <Link
              href={{
                pathname: '/recipes/edit',
                query: { id: recipe.id },
              }}
            >
              <span className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100'>
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                  />
                </svg>
              </span>
            </Link>
            <Link href='/recipes'>
              <span className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100'>
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' />
                </svg>
              </span>
            </Link>
          </div>
        </div>
        {recipe.hasPic && presignedUrl && (
          <div>
            <Image src={presignedUrl} alt='recipe image' width={'400'} height={'400'} className='aspect-square object-cover' />
          </div>
        )}
        <div className='flex gap-2'>
          {recipe.tags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((tag) => (
              <span key={tag.id} className='rounded-full bg-lime-600 px-3'>
                {tag.name}
              </span>
            ))}
        </div>
        <div>
          <i>{recipe.desc}</i>
        </div>
        <div className='flex gap-4 text-center'>
          <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
            <h3 className='font-semibold'>Prep time:</h3>
            <p>{Number(recipe.prepTime)} min</p>
          </div>
          <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
            <h3 className='font-semibold'>Cook time:</h3>
            <p>{Number(recipe.cookTime)} min</p>
          </div>
          <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
            <h3 className='font-semibold'>Total time:</h3>
            <p>{Number(recipe.cookTime) + Number(recipe.prepTime)} min</p>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-y-8 gap-x-4 md:grid-cols-[1fr_2fr] '>
          <div>
            <h3 className='text-lg font-semibold'>Ingredients</h3>
            <div>
              <h4 className='font-semibold'>
                for{' '}
                <span className='rounded bg-zinc-300 py-2'>
                  <Button onClick={decrementServings}>-</Button>
                  {servings}
                  <Button onClick={incrementServings}>+</Button>
                </span>{' '}
                servings:
              </h4>
            </div>
            <div>
              {recipe.ingredientOnRecipe.map((ior) => (
                <div key={ior.ingredient.id} className='flex gap-2'>
                  <p>{ior.ingredient.name}</p>
                  <p>{(ior.quantity * Number(servings)) / recipe.servings || '-'}</p>
                  <p>{ior.unit}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Steps:</h3>
            <ol className='list-decimal pl-4'>
              {recipe.steps.map((step, index) => (
                <li key={`${step}+${index}`}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Content>
  );
};

const ViewRecipePage = () => {
  const { data: recipeData, isLoading: recipeLoading, isStale: isRecipesStale } = trpc.useQuery(['recipe.get-all'], { staleTime: Infinity });

  const recipesWithPicsIds = recipeData?.filter((recipe) => recipe.hasPic).map((recipe) => recipe.id) || null;
  const { data: presignedUrlsData, isLoading: presignedUrlLoading } = trpc.useQuery(['s3.getMultiplePresignedUrls', { arrayOfRecipeIds: recipesWithPicsIds }], {
    staleTime: 900 * 1000,
    cacheTime: 900 * 1000,
  });

  const router = useRouter();
  const { id: selectedRecipeId } = router.query;
  const recipe = recipeData?.find((rec) => rec.id === selectedRecipeId);

  if (recipeLoading || presignedUrlLoading || !recipeData || !presignedUrlsData || isRecipesStale) {
    return (
      <Content>
        <Loader text='Loading recipe...' />
      </Content>
    );
  }
  if (!recipe) {
    return (
      <Content>
        <h1>Oops... something went wrong 😥</h1>
      </Content>
    );
  }
  return <ViewRecipeContents recipe={recipe} presignedUrls={presignedUrlsData} />;
};

export default ViewRecipePage;

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
