"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const [isFileDialOpen, setIsFileDialOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });
  const fileRef = form.register("file");
  let orgId = null;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const createFile = useMutation(api.files.createFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    console.log(values.file);
    if (!orgId) return;
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });
    const { storageId } = await result.json();
    await createFile({
      name: values.title,
      fileId:storageId,
      orgId,
    })
    form.reset()
    setIsFileDialOpen(false)
    toast.success("File has been uploaded.")
  }
  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your files</h1>
        <Dialog open={isFileDialOpen} onOpenChange={setIsFileDialOpen}>
          <DialogTrigger>
            <Button
            >
              Upload a file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload your file here</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="gap-3 flex flex-col"
              >
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="file"
                  control={form.control}
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          {...fileRef}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={}>Submit</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
