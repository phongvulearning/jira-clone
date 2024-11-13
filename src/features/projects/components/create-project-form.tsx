"use client";
import { useRef } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCreateProject } from "../api/use-create-project";
import { CreateProjectSchema } from "../schema";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface CreateProjectFormProps {
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
  const router = useRouter();

  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateProject();
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      image: "",
      workspaceId,
    },
  });

  const onSubmit = (values: CreateProjectSchema) => {
    const finalValues = {
      ...values,
      workspaceId,
      image: values.image instanceof File ? values.image : undefined,
    };

    mutate(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          onCancel && onCancel();
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  return (
    <Card className="size-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Create new project</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter project name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="size-[72px] relative rounded-md overflow-hidden">
                          <Image
                            src={
                              field.value instanceof Blob
                                ? URL.createObjectURL(
                                    new File([field.value], "", {
                                      type: field.value.type,
                                    })
                                  )
                                : field.value
                            }
                            alt="logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm">Project Icon</p>
                        <p className="text-sm text-muted-foreground">
                          JPEG, PNG, SVG, or JPEG, max 1 mb
                        </p>
                        <input
                          hidden
                          type="file"
                          ref={inputRef}
                          disabled={isPending}
                          onChange={handleImageChange}
                          accept=".jpg, .jpeg, .png, .svg"
                        />
                        {field.value ? (
                          <Button
                            size="xs"
                            type="button"
                            variant="destructive"
                            className="w-fit mt-2"
                            disabled={isPending}
                            onClick={() => {
                              field.onChange(null);
                              if (inputRef.current) inputRef.current.value = "";
                            }}
                          >
                            Remove Icon
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            type="button"
                            variant="teritary"
                            className="w-fit mt-2"
                            disabled={isPending}
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload Icon
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit" size="lg">
                Create project
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
