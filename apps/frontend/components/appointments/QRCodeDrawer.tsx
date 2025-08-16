"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, X } from "lucide-react";

interface QRCodeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingRef: string;
}

// Simple QR code placeholder - in a real app you'd use a proper QR library
function QRCodePlaceholder({ data }: { data: string }) {
  return (
    <div className="w-48 h-48 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-2">⬜</div>
        <div className="text-xs text-primary font-mono break-all px-2">
          QR: {data}
        </div>
      </div>
    </div>
  );
}

export function QRCodeDrawer({
  open,
  onOpenChange,
  bookingRef,
}: QRCodeDrawerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md focus-visible:ring-2 focus-visible:ring-primary">
        <DialogHeader>
          <DialogTitle className="text-center">
            QR Code - {bookingRef}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <QRCodePlaceholder data={bookingRef} />
          </div>

          <div className="text-center space-y-2">
            <p className="font-medium text-lg">{bookingRef}</p>
            <p className="text-sm text-muted-foreground">
              Show this QR code at your appointment
            </p>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-center w-full">
            <Button
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              Print / Save
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
