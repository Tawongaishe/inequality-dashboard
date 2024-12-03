'use client';

import { useState, useEffect } from 'react';

interface RegionData {
  EMEA: number;
  NAM: number;
  APAC: number;
  LATAM: number;
}

interface IncomeResult {
  income: number;
  medianDifference: number;
  currency: string;
}

({
  baseData: [],
  ageData: [],
  genderData: [],
  educationData: []
});

const IncomeDashboard = () => {
  const [data, setData] = useState({
    baseData: [] as string[][],
    ageData: [] as string[][],
    genderData: [] as string[][],
    educationData: [] as string[][]
  });
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<IncomeResult | null>(null);

  useEffect(() => {
    const fetchBaseData = async () => {
      const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS--8l2r0QU3Z8zzI_Sw8q1RlrV5O7hBKMAaL274VELNktab96XSkxZ2iEkCSttpSnX9cG1msGMO7m-';
      const url = `${baseUrl}/pub?output=csv&gid=0`;
      const response = await fetch(url);
      const text = await response.text();
      return text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));
    };

    const hardcodedData = {
      gender: {
        'Male': { EMEA: 1, NAM: 1, APAC: 1, LATAM: 1 },
        'Female': { EMEA: 0.85, NAM: 0.92, APAC: 0.75, LATAM: 0.8 },
        'Other': { EMEA: 0.85, NAM: 0.92, APAC: 0.75, LATAM: 0.8 }
      },
      age: {
        '18-24': { EMEA: 0.7, NAM: 0.8, APAC: 0.6, LATAM: 0.65 },
        '25-34': { EMEA: 1, NAM: 1, APAC: 1, LATAM: 1 },
        '35-44': { EMEA: 1.2, NAM: 1.3, APAC: 1.1, LATAM: 1.2 },
        '45-54': { EMEA: 1.3, NAM: 1.4, APAC: 1.2, LATAM: 1.3 },
        '55+': { EMEA: 1.25, NAM: 1.3, APAC: 1.15, LATAM: 1.25 }
      },
      education: {
        'HighSchool': { EMEA: 1, NAM: 1, APAC: 1, LATAM: 1 },
        'Bachelor': { EMEA: 1.3, NAM: 1.4, APAC: 1.2, LATAM: 1.25 },
        'Master': { EMEA: 1.5, NAM: 1.6, APAC: 1.4, LATAM: 1.45 },
        'PhD': { EMEA: 1.8, NAM: 1.9, APAC: 1.6, LATAM: 1.65 }
      }
    };

    
    const loadData = async () => {
      try {
        const fetchedBaseData = await fetchBaseData();
        setData({
          baseData: fetchedBaseData,
          ageData: Object.entries(hardcodedData.age).map(([age, values]) => 
            [age, String(values.EMEA), String(values.NAM), String(values.APAC), String(values.LATAM)]),
          genderData: Object.entries(hardcodedData.gender).map(([gender, values]) => 
            [gender, String(values.EMEA), String(values.NAM), String(values.APAC), String(values.LATAM)]),
          educationData: Object.entries(hardcodedData.education).map(([edu, values]) => 
            [edu, String(values.EMEA), String(values.NAM), String(values.APAC), String(values.LATAM)])
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateIncome = () => {
    if (!selectedCountry || !selectedAge || !selectedGender || !selectedEducation) return;

    const countryRow = data.baseData.find(row => row[0] === selectedCountry);
    if (!countryRow) return;

    const region = countryRow[1];
    const baseIncome = parseFloat(countryRow[2]);
    const currency = countryRow[3];

    const ageMultiplier = parseFloat(data.ageData.find(row => row[0] === selectedAge)?.[
      ['EMEA', 'NAM', 'APAC', 'LATAM'].indexOf(region) + 1
    ] || '1');
    const genderMultiplier = parseFloat(data.genderData.find(row => row[0] === selectedGender)?.[
      ['EMEA', 'NAM', 'APAC', 'LATAM'].indexOf(region) + 1
    ] || '1');
    const educationMultiplier = parseFloat(data.educationData.find(row => row[0] === selectedEducation)?.[
      ['EMEA', 'NAM', 'APAC', 'LATAM'].indexOf(region) + 1
    ] || '1');

    const calculatedIncome = baseIncome * ageMultiplier * genderMultiplier * educationMultiplier;
    const percentDiff = ((calculatedIncome - baseIncome) / baseIncome) * 100;

    setResult({
      income: calculatedIncome,
      medianDifference: percentDiff,
      currency
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="space-y-4 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full"/>
          <div className="text-white text-xl font-bold animate-pulse">Loading Data</div>
        </div>
      </div>
    );
  }

  const countries = data.baseData.slice(1).map(row => row[0]);
  const ages = data.ageData.map(row => row[0]);
  const genders = data.genderData.map(row => row[0]);
  const educationLevels = data.educationData.map(row => row[0]);

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-8">
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Global Income Explorer
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select 
              className="w-full p-2 border rounded bg-white/50 backdrop-blur text-gray-800"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Age Range</label>
            <select 
              className="w-full p-2 border rounded bg-white/50 backdrop-blur text-gray-800"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
            >
              <option value="">Select age range</option>
              {ages.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select 
              className="w-full p-2 border rounded bg-white/50 backdrop-blur text-gray-800"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="">Select gender</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Education Level</label>
            <select 
              className="w-full p-2 border rounded bg-white/50 backdrop-blur text-gray-800"
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
            >
              <option value="">Select education</option>
              {educationLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={calculateIncome}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            disabled={!selectedCountry || !selectedAge || !selectedGender || !selectedEducation}
          >
            Calculate Income
          </button>

          {result && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-inner">
              <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Your Results</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Estimated Annual Income</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(result.income).toLocaleString()} {result.currency}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Comparison to Median</p>
                  <p className={`text-xl font-semibold ${result.medianDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.medianDifference > 0 ? '↑' : '↓'} {Math.abs(result.medianDifference).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default IncomeDashboard;