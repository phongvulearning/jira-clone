import { useMedia } from "react-use";
import { PropsWithChildren } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

export const ResponsiveModal = ({
  children,
  ...props
}: PropsWithChildren<
  React.ComponentProps<typeof Dialog> | React.ComponentProps<typeof Drawer>
>) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog {...props}>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
};
