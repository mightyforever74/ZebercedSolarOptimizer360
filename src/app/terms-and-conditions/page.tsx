"use client";
// src/app/terms-and-conditions/page.tsx
import { useEffect } from "react";
import { Card, Typography } from "@material-tailwind/react";

/** Modal props: child component olarak kullanmak için */
export type TermsModalProps = {
  open: boolean;
  onClose: () => void;
  /** true: içerikteki herhangi bir tık da kapatsın (varsayılan: true) */
  closeOnAnyClick?: boolean;
};

/** Ortak içerik — hem sayfada hem modalda kullanılacak */
export function TermsContent() {
  return (
    <>
      {/* Ana Başlık */}
      <Typography variant="h1" className="tw-mb-6 tw-font-bold tw-text-blue-gray-800">
        Şartlar ve Koşullar – SolarOptimizer360
      </Typography>

      <Typography variant="paragraph" className="tw-mb-6 tw-text-blue-gray-600">
        SolarOptimizer360, yapay zekâ destekli güneş paneli yerleşim algoritmalarıyla
        sürdürülebilir enerjiye geçişi kolaylaştıran bir web uygulamasıdır. Kullanıcı dostu
        arayüzü, gelişmiş analiz modülleri ve çatı üzerindeki engellere duyarlı hesaplama
        sistemleriyle enerji verimliliğini artırmayı hedefler.
      </Typography>

      <ul className="tw-list-disc tw-pl-6 tw-space-y-6 tw-text-blue-gray-600">
        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            Genel Kullanım
          </Typography>
          SolarOptimizer360 yalnızca görselleştirme ve analiz amaçlıdır. Mühendislik
          kararları için profesyonel danışmanlık önerilir. Uygulama, kullanıcıya panel
          yerleşimi konusunda öneriler sunar ancak nihai karar kullanıcıya aittir.
        </li>

        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            İnovasyon ve Fonksiyonellik
          </Typography>
          Uygulama; klasik grid algoritması, greedy iyileştirme, RL/GA tabanlı AI
          optimizasyonu gibi modüler yerleşim stratejileri sunar. 
        </li>

        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            Fikri Mülkiyet
          </Typography>
          SolarOptimizer360’a ait tüm algoritmalar, bileşenler ve görselleştirme sistemleri
          telif hakkı ile korunmaktadır. Kodun izinsiz kopyalanması, çoğaltılması veya ticari
          amaçla kullanılması yasaktır.
        </li>

        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            Veri Gizliliği ve Oturum Takibi
          </Typography>
          Uygulama, kullanıcı oturumlarını LocalStorage üzerinden takip eder. Kişisel veriler
          toplanmaz, analizler anonim olarak gerçekleştirilir. Kullanıcı deneyimi iyileştirmek
          amacıyla oturum verileri geçici olarak saklanabilir.
        </li>

        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            Sorumluluk Reddi
          </Typography>
          SolarOptimizer360 tarafından sunulan yerleşim önerileri, kesinlik garantisi taşımaz.
          Uygulama sonuçlarına dayanarak yapılan kurulumlardan doğabilecek zararlardan geliştirici
          sorumlu tutulamaz.
        </li>

        <li>
          <Typography variant="h5" className="tw-font-bold tw-text-blue-gray-800">
            Yasal Geçerlilik
          </Typography>
          Bu uygulama Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir uyuşmazlık durumunda
          İstanbul mahkemeleri yetkilidir.
        </li>
      </ul>

      <Typography variant="small" className="tw-mt-8 tw-text-blue-gray-500">
        Son güncelleme: Ağustos 2025 – Sürüm 2.1 “AI Optimizer & Quality Checker”
      </Typography>
    </>
  );
}

/** Child modal: signup vb. yerlerde popup olarak kullanın */
export function TermsModal({ open, onClose, closeOnAnyClick = true }: TermsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="tw-fixed tw-inset-0 tw-z-[1000] tw-bg-black/60 tw-flex tw-items-center tw-justify-center"
      onClick={onClose} // overlay'e tıkla → kapat
    >
      <div
        className="tw-bg-white tw-rounded-xl tw-shadow-xl tw-w-full tw-max-w-3xl tw-mx-4 tw-p-6 tw-max-h-[80vh] tw-overflow-y-auto"
        onClick={closeOnAnyClick ? onClose : (e) => e.stopPropagation()}
      >
        <TermsContent />
        <Typography variant="small" className="tw-mt-4 tw-text-blue-gray-400">
          (Herhangi bir yere tıklayarak kapatabilirsiniz. ESC tuşu da çalışır.)
        </Typography>
      </div>
    </div>
  );
}

/** Default export: sayfa rotası için tam sayfa görünüm */
export default function TermsAndConditionsPage() {
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
      <Card className="tw-p-8 tw-shadow-lg tw-rounded-xl tw-bg-white">
        <TermsContent />
      </Card>
    </div>
  );
}
