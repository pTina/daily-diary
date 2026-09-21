type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
};

export function Checkbox({ id, checked, onChange, label, ariaLabel }: Props) {
  return (
    <div className="krds-form-check relative flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
        className="peer h-4.5 w-4.5 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-line-strong bg-paper checked:border-ink checked:bg-ink"
      />
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-[3px] top-1/2 h-3 w-3 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
        aria-hidden
      >
        <path d="M3.2 8.2 6.1 11l6.7-7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      {label ? (
        <label htmlFor={id} className="ml-2 cursor-pointer text-sm text-ink">
          {label}
        </label>
      ) : null}
    </div>
  );
}
