// src/components/PickupQR.jsx
import { QRCodeSVG } from 'qrcode.react';

export default function PickupQR({ token }) {
  if (!token) return null;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
      <h4 className="font-bold text-gray-800 text-sm mb-2">Doorstep Handover QR Code</h4>
      <div className="flex justify-center my-3">
        <QRCodeSVG value={token} size={160} />
      </div>
      <p className="text-xs text-gray-500">Show this QR to the agent when they arrive to claim your reward.</p>
    </div>
  );
}