import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaForumbee } from 'react-icons/fa';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [showSpecialCharWarning, setShowSpecialCharWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/results', {
          state: {
            query_list: [searchQuery],
            is_initial: true,
            articles: data.articles,
            keywords: data.keywords,
          },
        });
      } else {
        alert('검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7DA21] p-6">
      {/* 상단 아이콘 */}
      <div className="mb-6">
        <FaForumbee className="w-28 h-28 text-[#6F4E37]" />
      </div>

      {/* 타이틀 */}
      <h1 className="text-9xl font-bold mb-8 text-[#5D3A00]">
        News Hive
      </h1>

      {/* 검색 폼 */}
      <form 
        onSubmit={handleSearch} 
        className="flex items-center space-x-4 w-full max-w-2xl"
      >
        <input
          type="text"
          className={`border border-[#121212] p-3 rounded-md w-full text-[#121212] shadow-md placeholder-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212] bg-white transition duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={e => {
            setComposing(false);
            let value = e.currentTarget.value;
            const replaced = value.replace(/[^a-zA-Z0-9가-힣 ]/g, "");
            if (value !== replaced) {
              setShowSpecialCharWarning(true);
              setTimeout(() => setShowSpecialCharWarning(false), 2000);
            }
            setSearchQuery(replaced);
          }}
          onChange={e => {
            if (composing) {
              setSearchQuery(e.target.value);
            } else {
              let value = e.target.value;
              const replaced = value.replace(/[^a-zA-Z0-9가-힣 ]/g, "");
              if (value !== replaced) {
                setShowSpecialCharWarning(true);
                setTimeout(() => setShowSpecialCharWarning(false), 2000);
              }
              setSearchQuery(replaced);
            }
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
          disabled={isLoading}
          style={{ minWidth: 0 }}
        />
        {showSpecialCharWarning && (
          <div className="text-red-500 text-xs mt-1">특수문자는 입력할 수 없습니다.</div>
        )}
        <button 
          type="submit"
          className="bg-[#121212] text-[#F8F8F8] font-semibold p-3 rounded-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 w-14 h-14 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin w-6 h-6 text-[#F8F8F8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"  
              viewBox="0 0 24 24" strokeWidth="1.5" 
              stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default SearchPage;
