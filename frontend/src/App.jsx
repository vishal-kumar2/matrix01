import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import UploadItem from './pages/UploadItem';

// Dummy components for now to test navigation
const Home = () => (
  <div className="text-center py-10">
    <h2 className="text-2xl font-bold">Welcome to E-Scrap Connect ⚡</h2>
    <p className="mt-2 text-gray-600">Turn your household e-waste into rewards & clean water.</p>
    <Link to="/upload" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
      Upload Waste Now
    </Link>
  </div>
);

const ScrapperDashboard = () => (
  <div className="p-6 max-w-xl mx-auto">
    <h2 className="text-2xl font-bold mb-4">Scrapper / Collector Portal 🚚</h2>
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="font-semibold text-yellow-800">Pin Code 110001 (Sector 4)</p>
      <p className="text-sm text-yellow-700">Accumulated: 18.5 kg / 20 kg (Threshold 92% reached)</p>
      <button className="mt-3 bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-bold">
        Lock Batch & Schedule Pickup
      </button>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Simple Navbar */}
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <Link to="/" className="text-xl font-extrabold text-green-700">E-Scrap Connect</Link>
          <div className="space-x-4 text-sm font-semibold">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <Link to="/upload" className="hover:text-green-600">Upload Item</Link>
            <Link to="/agent" className="hover:text-green-600 text-purple-600">Agent View</Link>
          </div>
        </nav>

        {/* Dynamic Pages */}
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadItem />} />
            <Route path="/agent" element={<ScrapperDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}