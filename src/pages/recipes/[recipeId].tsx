import React, { useEffect, useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';
import Content from '../../components/Content';
import Loader from '../../components/Loader';
import Button from '../../components/Button';

const RecipePage = ({ recipeId }: { recipeId: string }) => {
  const { data, isLoading } = trpc.useQuery(['recipe.get-one', { id: recipeId }]);

  const [servings, setServings] = useState<number>();

  useEffect(() => {
    if (data?.servings) {
      setServings(data.servings);
    }
  }, [data?.servings]);

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
      {isLoading || !data ? (
        <Loader text='Loading...' />
      ) : (
        <div className='flex w-full flex-col gap-4'>
          <h1 className='text-4xl font-semibold'>{data.name}</h1>
          <div className='flex gap-2'>
            {data.tags.map((tag) => (
              <span key={tag.id} className='rounded-full bg-lime-600 px-3'>
                {tag.name}
              </span>
            ))}
          </div>
          <div>
            <i>{data.desc}</i>
          </div>
          <div className='flex gap-4 text-center'>
            <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
              <h3 className='font-semibold'>Prep time:</h3>
              <p>{data.prepTime} min</p>
            </div>
            <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
              <h3 className='font-semibold'>Cook time:</h3>
              <p>{data.cookTime} min</p>
            </div>
            <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
              <h3 className='font-semibold'>Total time:</h3>
              <p>{Number(data.cookTime) + Number(data.prepTime)} min</p>
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
                {data.ingredientOnRecipe.map((ior) => (
                  <div key={ior.ingredient.id} className='flex gap-2'>
                    <p>{ior.ingredient.name}</p>
                    <p>{(ior.quantity * Number(servings)) / Number(data.servings) || '-'}</p>
                    <p>{ior.unit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Steps:</h3>
              <ol className='list-decimal pl-4'>
                {data.steps.map((step, index) => (
                  <li key={`${step}+${index}`}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
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
  const { recipeId } = context.query;
  if (!recipeId || typeof recipeId !== 'string') {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      recipeId,
    },
  };
};
