import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';

const IngredientPage = ({ ingredientId }: { ingredientId: string | string[] | undefined }) => {
  return <div>IngredientPage for: {ingredientId}</div>;
};

export default IngredientPage;

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
  const { ingredientId } = context.query;
  return {
    props: {
      ingredientId,
    },
  };
};
