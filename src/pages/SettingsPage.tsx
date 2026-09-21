import { GroupColorPicker } from '@/features/group/components/GroupColorPicker';
import { useGroups, useUpdateGroupColor } from '@/features/group/hooks/useGroups';
import { useSettings } from '@/features/reminder/useReminderScheduler';
import { isGoogleUser, logOut, signInWithGoogle, useAuthUser } from '@/shared/lib/auth';
import { storage } from '@/shared/storage';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const { data: groups = [] } = useGroups();
  const { data: settings } = useSettings();
  const updateColor = useUpdateGroupColor();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const [permission, setPermission] = useState(Notification.permission);
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <main className="mx-auto min-h-full max-w-xl bg-paper px-5 py-6">
      <Link to="/" className="text-sm text-muted hover:text-ink">
        ← 캘린더
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">설정</h1>
      <p className="mt-2 text-sm text-muted">그룹 색과 알림만 바꿀 수 있습니다. 그룹 이름과 개수는 고정입니다.</p>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="text-base font-semibold">계정</h2>
        <p className="text-sm text-muted">
          {isGoogleUser(user)
            ? `${user?.email ?? 'Google 계정'}으로 로그인됨. 다시 방문하면 자동 로그인됩니다.`
            : '아직 Google 계정이 연결되어 있지 않습니다.'}
        </p>
        {isGoogleUser(user) ? (
          <Button variant="secondary" onClick={() => void logOut()}>
            로그아웃
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={async () => {
              setAuthError(null);
              try {
                await signInWithGoogle();
              } catch (caught) {
                setAuthError(caught instanceof Error ? caught.message : '연동에 실패했습니다.');
              }
            }}
          >
            Google 계정 연결
          </Button>
        )}
        {authError ? <p className="text-sm text-muted">{authError}</p> : null}
      </section>

      <section className="mt-10 flex flex-col gap-8">
        {groups.map((group) => {
          const other = groups.find((item) => item.id !== group.id);
          return (
            <GroupColorPicker
              key={group.id}
              group={group}
              otherColor={other?.color ?? ''}
              onChange={(color) => updateColor.mutate({ groupId: group.id, color })}
            />
          );
        })}
      </section>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-base font-semibold">알림</h2>
        <p className="text-sm text-muted">
          브라우저 탭이 열려 있을 때만 알림이 갑니다. 현재 상태: {permissionLabel(permission)}
        </p>
        <Button
          variant="secondary"
          disabled={permission === 'granted'}
          onClick={async () => {
            const next = await Notification.requestPermission();
            setPermission(next);
          }}
        >
          {permission === 'granted' ? '알림이 허용됨' : '알림 권한 요청'}
        </Button>
        {settings ? (
          <TextField
            id="default-reminder"
            label="종일 항목 기본 알림 시각"
            type="time"
            value={settings.defaultReminderTime}
            onChange={async (event) => {
              await storage.writeSettings({
                ...settings,
                defaultReminderTime: event.target.value,
              });
              void queryClient.invalidateQueries({ queryKey: ['settings'] });
            }}
          />
        ) : null}
      </section>
    </main>
  );
}

function permissionLabel(permission: NotificationPermission) {
  if (permission === 'granted') return '허용';
  if (permission === 'denied') return '거부';
  return '아직 요청하지 않음';
}
