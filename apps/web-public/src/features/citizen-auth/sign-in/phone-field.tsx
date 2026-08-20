"use client";

import { Field } from "@jp/tribune/components/field";
import { Input } from "@jp/tribune/components/input";
import { Link } from "@jp/tribune/components/link";
import { Trans } from "@lingui/react/macro";
import type React from "react";
import { useCallback } from "react";

export function PhoneField({
  value,
  onChange,
  disabled,
  locked,
  onEdit,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
  locked: boolean;
  onEdit: () => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.replace(/\D/g, ""));
    },
    [onChange]
  );
  return (
    <Field.Root>
      <div className="flex items-center justify-between">
        <Field.Label htmlFor="phone">
          <Trans>Mobile Number</Trans>
        </Field.Label>
        {!!locked && (
          <Link
            onClick={onEdit}
            render={<button type="button" />}
            tone="neutral"
            underline="hover"
          >
            Edit
          </Link>
        )}
      </div>
      {/* Locked = confirmed content behind an Edit affordance, not an unavailable
          control — readonly keeps it legible, disabled would grey it out. */}
      <Input
        disabled={disabled && !locked}
        fullWidth
        id="phone"
        inputMode="numeric"
        maxLength={10}
        onChange={handleChange}
        placeholder="9876543210"
        prefix="+91"
        readOnly={locked}
        size="lg"
        type="tel"
        value={value}
      />
    </Field.Root>
  );
}
