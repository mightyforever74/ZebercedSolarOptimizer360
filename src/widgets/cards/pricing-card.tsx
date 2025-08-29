import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import {
  ArrowRightIcon,
  CheckIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

type PricingCardProps = {
  title: string;
  price: number;
  color?: string;
  actionColor?: string;
  actionLabel?: string;
  actionRoute?: string;
  actionHref?: string; // ⬅️ YENİ
  options: { included: boolean; name: string }[];
  actionSlot?: React.ReactNode;
};

export function PricingCard({
  title,
  price,
  options,
  color,
  actionColor,
  actionRoute,
  actionHref,
  actionLabel,
  actionSlot,
}: PricingCardProps) {
  const isLowContrast =
    color === "white" || color === "lime" || color === "yellow";

  return (
    <Card
      color={color as any}
      shadow={color === "white" ? false : true}
      variant="gradient"
      className={`tw-w-full tw-p-8`}
    >
      <div>
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="tw-m-0 tw-mb-8 tw-rounded-none tw-border-b tw-border-white/10 tw-pb-8 tw-text-center"
        >
          <Typography
            variant="small"
            className="!tw-font-normal tw-uppercase"
            color={isLowContrast ? "blue-gray" : "white"}
          >
            {title}
          </Typography>
          <Typography
            variant="h1"
            color={isLowContrast ? "blue-gray" : "white"}
            className="tw-mt-6 tw-flex tw-justify-center tw-gap-1 tw-text-5xl"
          >
            <span className="-tw-mt-1 tw-text-xl">₺</span>
            {price} <span className="tw-self-end tw-text-xl">/ay</span>
          </Typography>
        </CardHeader>
        {options && (
          <CardBody className="tw-p-0">
            <ul className="tw-flex tw-flex-col tw-gap-4">
              {options.map(({ name, included }, key) => (
                <li
                  key={key}
                  className={`tw-flex tw-items-center tw-gap-4 ${
                    isLowContrast ? "tw-text-blue-gray-700" : "tw-text-white"
                  }`}
                >
                  <span className="tw-rounded-full">
                    {included ? (
                      <CheckIcon strokeWidth={2} className="tw-h-5 tw-w-5" />
                    ) : (
                      <MinusIcon strokeWidth={2} className="tw-h-5 tw-w-5" />
                    )}
                  </span>
                  <Typography className="!tw-container !tw-font-normal">
                    {name}
                  </Typography>
                </li>
              ))}
            </ul>
          </CardBody>
        )}
        <CardFooter className="tw-mt-6 tw-p-0">
          <div className="tw-mt-4 tw-flex tw-justify-end">
            {actionSlot ? (
              actionSlot
            ) : actionHref ? (
              <Link href={actionHref} className="tw-ml-auto">
                <Button
                  size="sm"
                  variant="gradient"
                  className="tw-w-32 tw-bg-blue-500"
                >
                  {actionLabel ?? "bize ulaşın"}
                </Button>
              </Link>
            ) : actionRoute ? (
              <Link href={actionRoute} className="tw-ml-auto">
                <Button
                  size="sm"
                  variant="gradient"
                  className="tw-w-32 tw-bg-blue-500"
                >
                  {actionLabel ?? "devam"}
                </Button>
              </Link>
            ) : null}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}

export default PricingCard;
