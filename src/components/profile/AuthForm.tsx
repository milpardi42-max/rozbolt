"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useLocale } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { href } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { locale, dict } = useLocale();
  const { login, signup } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fa = locale === "fa";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const r = mode === "login"
      ? await login(String(fd.get("email")), String(fd.get("password")))
      : await signup(String(fd.get("name")), String(fd.get("email")), String(fd.get("password")));
    setBusy(false);
    if (!r.ok) return setErr(fa ? "اطلاعات وارد شده معتبر نیست." : "Please check your details.");
    router.push(href(locale, "/account"));
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === "signup" && <Field label={dict.common.name}><Input name="name" required autoComplete="name" /></Field>}
      <Field label={dict.common.email} hint={mode === "login" ? (fa ? "برای ورود به مدیریت: admin@rosieatelier.com" : "For admin access: admin@rosieatelier.com") : undefined}><Input name="email" type="email" required dir="ltr" autoComplete="email" /></Field>
      <Field label={dict.common.password}><Input name="password" type="password" required dir="ltr" minLength={4} autoComplete={mode === "login" ? "current-password" : "new-password"} /></Field>
      {err && <p role="alert" className="text-sm text-error">{err}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{mode === "login" ? dict.nav.login : dict.nav.signup}</Button>
      <p className="text-center text-sm text-foreground-secondary">
        {mode === "login" ? (
          <>{fa ? "حساب ندارید؟" : "No account?"} <Link href={href(locale, "/signup")} className="font-medium text-foreground underline-offset-4 hover:underline">{dict.nav.signup}</Link></>
        ) : (
          <>{fa ? "حساب دارید؟" : "Already have an account?"} <Link href={href(locale, "/login")} className="font-medium text-foreground underline-offset-4 hover:underline">{dict.nav.login}</Link></>
        )}
      </p>
    </form>
  );
}
