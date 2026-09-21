import { useId } from 'react';

type Option = {
  value: string;
  label: string;
  color?: string;
};

type Props = {
  name: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function RadioGroup({ name, label, value, options, onChange }: Props) {
  const labelId = useId();

  return (
    <div className="form-group flex flex-col gap-1.5" role="radiogroup" aria-labelledby={labelId}>
      <div id={labelId} className="text-sm font-medium text-ink">
        {label}
      </div>
      <div className="krds-check-area flex flex-wrap gap-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const selected = value === option.value;
          return (
            <div key={option.value} className="krds-form-chip">
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <label
                htmlFor={id}
                className={`krds-btn-tag inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected
                    ? 'border-ink bg-ink text-white'
                    : 'border-line-strong bg-paper text-ink hover:bg-canvas'
                }`}
              >
                {option.color ? (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                    aria-hidden
                  />
                ) : null}
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
