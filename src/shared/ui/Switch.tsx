type Props = {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function Switch({ id, checked, label, onChange }: Props) {
  return (
    <div className="krds-form-toggle-switch flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-line-strong'}`}
      >
        <i
          className={`absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}
