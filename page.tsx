"use client";

import axios from 'axios';
import { useEffect, useState } from 'react';
import './AllQuran.css'; // Import your CSS file

const AllQuran = () => {
  const [arabicData, setArabicData] = useState(null);
  const [englishData, setEnglishData] = useState(null);
  const [bengaliData, setBengaliData] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [tafsirText, setTafsirText] = useState('');

  useEffect(() => {
    const fetchQuranData = async () => {
      try {
        const arabicResponse = await axios.get('https://api.alquran.cloud/v1/quran');
        const englishResponse = await axios.get('https://api.alquran.cloud/v1/quran/en.asad');
        const bengaliResponse = await axios.get('https://api.alquran.cloud/v1/quran/bn.bengali');

        setArabicData(arabicResponse.data.data);
        setEnglishData(englishResponse.data.data);
        setBengaliData(bengaliResponse.data.data);
      } catch (error) {
        console.error('Error fetching Quran data:', error);
      }
    };

    fetchQuranData();
  }, []);

  const fetchTafsirData = async (tafseerId, surahNumber, ayahNumber) => {
    try {
      const response = await axios.get(`http://api.quran-tafseer.com/tafseer/${tafseerId}/${surahNumber}/${ayahNumber}`);
      console.log('Tafsir Response:', response.data); // Debugging
      return response.data;
    } catch (error) {
      console.error('Error fetching tafsir data:', error);
      return null;
    }
  };

  const handleAyahClick = async (ayahNumberInSurah, surahNumber) => {
    if (!selectedSurah) return;

    // Find the ayah data based on numberInSurah
    const arabicAyahs = selectedSurah.arabic.ayahs;
    const ayahData = arabicAyahs.find(ayah => ayah.numberInSurah === ayahNumberInSurah);

    console.log('Clicked Ayah Number (in Surah):', ayahNumberInSurah); // Debugging
    console.log('Selected Surah Number:', surahNumber); // Debugging
    console.log('Ayah Data Found:', ayahData); // Debugging

    if (ayahData) {
      const tafseerId = 6; // Update this to your actual tafseer ID

      console.log('Fetching tafsir from URL:', `http://api.quran-tafseer.com/tafseer/${tafseerId}/${surahNumber}/${ayahNumberInSurah}`); // Debugging

      const tafsirResponse = await fetchTafsirData(tafseerId, surahNumber, ayahNumberInSurah);
      if (tafsirResponse) {
        setTafsirText(tafsirResponse.text);
      } else {
        setTafsirText('No tafsir available');
      }

      setSelectedAyah({
        ...ayahData,
        tafsir: tafsirResponse ? tafsirResponse.text : 'No tafsir available'
      });
    } else {
      console.error('Ayah data not found for Ayah Number In Surah:', ayahNumberInSurah);
      setTafsirText('No tafsir available');
    }
  };

  const handleSurahClick = (surahNumber) => {
    if (!arabicData || !englishData || !bengaliData) return;

    const selectedArabicSurah = arabicData.surahs.find(surah => surah.number === surahNumber);
    const selectedEnglishSurah = englishData.surahs.find(surah => surah.number === surahNumber);
    const selectedBengaliSurah = bengaliData.surahs.find(surah => surah.number === surahNumber);

    setSelectedSurah({
      arabic: selectedArabicSurah,
      english: selectedEnglishSurah,
      bengali: selectedBengaliSurah,
    });
    setSelectedAyah(null); // Reset selected ayah
    setTafsirText(''); // Reset tafsir text
  };

  return (
    <div className="container">
      <h2>All Quran Details</h2>
      {arabicData && englishData && bengaliData ? (
        <div>
          {selectedSurah ? (
            <div className="surah-details">
              <h3>
                Surah {selectedSurah.arabic.number}: {selectedSurah.english.englishName} ({selectedSurah.arabic.name})
              </h3>
              <p>{selectedSurah.english.englishNameTranslation}</p>
              <button onClick={() => {
                setSelectedSurah(null); // Reset selected surah
                setSelectedAyah(null); // Reset selected ayah
                setTafsirText(''); // Reset tafsir text
              }}>
                Back to Surah List
              </button>
              <div>
                {selectedSurah.arabic.ayahs.map((ayah) => (
                  <div key={ayah.number} className="ayah-text" onClick={() => handleAyahClick(ayah.numberInSurah, selectedSurah.arabic.number)}>
                    <p><strong>Ayah {ayah.numberInSurah}:</strong></p>
                    <p className="arabic"><strong>Arabic:</strong> {ayah.text}</p>
                    <p className="english"><strong>English:</strong> {selectedSurah.english.ayahs.find(a => a.numberInSurah === ayah.numberInSurah)?.text || 'No translation available'}</p>
                    <p className="bengali"><strong>Bengali:</strong> {selectedSurah.bengali.ayahs.find(a => a.numberInSurah === ayah.numberInSurah)?.text || 'No translation available'}</p>
                    {selectedAyah && selectedAyah.numberInSurah === ayah.numberInSurah && (
                      <div className="ayah-tafsir">
                        <h4>Tafsir:</h4>
                        <p>{tafsirText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="surah-list">
              {arabicData.surahs.map((surah) => (
                <div key={surah.number} className="surah-item">
                  <h3 onClick={() => handleSurahClick(surah.number)}>
                    Surah {surah.number}: {surah.englishName} ({surah.name})
                  </h3>
                  <p>{surah.englishNameTranslation}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default AllQuran;
