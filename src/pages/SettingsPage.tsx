import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  return (
    <main className="mx-auto min-h-full max-w-xl bg-paper px-5 py-6">
      <Link to="/" className="text-sm text-muted hover:text-ink">
        ← 캘린더
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">설정</h1>
      <div className="mt-6">
        <SettingsForm />
      </div>
    </main>
  );
}
