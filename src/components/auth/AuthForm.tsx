"use client";

import Link from "next/link";
import { type InputHTMLAttributes, useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation";
import styles from "./auth.module.css";

type Props = { mode: "login" | "register"; next: string };

export function AuthForm({ mode, next }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? loginAction : registerAction, {});
  const err = state.errors ?? {};
  const values = state.values ?? {};
  const suffix = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  const field = (name: "name" | "email" | "password", label: string, props: InputHTMLAttributes<HTMLInputElement>) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className="input"
        defaultValue={name === "password" ? undefined : values[name]}
        aria-invalid={Boolean(err[name])}
        aria-describedby={err[name] ? `${name}-error` : name === "password" && mode === "register" ? "password-hint" : undefined}
        required
        {...props}
      />
      {err[name] ? (
        <p id={`${name}-error`} className="field-error">
          {err[name]}
        </p>
      ) : (
        name === "password" &&
        mode === "register" && (
          <p id="password-hint" className="field-hint">
            Щонайменше 10 символів. Фраза з кількох слів запам&apos;ятовується легше.
          </p>
        )
      )}
    </div>
  );

  return (
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />
      {mode === "register" && field("name", "Ім'я", { autoComplete: "name", maxLength: 60 })}
      {field("email", "Пошта", { type: "email", autoComplete: "email", maxLength: 254 })}
      {field("password", "Пароль", {
        type: "password",
        autoComplete: mode === "login" ? "current-password" : "new-password",
        maxLength: 128,
      })}

      {state.message && (
        <p className="form-message" role="alert">
          {state.message}
        </p>
      )}

      <button className="btn btn--dark btn--wide" disabled={pending}>
        {pending ? "Зачекайте…" : mode === "login" ? "Увійти" : "Створити акаунт"}
      </button>

      <p className={styles.switch}>
        {mode === "login" ? (
          <>
            Вперше тут? <Link href={`/register${suffix}`}>Створіть акаунт</Link>
          </>
        ) : (
          <>
            Уже маєте акаунт? <Link href={`/login${suffix}`}>Увійдіть</Link>
          </>
        )}
      </p>
    </form>
  );
}
