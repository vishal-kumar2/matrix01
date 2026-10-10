import { useState } from 'react';
import apiClient from '../Api/client';

export default function UploadItem() {
  const [formData, setFormData] = useState({
    category: 'MOBILE_PHONE',
    condition: 'WORKING',
    pinCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you'd send an image file. 
      // For now, we send the JSON data matching the Prisma schema.
      const response = await apiClient.post('/pickups/create', {
        userId: "test-user-id", // Hardcoded until you add Auth
        category: formData.category,
        condition: formData.condition,
        pinCode: formData.pinCode
      });
      alert('Item uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Snap & Score E-Waste</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Category Dropdown (Matches Prisma WasteCategory Enum) */}
        <div>
          <label className="block text-sm font-medium mb-1">Item Type</label>
          <select 
            className="w-full border p-2 rounded"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="MOBILE_PHONE">Mobile Phone</option>
            <option value="LAPTOP">Laptop</option>
            <option value="TABLET">Tablet</option>
            <option value="BATTERY">Battery</option>
            <option value="CHARGER_CABLE">Charger / Cable</option>
            <option value="SMALL_APPLIANCE">Small Appliance</option>
          </select>
        </div>

        {/* Condition Dropdown (Matches Prisma ItemCondition Enum) */}
        <div>
          <label className="block text-sm font-medium mb-1">Condition</label>
          <select 
            className="w-full border p-2 rounded"
            value={formData.condition}
            onChange={(e) => setFormData({...formData, condition: e.target.value})}
          >
            <option value="WORKING">Fully Working</option>
            <option value="PARTIALLY_WORKING">Partially Working</option>
            <option value="DEAD">Dead / Won't Turn On</option>
            <option value="PHYSICALLY_DAMAGED">Physically Damaged</option>
          </select>
        </div>

        {/* Pin Code for Clustering */}
        <div>
          <label className="block text-sm font-medium mb-1">Pin Code (For Neighborhood Batching)</label>
          <input 
            type="text" 
            placeholder="e.g. 110001"
            className="w-full border p-2 rounded"
            value={formData.pinCode}
            onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">
          Upload & Get Points
        </button>
      </form>
    </div>
  );
}