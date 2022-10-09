import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/common/get-server-auth-session';

const EditPage = () => {
  const router = useRouter();
  const id = router.query.id;

  return <div>EditPage {JSON.stringify(id)}</div>;
};

export default EditPage;


export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
  return {
    props: {},
  }
}
