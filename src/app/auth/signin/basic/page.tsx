"use client";
// app\auth\signin\basic\page.tsx
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button, Typography } from "@/components/MaterialTailwind";

export default function BasicPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSigninPwd, setShowSigninPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMsg("");
  setLoading(true);
  try {
    const res = await fetch("http://localhost:5005/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      credentials: "include", // Cookie için şart
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(data.error || "Hatalı kullanıcı adı veya şifre!"); return; }

    // localStorage.setItem(...) KALDIRILDI
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard/analytics";
    window.location.href = next; // istersen: router.replace(next)
  } catch (err) {
    console.error("Login hatası:", err);
    setMsg("Sunucuya bağlanılamıyor.");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-items-center tw-h-full">
      <div className="tw-w-full tw-min-h-screen tw-grid tw-place-items-center">
        <div className="tw-w-full">
          <div className="tw-text-center">
            <Typography variant="h2" className="!tw-font-bold tw-mb-4">
              Kullanıcı Girişi
            </Typography>
            <Typography className="tw-text-lg !tw-font-normal !tw-text-blue-gray-500">
              Lütfen giriş yapmak için e-posta adresinizi ve şifrenizi girin.
            </Typography>
          </div>

          <form
            className="tw-mt-8 tw-mb-2 tw-mx-auto tw-w-80 tw-max-w-screen-lg lg:tw-w-1/2"
            onSubmit={handleLogin}
          >
            <div className="tw-mb-1 tw-flex tw-flex-col tw-gap-6">
              <Typography
                variant="small"
                color="blue-gray"
                className="-tw-mb-3 !tw-font-medium"
              >
                E-posta adresiniz
              </Typography>
              <Input
                size="lg"
                label="E-posta adresiniz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <Typography
                variant="small"
                color="blue-gray"
                className="-tw-mb-3 !tw-font-medium"
              >
                Şifre
              </Typography>

              {/* sağdaki göz ikonu için ekstra padding */}
              <div className="tw-relative">
                <Input
                  size="lg"
                  label="Şifre"
                  type={showSigninPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="tw-pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSigninPwd((v) => !v)}
                  aria-label={
                    showSigninPwd ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                  className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-blue-gray-500 focus:tw-outline-none"
                >
                  {showSigninPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              className="tw-mt-6"
              fullWidth
              type="submit"
              disabled={loading || !email || !password} // <— artık accepted’a bağlı değil
            >
              {loading ? "Gönderiliyor..." : "Giriş"}
            </Button>

            {msg && (
              <Typography
                className="tw-mt-4"
                color={msg.includes("bağlanılamıyor") ? "red" : "red"}
              >
                {msg}
              </Typography>
            )}

            <div className="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mt-6">
              <Typography
                variant="small"
                className="!tw-font-medium tw-text-gray-900"
              >
                <Link
                  href="/auth/reset/basic-reset"
                  className="!tw-font-medium !tw-text-blue-gray-500 tw-transition-colors hover:tw-text-gray-900 tw-underline"
                  aria-label="Şifre sıfırlama sayfasına git"
                >
                  Şifremi Unuttum?
                </Link>
              </Typography>
            </div>

            <Typography className="tw-text-center !tw-text-blue-gray-500 !tw-font-medium tw-mt-4">
              Henüz bir hesabın yok mu?
              <Link
                href="/auth/signup/basic-signup"
                className="tw-text-gray-900 tw-ml-1"
              >
                Hesap oluştur
              </Link>
            </Typography>
          </form>
        </div>
      </div>

      <div className="tw-p-8 tw-hidden xl:tw-block">
        <img
          src="/img/pattern.png"
          alt="image"
          className="tw-object-cover tw-object-center tw-max-h-[calc(100vh-4rem)] tw-w-full tw-rounded-2xl"
        />
      </div>
    </section>
  );
}
