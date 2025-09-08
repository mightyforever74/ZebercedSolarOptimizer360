"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Checkbox, Button, Typography } from "@/components/MaterialTailwind";
import { TermsModal } from "@/app/terms-and-conditions/page";

export default function BasicSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msgErr, setMsgErr] = useState("");
  const [msgOk, setMsgOk] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsgErr(""); setMsgOk("");
    if (!accepted) { setMsgErr("Şartlar ve Koşullar kabul edilmedi."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setMsgErr(data?.error || "Bu e-posta zaten kayıtlı. Sizi girişe yönlendiriyorum…");
        setTimeout(() => router.push("/auth/signin/basic"), 1200);
        return;
      }
      if (!res.ok) {
        setMsgErr(data?.error || "Sunucu hatası. Lütfen tekrar deneyin.");
        return;
      }

      setMsgOk("Kayıt alındı. Lütfen e-postanızı doğrulama linki için kontrol edin.");
      setTimeout(() => router.push("/auth/signin/basic"), 3000);
    } catch {
      setMsgErr("Sunucuya ulaşılamıyor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-items-center tw-h-full">
      <div className="tw-p-8 tw-hidden xl:tw-block">
        <img src="/img/pattern.png" alt="image"
             className="tw-object-cover tw-object-center tw-max-h-[calc(100vh-4rem)] tw-w-full tw-rounded-2xl" />
      </div>

      <div className="tw-w-full tw-min-h-screen tw-grid tw-place-items-center">
        <div className="tw-w-full">
          <div className="tw-text-center">
            <Typography variant="h2" className="!tw-font-bold tw-mb-4">Kayıt Olun</Typography>
            <Typography className="tw-text-lg tw-font-normal !tw-text-blue-gray-500">
              Lütfen e-posta adresinizi girin. Şifre belirleme bağlantısı e-postanıza gönderilecektir.
            </Typography>
          </div>

          <form className="tw-mt-8 tw-mb-2 tw-mx-auto tw-w-80 tw-max-w-screen-lg lg:tw-w-1/2"
                onSubmit={handleSubmit} noValidate>
            <div className="tw-mb-1 tw-flex tw-flex-col tw-gap-6">
              <Typography variant="small" color="blue-gray" className="-tw-mb-3 !tw-font-medium">
                E-posta adresiniz
              </Typography>
              <Input
                size="lg"
                label="E-posta adresiniz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <Checkbox
              id="terms"
              name="terms"
              required
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              label={
                <span className="tw-text-blue-gray-500 tw-font-medium">
                  <button type="button"
                          onClick={() => setShowTerms(true)}
                          className="tw-underline hover:tw-text-gray-900 tw-transition-colors">
                    Tüm Şartlar ve Koşulları
                  </button> kabul ediyorum.
                </span>
              }
              containerProps={{ className: "-tw-ml-2.5" }}
            />

            {msgErr && <div className="tw-mt-2 tw-text-red-500 tw-text-sm">{msgErr}</div>}
            {msgOk  && <div className="tw-mt-2 tw-text-green-600 tw-text-sm">{msgOk}</div>}

            <Button className="tw-mt-6" fullWidth type="submit"
                    disabled={submitting || !email || !accepted}>
              {submitting ? "Gönderiliyor..." : "Kayıt Ol"}
            </Button>

            <Typography variant="paragraph"
              className="tw-text-center !tw-text-blue-gray-500 tw-font-medium tw-mt-4">
              Zaten hesabınız var mı?
              <a href="/auth/signin/basic" className="tw-text-gray-900 tw-ml-1">Giriş yap</a>
            </Typography>
          </form>
        </div>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </section>
  );
}
