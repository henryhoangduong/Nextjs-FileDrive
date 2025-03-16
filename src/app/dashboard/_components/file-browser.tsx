"use client";
import { useQuery } from "convex/react";
import UploadButton from "../_components/upload-button";
import { api } from "../../../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import FileCard from "../_components/file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import SearchBar from "../_components/search-bar";
import { useState } from "react";

const PlaceHolder = () => {
  return (
    <div className="flex flex-col gap-4 w-full mt-12 items-center">
      <Image src={"empty.svg"} height={200} width={200} alt="" />
      <div className="text-2xl">
        You have no file, go ahead and upload one now
      </div>
      <UploadButton />
    </div>
  );
};

export default function FileBrowser({
  title,
  favorites,
}: {
  title: string;
  favorites?: boolean;
}) {
  const organization = useOrganization();
  let orgId: undefined | string = undefined;
  const [query, setQuery] = useState("");
  const user = useUser();
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites } : "skip",
  );
  const isLoading = files === undefined;
  return (
    <div>
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-24">
          <Loader2 className="animate-spin h-4 w-4" />
          <div className="text-2xl">Loading</div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{title} </h1>
            <SearchBar query="" setQuery={setQuery} />
            <UploadButton />
          </div>
          {files?.length === 0 && <PlaceHolder />}

          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
