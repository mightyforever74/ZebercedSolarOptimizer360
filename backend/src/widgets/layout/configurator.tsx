import React from "react";

// @material-tailwind/react
import {

  IconButton,
  Switch,
  Typography,
 
} from "@material-tailwind/react";

// @context
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setFixedNavbar,
} from "@/context";

// @heroicons/react
import { XMarkIcon } from "@heroicons/react/24/outline";

function formatNumber(number: any, decPlaces: number) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];

      break;
    }
  }

  return number;
}


export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, fixedNavbar } = controller;

  return (
    <aside
      className={`tw-fixed tw-top-0 tw-right-0 tw-z-50 tw-h-screen tw-w-96 tw-bg-white tw-px-2.5 tw-shadow-lg tw-transition-transform tw-duration-300 ${
        openConfigurator ? "tw-translate-x-0" : "tw-translate-x-96"
      }`}
    >
      <div className="tw-flex tw-items-start tw-justify-between tw-px-6 tw-pt-8 tw-pb-6">
        <div>
          <Typography variant="h5" color="blue-gray">
            Dashboard Configurator
          </Typography>
          
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => setOpenConfigurator(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="tw-h-5 tw-w-5" />
        </IconButton>
      </div>
      <hr className="tw-w-[318px] tw-mx-auto" />
      <div className="tw-py-4 tw-px-6">   
     
        <div className="tw-mb-12">
          <div className="tw-flex tw-items-center tw-justify-between tw-py-5">
            <Typography variant="h6" color="blue-gray">
              Navbar Fixed
            </Typography>
            <Switch
              id="navbar-fixed"
              value={String(fixedNavbar)}
              onChange={() => setFixedNavbar(dispatch, !fixedNavbar)}
              crossOrigin={undefined}
            />
          </div>
          <hr />
          
        </div>
        
      </div>
    </aside>
  );
}

export default Configurator;
