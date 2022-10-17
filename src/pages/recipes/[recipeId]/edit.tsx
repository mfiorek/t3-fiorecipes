import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../../server/common/get-server-auth-session';
import Content from '../../../components/Content';

const EditRecipePage = ({ recipeId }: { recipeId: string }) => {
  return <Content>EditRecipePage for: {recipeId}</Content>;
};

export default EditRecipePage;

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
