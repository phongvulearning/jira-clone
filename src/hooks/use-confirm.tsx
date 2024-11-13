"use client";

import { ResponsiveModal } from "@/app/components/responsive-modal";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "primary"
): [() => JSX.Element, () => Promise<boolean>] => {
  const [promise, setPromise] = useState<{
    resolved: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise<boolean>((resolved) => {
      setPromise({ resolved });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolved(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolved(false);
    handleClose();
  };

  const ConfirmDialog = () => (
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <Card className="size-full border-none shadow-none">
        <CardContent className="pt-8">
          <CardHeader className="p-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button
              variant="outline"
              className="w-full lg:w-auto"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant={variant}
              className="w-full lg:w-auto"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ConfirmDialog, confirm];
};
