import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { createHashRouter, isRouteErrorResponse, Navigate, Outlet, useRouteError } from 'react-router-dom';

function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : '알 수 없는 오류가 발생했습니다.';

  return (
    <main className="grid h-full place-items-center bg-canvas px-6 text-center">
      <div>
        <p className="text-base font-semibold">페이지를 불러오지 못했습니다.</p>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <a href="#/" className="mt-4 inline-block text-sm underline">
          캘린더로 돌아가기
        </a>
      </div>
    </main>
  );
}

export const router = createHashRouter([
  {
    element: <Outlet />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <CalendarPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
