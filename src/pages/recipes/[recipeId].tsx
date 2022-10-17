import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';

const RecipePage = ({ recipeId }: { recipeId: string | string[] | undefined }) => {
  return <div>RecipePage for: {recipeId}</div>;
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
  return {
    props: {
      recipeId,
    },
  };
};
