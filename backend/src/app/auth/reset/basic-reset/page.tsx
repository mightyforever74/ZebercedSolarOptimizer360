"use client";
//app\auth\reset\basic-reset\page.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Head from "next/head";
import { Input, Button, Typography } from "@/components/MaterialTailwind";
import { Eye, EyeOff } from "lucide-react";

export default function BasicResetPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Token'ı burada tutacağız (URL'den okuyup URL'i temizleyeceğiz)
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Forgot form state
  const [email, setEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset form state
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  //göz ikonu) eklemek için küçük bir state 
  const [showPwd1, setShowPwd1] = useState(false); // Yeni Şifre
  const [showPwd2, setShowPwd2] = useState(false); // Yeni Şifre (Tekrar)


  // 1) İlk gelişte token'ı URL'den al, sessionStorage'a koy, URL'i temizle
  useEffect(() => {
    // 1.a Query-string'den dene
    const qp = params.get("token");
    if (qp) {
      sessionStorage.setItem("reset_token", qp);
      setResetToken(qp);
      // URL'den token'ı kaldır (loglara düşmesini de engeller)
      router.replace("/auth/reset/basic-reset");
      return;
    }
    // 1.b Önceden kaydedilmişse sessionStorage'dan yükle
    const saved = typeof window !== "undefined"
      ? sessionStorage.getItem("reset_token")
      : null;
    if (saved) setResetToken(saved);
  }, [params, router]);

  // Forgot submit
  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotMsg(data.error || "E-posta gönderimi başarısız.");
      } else {
        setForgotMsg("Şifre sıfırlama e-postası gönderildi. Gelen kutunuzu kontrol edin.");
        setForgotSent(true);
      }
    } catch {
      setForgotMsg("Sunucuya ulaşılamıyor.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Reset submit
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg("");

    if (!resetToken) {
      setResetMsg("Geçersiz veya eksik bağlantı.");
      setResetLoading(false);
      return;
    }
    if (password !== password2) {
      setResetMsg("Şifreler eşleşmiyor.");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetMsg(data.error || "Şifre sıfırlama başarısız.");
      } else {
        setResetMsg("Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz…");
        // token'ı bellekten de sil
        sessionStorage.removeItem("reset_token");
        setTimeout(() => {
          router.push("/auth/signin/basic");
        }, 1200);
      }
    } catch {
      setResetMsg("Sunucuya ulaşılamıyor.");
    } finally {
      setResetLoading(false);
    }
  };

  // --- Görünümler ---
  const hasToken = !!resetToken;

  return (
    <section className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-screen">
      <Head>
        {/* Token'ın üçüncü taraflara referer ile gitmesini engelle */}
        <meta name="referrer" content="no-referrer" />
      </Head>

      {!hasToken ? (
        // 1) Token YOK → Forgot (e-posta iste)
        <form
          onSubmit={handleForgot}
          className="tw-w-96 tw-bg-white tw-p-8 tw-rounded-lg tw-shadow-md"
        >
          <Typography variant="h4" className="tw-mb-6">
            Şifre Sıfırlama
          </Typography>
          <Input
            size="lg"
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            className="tw-mt-6"
            fullWidth
            type="submit"
            disabled={forgotLoading || forgotSent} // istersen disabled bırak
          >
            {forgotLoading
              ? "Gönderiliyor..."
              : (forgotSent ? "Bağlantı gönderildi" : "Bağlantı Gönder")}
          </Button>
          {forgotMsg && (
            <Typography className="tw-mt-4" color={forgotMsg.includes("gönderildi") ? "green" : "red"}>
              {forgotMsg}
            </Typography>
          )}
        </form>
      ) : (
        // 2) Token VAR → Reset (yeni şifre belirle)
        <form
          onSubmit={handleReset}
          className="tw-w-96 tw-bg-white tw-p-8 tw-rounded-lg tw-shadow-md"
        >
          <Typography variant="h4" className="tw-mb-6">
            Yeni Şifre Belirle
          </Typography>

          <div className="tw-space-y-4">
            {/* Yeni Şifre */}
            <div className="tw-relative">
              <Input
                size="lg"
                label="Yeni Şifre"
                type={showPwd1 ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="tw-pr-10"  // ikon için sağ padding
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd1((v) => !v)}
                aria-label={showPwd1 ? "Şifreyi gizle" : "Şifreyi göster"}
                className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-blue-gray-500 focus:tw-outline-none"
              >
                {showPwd1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Yeni Şifre (Tekrar) */}
            <div className="tw-relative">
              <Input
                size="lg"
                label="Yeni Şifre (Tekrar)"
                type={showPwd2 ? "text" : "password"}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
                className="tw-pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd2((v) => !v)}
                aria-label={showPwd2 ? "Şifreyi gizle" : "Şifreyi göster"}
                className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-blue-gray-500 focus:tw-outline-none"
              >
                {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button className="tw-mt-6" fullWidth type="submit" disabled={resetLoading}>
            {resetLoading ? "Gönderiliyor..." : "Şifreyi Sıfırla"}
          </Button>

          {resetMsg && (
            <Typography
              className="tw-mt-4"
              color={resetMsg.includes("başarı") ? "green" : "red"}
            >
              {resetMsg}
            </Typography>
          )}
        </form>
      )}
    </section>
  );
}
