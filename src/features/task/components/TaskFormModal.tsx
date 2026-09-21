import { useTaskSources } from '@/features/task/hooks/useTasks';
import { useGroups } from '@/features/group/hooks/useGroups';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { DateField } from '@/shared/ui/DateField';
import { RadioGroup } from '@/shared/ui/RadioGroup';
import { Select } from '@/shared/ui/Select';
import { Switch } from '@/shared/ui/Switch';
import { TextField } from '@/shared/ui/TextField';
import { TimeWheel } from '@/shared/ui/TimeWheel';
import { addDays, eachDayInclusive, snapToTimeStep } from '@/shared/lib/dateUtils';
import type { TaskDraft } from '@/shared/types/task';
import { useUiStore } from '@/store/useUiStore';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  onCreate: (draft: TaskDraft) => void;
  onUpdate: (draft: TaskDraft, recurring: boolean) => void;
  onDelete: (recurring: boolean) => void;
};

const emptyDraft = (date: string, groupId: string): TaskDraft => ({
  title: '',
  groupId,
  date,
  endDate: date,
  timeEnabled: false,
  time: '09:00',
  recurrenceEnabled: false,
  freq: 'weekly',
  until: '',
  reminderEnabled: false,
  offsetMin: 10,
  memo: '',
});

export function TaskFormModal({ onCreate, onUpdate, onDelete }: Props) {
  const modal = useUiStore((state) => state.modal);
  const selectedDate = useUiStore((state) => state.selectedDate);
  const closeModal = useUiStore((state) => state.closeModal);
  const { data: groups = [] } = useGroups();
  const { data: sources = [] } = useTaskSources();
  const open = modal.name === 'task-form';
  const source = open && modal.sourceId ? sources.find((task) => task.id === modal.sourceId) : undefined;
  const instanceDate = open ? modal.instanceDate ?? source?.date ?? selectedDate : selectedDate;

  const initial = useMemo(() => {
    if (!source) return emptyDraft(selectedDate, groups[0]?.id ?? 'g_work');
    const start = source.recurrence ? instanceDate : source.date;
    const span = source.endDate && source.endDate > source.date
      ? eachDayInclusive(source.date, source.endDate).length - 1
      : 0;
    return {
      title: source.title,
      groupId: source.groupId,
      date: start,
      endDate: addDays(start, span),
      timeEnabled: Boolean(source.time),
      time: source.time ?? '09:00',
      recurrenceEnabled: Boolean(source.recurrence),
      freq: source.recurrence?.freq ?? 'weekly',
      until: source.recurrence?.until ?? '',
      reminderEnabled: Boolean(source.reminder?.enabled),
      offsetMin: source.reminder?.offsetMin ?? 10,
      memo: source.memo ?? '',
    } satisfies TaskDraft;
  }, [source, selectedDate, groups, instanceDate]);

  const [draft, setDraft] = useState(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <Modal
      open={open}
      title={source ? '할 일 수정' : '할 일 추가'}
      onClose={closeModal}
      footer={
        <div className="flex items-center justify-between gap-2">
          {source ? (
            <Button variant="ghost" onClick={() => onDelete(Boolean(source.recurrence))}>
              삭제
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="tertiary" onClick={closeModal}>
              취소
            </Button>
            <Button
              disabled={!draft.title.trim()}
              onClick={() => (source ? onUpdate(draft, Boolean(source.recurrence)) : onCreate(draft))}
            >
              저장
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <TextField
          id="task-title"
          label="제목"
          value={draft.title}
          placeholder="무엇을 할까요?"
          onChange={(event) => set('title', event.target.value)}
        />
        <DateField
          id="task-date"
          label="시작일"
          value={draft.date}
          onChange={(date) => {
            setDraft((current) => ({
              ...current,
              date,
              endDate: current.endDate && current.endDate >= date ? current.endDate : date,
            }));
          }}
        />
        <DateField
          id="task-end-date"
          label="종료일"
          value={draft.endDate}
          min={draft.date}
          onChange={(endDate) => set('endDate', endDate < draft.date ? draft.date : endDate)}
        />
        <RadioGroup
          name="task-group"
          label="그룹"
          value={draft.groupId}
          options={groups.map((group) => ({
            value: group.id,
            label: group.name,
            color: group.color,
          }))}
          onChange={(groupId) => set('groupId', groupId)}
        />
        <Switch
          id="task-time"
          label="시간 설정"
          checked={draft.timeEnabled}
          onChange={(checked) => set('timeEnabled', checked)}
        />
        {draft.timeEnabled ? (
          <TimeWheel
            id="task-time-value"
            label="시간"
            value={snapToTimeStep(draft.time)}
            onChange={(time) => set('time', time)}
          />
        ) : null}
        <Switch
          id="task-repeat"
          label="반복"
          checked={draft.recurrenceEnabled}
          onChange={(checked) => set('recurrenceEnabled', checked)}
        />
        {draft.recurrenceEnabled ? (
          <>
            <Select
              id="task-freq"
              label="반복 주기"
              value={draft.freq}
              options={[
                { value: 'daily', label: '매일' },
                { value: 'weekly', label: '매주' },
                { value: 'monthly', label: '매월' },
              ]}
              onChange={(event) => set('freq', event.target.value as TaskDraft['freq'])}
            />
            <DateField
              id="task-until"
              label="종료일"
              value={draft.until}
              onChange={(until) => set('until', until)}
            />
          </>
        ) : null}
        <Switch
          id="task-reminder"
          label="알림"
          checked={draft.reminderEnabled}
          onChange={(checked) => set('reminderEnabled', checked)}
        />
        {draft.reminderEnabled ? (
          <Select
            id="task-offset"
            label="알림 시점"
            value={String(draft.offsetMin)}
            options={[
              { value: '0', label: '정각' },
              { value: '10', label: '10분 전' },
              { value: '30', label: '30분 전' },
              { value: '60', label: '1시간 전' },
            ]}
            onChange={(event) => set('offsetMin', Number(event.target.value))}
          />
        ) : null}
        <TextField
          id="task-memo"
          label="메모"
          multiline
          value={draft.memo}
          placeholder="메모를 남겨두세요"
          onChange={(event) => set('memo', event.target.value)}
        />
      </div>
    </Modal>
  );
}
