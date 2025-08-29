import React, { createContext, useContext, useReducer } from "react";

const MaterialTailwindContext = createContext<any>(null);

export function useMaterialTailwindController() {
  return useContext(MaterialTailwindContext);
}

export function setOpenSidenav(dispatch: any, value: boolean) {
  dispatch({ type: "OPEN_SIDENAV", value });
}

export function MaterialTailwindProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case "OPEN_SIDENAV":
        return { ...state, openSidenav: action.value };
      default:
        return state;
    }
  }, { openSidenav: true, sidenavType: "dark", sidenavColor: "blue" });

  return (
    <MaterialTailwindContext.Provider value={[state, dispatch]}>
      {children}
    </MaterialTailwindContext.Provider>
  );
}