import Navbar from "@/components/Navbar";
import React, { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <Navbar />
      <main className="h-full w-full flex flex-col pt-[52px">{children}</main>
    </div>
  );
};

export default Layout;
