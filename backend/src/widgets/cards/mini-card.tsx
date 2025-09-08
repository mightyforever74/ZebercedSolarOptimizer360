// src/widgets/cards/mini-card.tsx
import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";

import type { color } from "@material-tailwind/react/types/components/card";

type PropTypes = {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color?: color; // <-- DÜZELTİLDİ!
};
const MiniCard = ({ icon, title, value, color = "gray" }: PropTypes) => (
  <Card className="!tw-flex-row tw-items-center tw-justify-between tw-border tw-border-blue-gray-100 tw-shadow-sm">
    <CardHeader
      floated={false}
      shadow={false}
      className="tw-m-4 tw-grid tw-h-16 tw-w-16 tw-place-items-center tw-rounded-lg"
      variant="gradient"
      color={color}
    >
      {React.createElement(icon, {
        className: "tw-w-6 tw-h-6 tw-text-white",
      })}
    </CardHeader>
    <CardBody className="tw-py-4 tw-pr-5 tw-pl-4">
      <Typography
        variant="small"
        className="tw-mb-1 tw-block tw-text-right !tw-font-normal !tw-text-blue-gray-500"
      >
        {title}
      </Typography>
      <Typography color="blue-gray" variant="h5" className="tw-text-right">
        {value}
      </Typography>
    </CardBody>
  </Card>
);

export default MiniCard;
