"use client";
import React from "react";
import { Card, CardBody, Typography, Input, Button } from "@material-tailwind/react";

export default function ContactStartPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5005";

  // --- State ---
  const [projectName, setProjectName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");     // ✅ yeni
  const [phone, setPhone] = React.useState("");           // ✅ yeni
  const [subject, setSubject] = React.useState("Drone randevusu");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false); setLoading(true);
    try {
      const res = await fetch(`${API}/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_name: projectName,
          email,
          full_name: fullName,     // ✅
          phone,                   // ✅
          subject,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gönderim başarısız");

      setOk(true);
      setProjectName(""); setEmail(""); setFullName(""); setPhone(""); setMessage("");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tw-max-w-lg tw-mx-auto tw-p-6">
      <Card className="tw-shadow-md tw-rounded-2xl">
        <CardBody>
          <Typography variant="h4" className="!tw-font-semibold tw-mb-4">Bize Ulaşın</Typography>

          <form onSubmit={onSubmit} className="tw-space-y-4">
            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">Proje Adı</Typography>
              <Input value={projectName} onChange={(e)=>setProjectName(e.target.value)} required crossOrigin="" />
            </div>

            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">Ad Soyad</Typography>
              <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} required crossOrigin="" />
            </div>

            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">Telefon</Typography>
              <Input value={phone} onChange={(e)=>setPhone(e.target.value)} crossOrigin="" />
            </div>

            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">E-posta</Typography>
              <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required crossOrigin="" />
            </div>

            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">Konu</Typography>
              <Input value={subject} onChange={(e)=>setSubject(e.target.value)} required crossOrigin="" />
            </div>

            <div>
              <Typography variant="small" className="tw-mb-1 tw-block">Mesaj</Typography>
              <textarea
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                rows={5}
                required
                className="tw-w-full tw-rounded-md tw-border tw-border-blue-gray-200 tw-p-3 focus:tw-outline-none focus:tw-ring"
              />
            </div>

            {err && <Typography className="tw-text-red-600">{err}</Typography>}
            {ok  && <Typography className="tw-text-green-700">Posta gönderildi ✅</Typography>}

            <div className="tw-flex tw-justify-end">
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
