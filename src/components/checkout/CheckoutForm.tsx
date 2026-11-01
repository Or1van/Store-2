"use client";

import { useActionState } from "react";
import { checkoutAction } from "@/app/actions/checkout";
import type { FormState } from "@/lib/validation";
import styles from "@/app/pages.module.css";

type Props = { defaultName: string; demo: boolean; total: string };

const FIELDS = [
  { name: "fullName", label: "Ім'я та прізвище", autoComplete: "name", type: "text" },
  { name: "phone", label: "Телефон", autoComplete: "tel", type: "tel", placeholder: "+380 67 123 45 67" },
  { name: "city", label: "Місто", autoComplete: "address-level2", type: "text" },
  { name: "branch", label: "Відділення або поштомат Нової пошти", autoComplete: "off", type: "text", placeholder: "Відділення № 12" },
] as const;

export function CheckoutForm({ defaultName, demo, total }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(checkoutAction, {});
  const err = state.errors ?? {};
  const values = state.values ?? { fullName: defaultName };

  return (
    <form action={action} className={styles.checkout} noValidate>
      <h2 className={styles.summaryTitle}>Доставка</h2>
      <div className={styles.fields}>
        {FIELDS.map((f) => (
          <div key={f.name} className="field">
            <label htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              className="input"
              autoComplete={f.autoComplete}
              placeholder={"placeholder" in f ? f.placeholder : undefined}
              defaultValue={values[f.name]}
              aria-invalid={Boolean(err[f.name])}
              aria-describedby={err[f.name] ? `${f.name}-error` : undefined}
              required
            />
            {err[f.name] && (
              <p id={`${f.name}-error`} className="field-error">
                {err[f.name]}
              </p>
            )}
          </div>
        ))}
        <div className={`field ${styles.full}`}>
          <label htmlFor="comment">Коментар до замовлення</label>
          <textarea id="comment" name="comment" className="input" rows={3} defaultValue={values.comment} maxLength={500} />
        </div>
      </div>

      {state.message && (
        <p className="form-message" role="alert">
          {state.message}
        </p>
      )}

      <button className="btn btn--dark btn--wide" disabled={pending}>
        {pending ? "Оформлюємо…" : demo ? `Оформити замовлення на ${total}` : `Перейти до оплати ${total}`}
      </button>
      <p className={styles.hint}>
        {demo
          ? "Демо-режим: платіжну систему не підключено, тож замовлення одразу позначиться оплаченим."
          : "Оплата карткою на захищеній сторінці Stripe. Ми не бачимо і не зберігаємо дані картки."}
      </p>
    </form>
  );
}
