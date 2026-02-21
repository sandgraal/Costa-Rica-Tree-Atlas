import Image from "next/image";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

/**
 * QR Code generator using qrserver.com API
 * Simple, no dependencies, works in print
 */
export function QRCodeGenerator({ url, size = 100 }: QRCodeGeneratorProps) {
  // Use a free QR code API service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=5`;

  return (
    <div
      className="bg-white p-2 rounded inline-block"
      style={{ width: size + 16, height: size + 16 }}
    >
      <Image
        src={qrCodeUrl}
        alt={`QR code for ${url}`}
        width={size}
        height={size}
        className="block"
        unoptimized // Don't optimize external API images
      />
    </div>
  );
}
