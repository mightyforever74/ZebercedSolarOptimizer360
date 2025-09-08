"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, Button, Typography } from "@/components/MaterialTailwind";
import { Eye, EyeOff } from "lucide-react";

function isStrongPassword(pw: string) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

export default function SetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // URL'deki token'ı sessionStorage'a al ve URL'i temizle (gizlilik)
  useEffect(() => {
    const qp = params.get("token");
    if (qp) {
      sessionStorage.setItem("signup_setpw_token", qp);
      setToken(qp);
      // URL'den token'ı kaldır
      router.replace("/auth/set-password");
    } else {
      const saved = typeof window !== "undefined"
        ? sessionStorage.getItem("signup_setpw_token")
        : null;
      if (saved) setToken(saved);
    }
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");

    if (!token) { setMsg("Geçersiz bağlantı."); return; }
    if (!pwd1 || !pwd2) { setMsg("Lütfen şifrenizi girin."); return; }
    if (pwd1 !== pwd2) { setMsg("Şifreler eşleşmiyor."); return; }
    if (!isStrongPassword(pwd1)) {
      setMsg("Şifre en az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pwd1 }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "İşlem başarısız.");
      } else {
        setMsg("Şifreniz oluşturuldu ve hesabınız doğrulandı. Girişe yönlendiriliyorsunuz…");
        sessionStorage.removeItem("signup_setpw_token");
        setTimeout(() => router.push("/auth/signin/basic"), 1200);
      }
    } catch {
      setMsg("Sunucuya ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
        <Typography color="red">Link geçersiz veya eksik.</Typography>
      </section>
    );
  }

  return (
    <section className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-screen">
      <form onSubmit={handleSubmit} className="tw-w-96 tw-bg-white tw-p-8 tw-rounded-lg tw-shadow-md">
        <Typography variant="h4" className="tw-mb-6">Şifre Belirle</Typography>

        <div className="tw-space-y-4">
          {/* Şifre */}
          <div className="tw-relative">
            <Input
              size="lg"
              label="Şifre"
              type={show1 ? "text" : "password"}
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              autoComplete="new-password"
              className="tw-pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow1((v) => !v)}
              aria-label={show1 ? "Şifreyi gizle" : "Şifreyi göster"}
              className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-blue-gray-500"
            >
              {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Şifre (Tekrar) */}
          <div className="tw-relative">
            <Input
              size="lg"
              label="Şifre (Tekrar)"
              type={show2 ? "text" : "password"}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              autoComplete="new-password"
              className="tw-pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow2((v) => !v)}
              aria-label={show2 ? "Şifreyi gizle" : "Şifreyi göster"}
              className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-blue-gray-500"
            >
              {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button className="tw-mt-6" fullWidth type="submit" disabled={loading}>
          {loading ? "Gönderiliyor..." : "Şifreyi Kaydet"}
        </Button>

        {msg && (
          <Typography className="tw-mt-4" color={msg.includes("yönlendiriliyorsunuz") ? "green" : "red"}>
            {msg}
          </Typography>
        )}
      </form>
    </section>
  );
}
