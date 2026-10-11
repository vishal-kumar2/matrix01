// src/pages/NewRequest.jsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import CategoryPicker from '../components/CategoryPicker';
import ConditionForm from '../components/ConditionForm';
import PhotoCapture from '../components/PhotoCapture';
import { API_BASE, toBackendCategory, toBackendCondition, errorMessage } from '../lib/api';

export default function NewRequest() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('MOBILE_PHONE');
  const [condition, setCondition] = useState('WORKING');
  const [conditionForm, setConditionForm] = useState({ hasCharger: false, hasDents: false });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async () => {
    if (!photo) return alert('Please capture a photo of the item first.');

    try {
      setUploading(true);

      // 1. Request presigned URL from backend[cite: 2]
      // Photo is always converted to JPEG in PhotoCapture, so the type is fixed.
      const contentType = 'image/jpeg';
      const postResponse = await axios.post(`${API_BASE}/pickups`, {
        userId: user.id,
        category: toBackendCategory(category),
        condition: toBackendCondition(condition),
        conditionForm,
        contentType,
      });

      const { pickupId, uploadUrl } = postResponse.data;

      // 2. Direct PUT to S3 bucket[cite: 2]
      await axios.put(uploadUrl, photo, {
        headers: { 'Content-Type': contentType }, // must match what the URL was signed with
      });

      // 3. Navigate to Status page with real-time polling[cite: 2]
      navigate(`/pickups/${pickupId}`);
    } catch (err) {
      console.error('Submission failed', err);
      alert(`Upload failed: ${errorMessage(err)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col justify-between min-h-full">
      <div>
        {/* Header & Step Tracker */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <button onClick={() => navigate('/')} className="text-sm font-semibold text-gray-500">
            ← Cancel
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-green-700">
            Step {step} of 3
          </span>
        </div>

        {/* Step Views */}
        {step === 1 && (
          <CategoryPicker selected={category} onSelect={(cat) => { setCategory(cat); setStep(2); }} />
        )}

        {step === 2 && (
          <ConditionForm
            value={condition}
            onChange={setCondition}
            formAnswers={conditionForm}
            setFormAnswers={setConditionForm}
          />
        )}

        {step === 3 && (
          <PhotoCapture onPhotoSelect={setPhoto} preview={photoPreview} setPreview={setPhotoPreview} />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 pt-4 border-t flex justify-between space-x-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="w-1/2 py-3 border border-gray-300 rounded-xl font-bold text-gray-700"
            disabled={uploading}
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || !photo}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading to S3...' : 'Submit Pickup Request'}
          </button>
        )}
      </div>
    </div>
  );
}