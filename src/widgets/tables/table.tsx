//C:\Projects\solar-optimizer360\src\widgets\tables\table.tsx
import React from "react";

// @material-tailwind/react
import { Typography, Avatar } from "@material-tailwind/react";

type PropTypes = {
  data: Record<string, any>[];
};
export function Table({ data }: PropTypes) {
  // Eğer data boşsa render etme
  if (!data || data.length === 0) return <div>Veri yok</div>;

  // Sütun başlıklarını ilk objeden bul
  const columns = Object.keys(data[0]);
  return (
    <table className="tw-w-full !tw-min-w-[480px] !tw-table-auto">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              className="tw-py-2 tw-px-4 tw-text-center tw-bg-gray-100 tw-text-sm tw-font-bold tw-text-blue-gray-700"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((obj, rowKey) => (
          <tr
            key={rowKey}
            className={
              data.length - 1 !== rowKey
                ? "tw-border-b tw-border-blue-gray-50"
                : ""
            }
          >
            {columns.map((col, colKey) =>
              typeof obj[col] === "object" && obj[col]?.img ? (
                <td key={col} className="tw-py-3 tw-px-4">
                  <div className="tw-flex tw-items-center tw-gap-4">
                    <Avatar
                      src={obj[col]["img"]}
                      alt={obj[col]["name"]}
                      size={obj[col]["imgSize"] || "xs"}
                      className="tw-h-auto"
                      variant="square"
                    />
                    <div>
                      <Typography className="tw-min-w-max tw-text-xs !tw-font-medium tw-capitalize !tw-text-blue-gray-500">
                        {col}:
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="!tw-font-normal"
                      >
                        {obj[col]["name"]}
                      </Typography>
                    </div>
                  </div>
                </td>
              ) : (
                <td
                  key={col}
                  className="tw-py-3 tw-px-4 tw-text-center !tw-border-0"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="!tw-font-normal"
                  >
                    {obj[col]}
                  </Typography>
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
