// src/components/PhotoCapture.jsx
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function PhotoCapture({ onPhotoSelect, preview, setPreview }) {
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setCompressing(true);

      // Compress photo under 1MB to keep demo fast
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);

      setPreview(URL.createObjectURL(compressedFile));
      onPhotoSelect(compressedFile);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-3">Take Item Photo</h3>
      {preview ? (
        <div className="space-y-3 text-center">
          <img src={preview} alt="Item Preview" className="w-full h-48 object-cover rounded-xl border" />
          <button
            type="button"
            onClick={() => { setPreview(null); onPhotoSelect(null); }}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Retake Photo
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 bg-gray-50 transition-colors">
          <span className="text-3xl mb-2">📸</span>
          <span className="text-sm font-semibold text-gray-700">
            {compressing ? 'Compressing Photo...' : 'Tap to snap photo'}
          </span>
          <span className="text-xs text-gray-400 mt-1">Accepts JPG, PNG</span>
          {/* capture="environment" targets rear camera on mobile */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={compressing}
          />
        </label>
      )}
    </div>
  );
}