import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  id: string;
  label: string;
  hint?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export function TextField(props: InputProps | TextareaProps) {
  const { id, label, hint } = props;

  return (
    <div className="form-group flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {props.multiline ? (
        <textarea
          {...omitLayout(props)}
          id={id}
          className="krds-input min-h-24 w-full resize-y rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-faint"
        />
      ) : (
        <input
          {...omitLayout(props)}
          id={id}
          className="krds-input h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink placeholder:text-faint"
        />
      )}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function omitLayout<T extends BaseProps>(props: T) {
  const { id: _id, label: _label, hint: _hint, multiline: _multiline, ...rest } = props as T & {
    multiline?: boolean;
  };
  return rest;
}
