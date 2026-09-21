import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import '@/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

const hashPath = window.location.hash.replace(/^#/, '');
if (hashPath && !hashPath.startsWith('/')) {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
