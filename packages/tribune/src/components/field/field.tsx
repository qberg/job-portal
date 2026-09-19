import { Field as BaseField } from "@base-ui/react/field";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./field.css";

type FieldRootProps = React.ComponentProps<typeof BaseField.Root>;

function FieldRoot({ className, ...props }: FieldRootProps) {
  return <BaseField.Root className={cn("tbn-field", className)} {...props} />;
}

type FieldLabelProps = React.ComponentProps<typeof BaseField.Label> & {
  required?: boolean;
  optional?: boolean;
};

function FieldLabel({
  className,
  required,
  optional,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <BaseField.Label className={cn("tbn-field__label", className)} {...props}>
      {children}
      {!!required && (
        <span aria-hidden="true" className="tbn-field__required">
          *
        </span>
      )}
      {!required && optional && (
        <span className="tbn-field__optional">(optional)</span>
      )}
    </BaseField.Label>
  );
}

type FieldDescriptionProps = React.ComponentProps<typeof BaseField.Description>;

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <BaseField.Description
      className={cn("tbn-field__description", className)}
      {...props}
    />
  );
}

type ValidityKey =
  | "valueMissing"
  | "tooShort"
  | "tooLong"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "typeMismatch"
  | "badInput"
  | "customError"
  | "valid";

type FieldErrorProps = {
  match?: ValidityKey | Partial<Record<ValidityKey, string>> | boolean;
  children?: React.ReactNode;
  className?: string;
};

function FieldError({ match, children, className }: FieldErrorProps) {
  const cls = cn("tbn-field__error", className);

  // object form: one BaseField.Error per validity key
  if (
    typeof match === "object" &&
    match !== null &&
    typeof match !== "boolean"
  ) {
    return (
      <>
        {Object.entries(match).map(([key, msg]) => (
          <BaseField.Error className={cls} key={key} match={key as ValidityKey}>
            {msg}
          </BaseField.Error>
        ))}
      </>
    );
  }

  if (match !== undefined) {
    return (
      <BaseField.Error className={cls} match={match}>
        {children}
      </BaseField.Error>
    );
  }

  if (!children) {
    return null;
  }

  // external state owns visibility; role="alert" gives SR live-region without coupling to Base UI ValidityState
  return (
    <p className={cls} role="alert">
      {children}
    </p>
  );
}

export const Field = Object.assign(FieldRoot, {
  Description: FieldDescription,
  Error: FieldError,
  Label: FieldLabel,
  Root: FieldRoot,
});

export type {
  FieldDescriptionProps,
  FieldErrorProps,
  FieldLabelProps,
  FieldRootProps,
};
