import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';

const TagsPage = () => {
  return <div>TagsPage</div>;
};

export default TagsPage;

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
