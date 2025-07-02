"use client";

import StoreProvider from "@/state/redux";
import { PropsWithChildren } from "react";

const Providers = ({ children }: PropsWithChildren) => {
  return <StoreProvider>{children}</StoreProvider>;
};

export default Providers;
