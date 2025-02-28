"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function Home() {
  const getQueries = useQuery(api.files.getFiles);
  const creaetFile = useMutation(api.files.createFile)
  return (
    <div className="flex min-h-screen flex-col items-center justify-between  p-24">
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <Button onClick={() => {
        creaetFile({name:"hello world"})
      }}>
        Click me
      </Button>
    </div>
  );
}
