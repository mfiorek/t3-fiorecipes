import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import Content from '../../components/Content';

const TagPage = ({ tagId }: { tagId: string | string[] | undefined }) => {
  return <Content>TagPage for tag: {tagId}</Content>;
};

export default TagPage;

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
  const { tagId } = context.query;
  return {
    props: {
      tagId,
    },
  };
};
