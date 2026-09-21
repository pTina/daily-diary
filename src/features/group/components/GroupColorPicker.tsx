import { GROUP_COLOR_PRESETS, type Group } from '@/shared/types/group';

type Props = {
  group: Group;
  otherColor: string;
  onChange: (color: string) => void;
};

export function GroupColorPicker({ group, otherColor, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
        {group.name} 색상
      </legend>
      <div className="flex flex-wrap gap-2">
        {GROUP_COLOR_PRESETS.map((color) => {
          const taken = color === otherColor;
          const selected = color === group.color;
          return (
            <button
              key={color}
              type="button"
              disabled={taken}
              aria-label={`${group.name} 색상 ${color}${taken ? ', 다른 그룹이 사용 중' : ''}`}
              onClick={() => onChange(color)}
              className={`h-9 w-9 rounded-full border-2 ${selected ? 'border-ink' : 'border-transparent'} ${taken ? 'cursor-not-allowed opacity-30' : ''}`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
