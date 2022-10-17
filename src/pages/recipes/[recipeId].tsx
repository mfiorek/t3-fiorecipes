import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import Content from '../../components/Content';

const RecipePage = ({ recipeId }: { recipeId: string | string[] | undefined }) => {
  return <Content>RecipePage for: {recipeId}</Content>;
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
