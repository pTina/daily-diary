import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { createHashRouter } from 'react-router-dom';

export const router = createHashRouter([
  { path: '/', element: <CalendarPage /> },
  { path: '/settings', element: <SettingsPage /> },
]);
