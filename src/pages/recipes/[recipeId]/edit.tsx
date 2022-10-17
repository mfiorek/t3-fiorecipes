import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../../server/common/get-server-auth-session';

const EditRecipePage = ({ recipeId }: { recipeId: string }) => {
  return <div>EditRecipePage for: {recipeId}</div>;
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
