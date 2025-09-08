/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Script from "next/script";

import { Fragment, useState } from "react";

// @material-tailwind/react
import {
  Card,
  Typography,
  CardBody,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

// @heroicons/react
import { PricingCard } from "@/widgets/cards";

// @heroicons/react
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AuthFooter, Navbar } from "@/widgets/layout";


// Accordion
function Icon({ id, open }: { id: number; open: number }) {
  return (
    <ChevronDownIcon
      className={`${
        id === open ? "tw-rotate-180" : ""
      } tw-h-5 tw-w-5 tw-transition-transform`}
      strokeWidth={2}
    />
  );
}

export default function PricingPage() {
  const [open, setOpen] = useState(0);

  const handleOpen = (value: React.SetStateAction<number>) =>
    setOpen(open === value ? 0 : value);

  const PRICING_CARD_DATA = [
    {
      title: "Keşif Randevusu",
      price: 4000,
      color: "gray",
      actionColor: "white",
      actionLabel: "Bize Ulaşın",
      actionHref: "/pages/contact-start",
      options: [
        {
          included: true,
          name: "2 kişilik ekip",
        },
        {
          included: true,
          name: "8GB kayıt",
        },
        {
          included: true,
          name: "Yapay zeka destekli tasarım",
        },
        {
          included: true,
          name: "Panel optimizasyonu",
        },
        {
          included: false,
          name: "Engelleri algılama, çatı alanı ölçümü",
        },
        {
          included: false,
          name: "Proje fiyat teklifi",
        },
      ],
    },
  ];
  return (
    <>
      <div className="tw-p-4">
        <div className="tw-container tw-mx-auto tw-z-50 tw-relative">
          {/* {getRoutes(routes)} */}
          <Navbar />
        </div>
        <div className="tw-relative tw-grid tw-h-[50vh] tw-min-h-[50vh] tw-w-full tw-place-items-center tw-overflow-hidden tw-rounded-xl">
          <img
            src="/img/SolarPanel.jpeg"
            className="tw-absolute tw-inset-0 tw-z-0 tw-grid tw-h-full tw-w-full tw-place-items-center tw-rounded-xl tw-object-cover"
            alt="image"
          />
          <div className="tw-absolute tw-top-0 tw-left-0 tw-block tw-h-full tw-w-full tw-bg-black/50" />
          <div className="tw-relative tw-z-10 tw-px-8 tw-text-center">
            <Typography variant="h2" color="white" className="tw-mb-2">
              Geleceğin Enerjisi Çatınızda
            </Typography>
            <Typography variant="paragraph" color="white">
              Türkiye’de güneş sistemleri çatı uygulamalarıyla yaygınlaşıyor;
              estetik ve teknik entegrasyon gelişiyor.
              <br />
              Sitenizin, evinizin çatısının ölçüsünü drone ile kaydedelim.
              <br />
              Yapay zeka ile size en uygun güneş paneli sistemini tasarlayalım.
            </Typography>
          </div>
        </div>
      </div>

      <div className="tw-mx-auto -tw-mt-20 tw-w-full tw-px-12">
        <Card className="tw-mb-44 tw-shadow-black/20 tw-border tw-border-blue-gray-100 tw-shadow-sm">
          <CardBody className="tw-pt-12">
            <div className="tw-container tw-mx-auto">
              <div className="tw-grid tw-place-items-center tw-gap-6 md:tw-grid-cols-1 lg:tw-grid-cols-3">
                {" "}
                <figure className="relative h-96 w-full">
                  <img
                    className="h-full w-full rounded-xl object-cover object-center"
                    src="/img/bizeUlaşın.jpg"
                    alt="nature image"
                  />
                </figure>
                {PRICING_CARD_DATA.map((props) => (
                  <PricingCard key={props.title} {...props} />
                ))}{" "}
                <figure className="relative h-96 w-full">
                  <img
                    className="h-full w-full rounded-xl object-cover object-center"
                    src="/img/pro4mini.jpg"
                    alt="nature image"
                  />
                </figure>
              </div>
              <div className="tw-my-24 tw-mx-auto tw-grid tw-max-w-5xl tw-place-items-center">
                {/* Sayfa Başlığı */}
                <Typography
                  color="blue-gray"
                  variant="h2"
                  className="tw-font-bold"
                >
                  Sık Sorulan Sorular – Güneş Enerjisi, İnovasyon ve
                  Sürdürülebilirlik
                </Typography>

                {/* Açıklama */}
                <Typography
                  color="blue-gray"
                  variant="paragraph"
                  className="tw-my-4 tw-opacity-60 !tw-font-normal"
                >
                  Türkiye’de güneş enerjisi sistemleri, inovatif çözümler ve
                  yapay zeka destekli teknolojilerle çatı uygulamalarında hızla
                  yaygınlaşıyor. SolarOptimizer360 olarak amacımız;
                  sürdürülebilir enerjiye geçişi hızlandırmak, maliyetleri
                  azaltmak ve akıllı sistemlerle herkes için erişilebilir hale
                  getirmektir.
                </Typography>

                {/* Accordion Yapısı */}
                <Fragment>
                  {/* Soru 1 */}
                  <Accordion
                    open={open === 1}
                    icon={<Icon id={1} open={open} />}
                  >
                    <AccordionHeader onClick={() => handleOpen(1)}>
                      <Typography variant="h3" className="tw-font-semibold">
                        Türkiye güneş enerjisi açısından avantajlı mı?
                      </Typography>
                    </AccordionHeader>
                    <AccordionBody className="!tw-font-normal !tw-text-blue-gray-500">
                      Türkiye, 2.737 saatlik yıllık güneşlenme süresiyle
                      Avrupa’nın birçok ülkesinden daha avantajlıdır. Bu
                      potansiyel, yenilenebilir enerji yatırımları ve inovatif
                      güneş teknolojileri için büyük fırsatlar sunar. Akdeniz ve
                      Güneydoğu Anadolu bölgeleri, yeşil enerji projeleri için
                      ideal konumlardır.
                    </AccordionBody>
                  </Accordion>

                  {/* Soru 2 */}
                  <Accordion
                    open={open === 2}
                    icon={<Icon id={2} open={open} />}
                  >
                    <AccordionHeader onClick={() => handleOpen(2)}>
                      <Typography variant="h3" className="tw-font-semibold">
                        Kimler Güneş Paneli İle Elektrik Üretebilir?
                      </Typography>
                    </AccordionHeader>
                    <AccordionBody className="!tw-font-normal !tw-text-blue-gray-500">
                      Güneş paneli kurmak isteyen herkes, uygun çatı veya
                      araziye sahipse başvuru yapabilir. Akıllı enerji
                      sistemleri sayesinde bireyler kendi elektriklerini
                      üretebilir, fazla enerjiyi şebekeye satabilir ve enerji
                      verimliliğini artırabilir. Bu, enerji bağımsızlığı ve
                      sürdürülebilir yaşam için önemli bir adımdır.
                    </AccordionBody>
                  </Accordion>

                  {/* Soru 3 */}
                  <Accordion
                    open={open === 3}
                    icon={<Icon id={3} open={open} />}
                  >
                    <AccordionHeader onClick={() => handleOpen(3)}>
                      <Typography variant="h3" className="tw-font-semibold">
                        Devlet teşviği var mı?
                      </Typography>
                    </AccordionHeader>
                    <AccordionBody className="!tw-font-normal !tw-text-blue-gray-500">
                      Türkiye’de güneş enerjisi sistemleri için devlet
                      destekleri mevcuttur. KOSGEB ve diğer kurumlar, inovatif
                      enerji projelerine hibe ve kredi desteği sağlar. Yeni
                      yasalarla çatı üstü sistemler vergiden muaf tutulur, bu da
                      yeşil teknoloji yatırımlarını teşvik eder. Enerji Piyasası
                      Düzenleme Kurumu’nun yönetmelikleri, bireysel üretimi
                      kolaylaştırarak enerji dönüşümünü hızlandırır.
                    </AccordionBody>
                  </Accordion>

                  {/* Soru 4 */}
                  <Accordion
                    open={open === 4}
                    icon={<Icon id={4} open={open} />}
                  >
                    <AccordionHeader onClick={() => handleOpen(4)}>
                      <Typography variant="h3" className="tw-font-semibold">
                        Çatı üstü sistemler ekonomik mi?
                      </Typography>
                    </AccordionHeader>
                    <AccordionBody className="!tw-font-normal !tw-text-blue-gray-500">
                      Çatı üstü güneş enerji sistemleri, enerji maliyetlerini
                      düşürmenin en ekonomik yoludur. İnovatif panel
                      teknolojileri ve yapay zeka destekli üretim optimizasyonu
                      sayesinde apartmanlar yılda 10.000 TL’ye kadar tasarruf
                      sağlayabilir. Bu sistemler, sürdürülebilir kalkınma ve
                      çevresel sorumluluk açısından da değerlidir.
                    </AccordionBody>
                  </Accordion>

                  {/* Soru 5 */}
                  <Accordion
                    open={open === 5}
                    icon={<Icon id={5} open={open} />}
                  >
                    <AccordionHeader onClick={() => handleOpen(5)}>
                      <Typography variant="h3" className="tw-font-semibold">
                        Ruhsat gerekli mi?
                      </Typography>
                    </AccordionHeader>
                    <AccordionBody className="!tw-font-normal !tw-text-blue-gray-500">
                      Yeni yönetmeliklere göre çatı üstü güneş enerji sistemleri
                      için ruhsat gerekmemektedir. Elektrik dağıtım şirketine
                      başvuru yeterlidir. Bu kolaylık, inovatif enerji
                      çözümlerinin yaygınlaşmasını sağlar. Ayrıca, lisanssız
                      üretim projelerinde belge düzenleme ve vergi
                      yükümlülükleri kaldırılmıştır. Bu da girişimciler ve
                      bireyler için enerji üretimini daha erişilebilir hale
                      getirir.
                    </AccordionBody>
                  </Accordion>
                </Fragment>
              </div>
            </div>
          </CardBody>
        </Card>
        <AuthFooter />
      </div>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Türkiye güneş enerjisi açısından avantajlı mı?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Türkiye, yıllık yüksek güneşlenme süresi sayesinde Avrupa’nın çoğu ülkesine göre avantajlıdır. Bu potansiyel; Akdeniz ve Güneydoğu Anadolu gibi bölgelerde yenilenebilir enerji yatırımları için önemli fırsatlar sunar."
                }
              },
              {
                "@type": "Question",
                "name": "Kimler Güneş Paneli İle Elektrik Üretebilir?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Uygun çatı veya araziye sahip olan herkes güneş paneli sistemi kurabilir. Akıllı enerji sistemleri ile kendi elektriğinizi üretebilir, fazla üretimi şebekeye satabilir ve enerji verimliliğinizi artırabilirsiniz."
                }
              },
              {
                "@type": "Question",
                "name": "Devlet teşviği var mı?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Güneş enerjisi sistemleri için çeşitli destek ve teşvikler mevcuttur. KOSGEB ve ilgili kurumlar hibe/kredi sağlayabilir; çatı üstü sistemler için kolaylaştırılmış süreçler ve vergi muafiyetleri söz konusudur."
                }
              },
              {
                "@type": "Question",
                "name": "Çatı üstü sistemler ekonomik mi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Evet. Çatı üstü GES, enerji maliyetlerini düşürmenin ekonomik bir yoludur. Modern panel teknolojileri ve yapay zeka destekli optimizasyon ile anlamlı yıllık tasarruflar elde edilebilir."
                }
              },
              {
                "@type": "Question",
                "name": "Ruhsat gerekli mi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Güncel düzenlemelerde çatı üstü sistemler için belediye ruhsatı gerekmeyebilir; dağıtım şirketine başvuru ile süreç yürütülür. Lisanssız üretim kapsamında belge ve vergi yükleri sadeleştirilmiştir."
                }
              }
            ]
          })
        }}
      />


      <Script
        id="pricing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Solar Optimizer 360 Keşif Randevusu",
            description: "Drone keşfi ve çatı GES ön fizibilite.",
            brand: { "@type": "Brand", name: "Solar Optimizer 360" },
            offers: {
              "@type": "Offer",
              priceCurrency: "TRY",
              price: 4000,
              url: "https://solaroptimizer360.com/pages/pricing-page",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </>
  );
}
