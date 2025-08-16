"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, X, Info } from "lucide-react";
import { Appointment } from "@/lib/api";
import Image from "next/image";

interface QRCodeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
}

// QR Code display component with decoding info
function QRCodeDisplay({
  qrCodeData,
  bookingRef,
}: {
  qrCodeData?: string;
  bookingRef: string;
}) {
  const [showDecoded, setShowDecoded] = useState(false);

  if (qrCodeData) {
    // Try to decode the QR code data if it's a base64 image
    const isBase64Image = qrCodeData.startsWith("data:image");

    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Image
            src={qrCodeData}
            alt={`QR Code for ${bookingRef}`}
            width={192}
            height={192}
            className="border-2 border-primary rounded-lg"
          />
        </div>

        {isBase64Image && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDecoded(!showDecoded)}
              className="text-xs"
            >
              <Info className="mr-1 h-3 w-3" />
              {showDecoded ? "Hide" : "Show"} QR Info
            </Button>

            {showDecoded && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-xs text-gray-600 mb-2">QR Code contains:</p>
                <div className="text-xs font-mono bg-white p-2 rounded border">
                  <p>
                    <strong>Booking Reference:</strong> {bookingRef}
                  </p>
                  <p>
                    <strong>Format:</strong> Base64 PNG Image
                  </p>
                  <p>
                    <strong>Size:</strong>{" "}
                    {Math.round(qrCodeData.length / 1024)}KB
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This QR code likely contains the booking reference and
                  appointment details for verification at your appointment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback placeholder if no QR code data
  return (
    <div className="flex justify-center">
      <div className="w-48 h-48 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">⬜</div>
          <div className="text-xs text-primary font-mono break-all px-2">
            QR: {bookingRef}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            QR code not available
          </div>
        </div>
      </div>
    </div>
  );
}

export function QRCodeDrawer({
  open,
  onOpenChange,
  appointment,
}: QRCodeDrawerProps) {
  const handleDownload = () => {
    if (appointment.qr_code) {
      // Create a download link for the QR code
      const link = document.createElement("a");
      link.href = appointment.qr_code;
      link.download = `qr-code-${appointment.booking_reference}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: open print dialog
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md focus-visible:ring-2 focus-visible:ring-primary">
        <DialogHeader>
          <DialogTitle className="text-center">
            QR Code - {appointment.booking_reference}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <QRCodeDisplay
            qrCodeData={appointment.qr_code}
            bookingRef={appointment.booking_reference}
          />

          <div className="text-center space-y-2">
            <p className="font-medium text-lg">
              {appointment.booking_reference}
            </p>
            <p className="text-sm text-muted-foreground">
              Show this QR code at your appointment
            </p>
            {appointment.service && (
              <p className="text-sm text-muted-foreground">
                Service: {appointment.service.name}
              </p>
            )}
            {appointment.timeslot && (
              <p className="text-sm text-muted-foreground">
                Date:{" "}
                {new Date(appointment.timeslot.slot_date).toLocaleDateString()}{" "}
                at {appointment.timeslot.start_time}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-center w-full">
            <Button
              onClick={handleDownload}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              {appointment.qr_code ? "Download QR Code" : "Print"}
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
