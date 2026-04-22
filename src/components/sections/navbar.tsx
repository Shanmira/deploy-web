"use client";
import React from "react";
import Logo from "@/components/logo";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Menu from "@/data/layanan";
import { useSession, signOut } from "next-auth/react";
import { NavbarProfile } from "@/components/profile";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-xs md:text-sm font-medium leading-none">
            {title}
          </div>
          <p className="line-clamp-2 text-xs md:text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="sticky top-0 w-full bg-white flex flex-col space-y-2 md:space-y-0 md:flex-row justify-between py-2 md:py-4 px-4 border border-b-1 bg-white z-10">
      <Logo />
      <ul className="flex space-x-4 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                href="/"
                className="group inline-flex h-9 max-w-[350px] items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 text-xs md:text-sm"
              >
                Beranda
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <span className="text-xs md:text-sm">Layanan</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  <Menu />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              {user ? (
                // <Link href="/dashboard">Dashboard</Link>
                <>
                  <NavigationMenuTrigger>
                    <NavbarProfile user={user} />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid grid-cols-1 max-w-[350px] gap-3 p-4 md:w-[150px] text-xs md:text-sm">
                      <Link
                        className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        href={"/akun"}
                      >
                        Akun
                      </Link>
                      {/* <li className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        Admin
                      </li> */}

                      <li
                        className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => signOut()}
                      >
                        Sign Out
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <div className="group inline-flex w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  <Link href="/auth/login" className="text-xs md:text-sm">
                    Login
                  </Link>
                </div>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </ul>
    </div>
  );
};

export default Navbar;
