/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { useState, useEffect } from 'react';

interface Qualification {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  level: string;
  type: string;
  country?: string;
  issuingBody: string;
  description: string;
  duration?: string;
  prerequisites?: string[];
  recognizedIn?: string[];
  azrReward?: number;
  verifiable: boolean;
  tags: string[];
}

interface GlobalQualificationsProps {
  apiUrl?: string;
}

export const GlobalQualifications = ({ 
  apiUrl = 'http://localhost:3001' 
}: GlobalQualificationsProps) => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedQual, setSelectedQual] = useState<Qualification | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchStats();
    fetchQualifications();
  }, []);

  useEffect(() => {
    fetchQualifications();
  }, [selectedCategory, selectedLevel, selectedCountry]);

  const fetchQualifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedCountry) params.append('country', selectedCountry);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${apiUrl}/api/qualifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQualifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/qualifications/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/qualifications/stats/summary`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    fetchQualifications();
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Primary Education': '📚',
      'Secondary Education': '🎓',
      'Undergraduate': '🎓',
      'Postgraduate': '🎓',
      'Doctoral': '👨‍🎓',
      'IT Certification': '💻',
      'Software Development': '👨‍💻',
      'Cloud Computing': '☁️',
      'Cybersecurity': '🔒',
      'Business Management': '💼',
      'Accounting & Finance': '💰',
      'Medical Certification': '⚕️',
      'Nursing': '👨‍⚕️',
      'Law Certification': '⚖️',
      'Engineering': '⚙️',
      'Language Proficiency': '🌍',
      'Trade Certification': '🔧',
      'Vocational Training': '🛠️',
    };
    return icons[category] || '📜';
  };

  const getLevelColor = (level: string): string => {
    if (level.includes('Entry') || level.includes('Foundation')) return 'bg-green-100 text-green-800';
    if (level.includes('Intermediate')) return 'bg-blue-100 text-blue-800';
    if (level.includes('Advanced')) return 'bg-purple-100 text-purple-800';
    if (level.includes('Professional') || level.includes('Expert')) return 'bg-orange-100 text-orange-800';
    if (level.includes('Master') || level.includes('Doctoral')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Global Qualifications Database
          </h1>
          <p className="text-xl md:text-2xl mb-2">
            Every qualification on Earth - Searchable, Verifiable, Rewarded
          </p>
          <p className="text-lg opacity-90">
            From primary education to doctoral degrees, professional certifications to trade licenses
          </p>
        </div>
      </div>

      {/* Statistics Bar */}
      {stats && (
        <div className="bg-white shadow-md py-6 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalQualifications}</div>
              <div className="text-sm text-gray-600">Total Qualifications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{Object.keys(stats.byCategory).length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{Object.keys(stats.byCountry).length}</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.totalAzrRewards.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total AZR Rewards</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search qualifications..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Countries</option>
              <option value="International">International</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="ZA">South Africa</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="IN">India</option>
              <option value="CN">China</option>
              <option value="JP">Japan</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Search
            </button>
          </div>

          {(selectedCategory || selectedCountry || searchQuery) && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCountry('');
                  setSearchQuery('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Qualifications Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : qualifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No qualifications found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualifications.map((qual) => (
              <div
                key={qual.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => setSelectedQual(qual)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{getCategoryIcon(qual.category)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(qual.level)}`}>
                    {qual.level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {qual.shortName || qual.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {qual.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">Type:</span>
                    <span>{qual.type}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">Issuer:</span>
                    <span className="line-clamp-1">{qual.issuingBody}</span>
                  </div>
                  {qual.duration && (
                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">Duration:</span>
                      <span>{qual.duration}</span>
                    </div>
                  )}
                  {qual.azrReward && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <span className="mr-2">💰</span>
                      <span>{qual.azrReward} AZR Reward</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {qual.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for qualification details */}
      {selectedQual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedQual.name}</h2>
              <button
                onClick={() => setSelectedQual(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{selectedQual.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
                  <p className="text-gray-600">{selectedQual.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Level</h3>
                  <p className="text-gray-600">{selectedQual.level}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Type</h3>
                  <p className="text-gray-600">{selectedQual.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Country</h3>
                  <p className="text-gray-600">{selectedQual.country || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Issuing Body</h3>
                <p className="text-gray-600">{selectedQual.issuingBody}</p>
              </div>

              {selectedQual.duration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Duration</h3>
                  <p className="text-gray-600">{selectedQual.duration}</p>
                </div>
              )}

              {selectedQual.prerequisites && selectedQual.prerequisites.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedQual.prerequisites.map((prereq, idx) => (
                      <li key={idx}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedQual.recognizedIn && selectedQual.recognizedIn.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Recognized In</h3>
                  <p className="text-gray-600">{selectedQual.recognizedIn.join(', ')}</p>
                </div>
              )}

              {selectedQual.azrReward && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">AZR Reward</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedQual.azrReward} AZR</p>
                  <p className="text-sm text-green-700">Earned upon verification of this qualification</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQual.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                  Start Learning Path
                </button>
                <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Verify My Credential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalQualifications;
