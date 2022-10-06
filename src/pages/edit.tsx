import React from 'react';
import { useRouter } from 'next/router';

const EditPage = () => {
  const router = useRouter();
  const id = router.query.id;

  return <div>EditPage {JSON.stringify(id)}</div>;
};

export default EditPage;
