"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
const SideNav = () => {
  const pathName = usePathname();
  return (
    <div className="w-40 justify-start">
      <Link href={"/dashboard/files"}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": pathName.includes("/dashboard/files"),
          })}
        >
          <FileIcon /> All Files
        </Button>
      </Link>
      <Link href={"/dashboard/favorites"}>
        <Button
          variant={"link"}
          className={cn("flex gap-2", {
            "text-blue-500": pathName.includes("/dashboard/favorites"),
          })}
        >
          <StarIcon /> Favorites
        </Button>
      </Link>
      <Link href={"/dashboard/trash"}>
        <Button
          variant={"link"}
          className={cn("flex gap-2", {
            "text-blue-500": pathName.includes("/dashboard/trash"),
          })}
        >
          <TrashIcon /> Trash
        </Button>
      </Link>
    </div>
  );
};

export default SideNav;
