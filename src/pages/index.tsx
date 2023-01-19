import Head from 'next/head';
import { useEffect } from 'react';
import Login from './login';
import env from '../environments/env';
import { useRouter } from 'next/router';

export default function App() {
  const router = useRouter();
  
  useEffect(() => {
    const logged = localStorage.getItem(env.localStorageLoginKey);
    if (!logged) {
      router.push(env.routesList.login);
    } 
  }, [router]);

  return (
    <div>
      <Head>
        <title>Controle de Vendas</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  )
}
