// Camera QR scanner. Stops after the first successful read so /collect is called once.
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const handledRef = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    let started = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => {
          if (handledRef.current) return;
          handledRef.current = true;
          scanner.stop().catch(() => {}).finally(() => onScan(text.trim()));
        },
        () => {} // ignore per-frame "no QR found" messages
      )
      .then(() => { started = true; })
      .catch((err) => setError(String(err?.message || err)));

    return () => {
      if (started && scanner.isScanning) scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="space-y-3">
      <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-black/80 min-h-[240px]" />
      {error && (
        <p className="text-xs text-red-600">
          Camera unavailable ({error}). Camera access needs HTTPS on phones; use the token box below instead.
        </p>
      )}
      <button type="button" onClick={onClose} className="w-full py-2 text-sm font-bold text-gray-600 border rounded-xl">
        Close scanner
      </button>
    </div>
  );
}
