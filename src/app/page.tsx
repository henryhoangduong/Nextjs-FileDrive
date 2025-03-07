"use client";
import { useQuery } from "convex/react";
import UploadButton from "./upload-button";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import FileCard from "./file-card";
import Image from "next/image";

export default function Home() {
  const organization = useOrganization();
  let orgId: undefined | string = undefined;
  const user = useUser();
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  return (
    <main className="container mx-auto pt-12 ">
      {files && files?.length === 0 && (
        <div className="flex flex-col gap-4 w-full mt-12 items-center">
          <Image src={"empty.svg"} height={200} width={200} alt="" />
          <div className="text-2xl">
            You have no file, go ahead and upload one now
          </div>
                      <UploadButton />

        </div>
      )}
      {files && files.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your files</h1>
            <UploadButton />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </>
      )}
    </main>
  );
}
