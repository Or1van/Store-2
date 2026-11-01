"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/actions/newsletter";
import { ArrowUpRight } from "@/components/ui/icons";
import type { FormState } from "@/lib/validation";
import styles from "./home.module.css";

export function Newsletter() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeAction, {});
  const error = state.errors?.email;

  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-title">
      <div className={`container ${styles.newsletterGrid}`}>
        <div>
          <h2 id="newsletter-title" className={styles.newsletterTitle}>
            Дізнавайтесь про нові партії першими
          </h2>
          <p className="muted">Один лист на місяць: що пошили, що повернулося в наявність. Без щоденних знижок.</p>
        </div>

        <form action={action} className={styles.subscribe} noValidate>
          <label htmlFor="newsletter-email" className="visually-hidden">
            Ваша пошта
          </label>
          {/* Honeypot for bots; hidden from people and from assistive tech. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="visually-hidden" aria-hidden="true" />
          <div className={styles.subscribeRow}>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              className="input"
              placeholder="Ваша пошта"
              autoComplete="email"
              defaultValue={state.values?.email}
              aria-invalid={Boolean(error)}
              aria-describedby="newsletter-status"
              required
            />
            <button className="btn btn--dark" disabled={pending}>
              {pending ? "Підписуємо…" : "Підписатися"} <ArrowUpRight />
            </button>
          </div>
          <p id="newsletter-status" className="form-message" data-ok={Boolean(state.ok)} role="status">
            {error ?? state.message ?? ""}
          </p>
        </form>

        <div className={styles.showroom}>
          <h3>Шоурум у Києві</h3>
          <p className="muted">
            Поділ, вул. Кирилівська, 41
            <br />
            Щодня з 11:00 до 20:00
          </p>
        </div>
      </div>
    </section>
  );
}
