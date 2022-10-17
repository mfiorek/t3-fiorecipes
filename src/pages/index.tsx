import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/common/get-server-auth-session';

// This page does not exist - it only redirects based on the session status
const Index = () => null;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  if (session?.user) {
    return {
      redirect: {
        destination: '/recipes',
        permanent: false,
      },
    };
  }
  return {
    redirect: {
      destination: '/about',
      permanent: false,
    },
  };
};
