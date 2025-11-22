import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Share } from "lucide-react";

const downloadQRCode = () => {
  const svg = document.getElementById("qrCodeSVG");
  if (!svg) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "qr-code.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const QRPage = () => {
  const { shortCode } = useParams();
  const [shortUrl, setShortUrl] = useState("");

  useEffect(() => {
    if (shortCode) {
      setShortUrl(`${window.location.origin}/${shortCode}`);
    }
  }, [shortCode]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code",
          text: `Scan this QR code to visit ${shortUrl}`,
          url: shortUrl,
        });
      } catch (error) {
        toast.error("Sharing failed");
      }
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  if (!shortCode) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl font-bold">QR Code for {shortCode}</h1>
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6">
            <QRCode id="qrCodeSVG" size={256} value={shortUrl} />
            <p className="break-all text-blue-600">{shortUrl}</p>
            <div className="flex gap-4">
              <Button onClick={downloadQRCode} leftIcon={<Download />}>
                Download QR
              </Button>
              <Button onClick={handleShare} leftIcon={<Share />}>
                Share QR
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRPage;
