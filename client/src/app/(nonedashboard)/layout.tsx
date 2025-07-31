"use client";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (
        (userRole === "manager" && pathname.startsWith("/search")) ||
        (userRole === "manager" && pathname === "/")
      ) {
        router.push("/managers/properties", { scroll: false });
      }
    } else {
      setIsLoading(false);
    }
  }, [authUser, router, pathname]);

  if (authLoading || isLoading) return <Loading />;

  return (
    <div className=" ">
      <Navbar />
      <main
        className=" flex flex-col"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
