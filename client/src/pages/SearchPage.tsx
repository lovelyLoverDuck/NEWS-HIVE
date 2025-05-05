import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6E3] p-6">
      {/* 상단 아이콘 (Cube Transparent로 변경) */}
      <div className="mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="#6F4E37" 
          className="w-16 h-16"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 16.5V7.5m0 9a2.25 2.25 0 01-1.125 1.946l-7.5 4.33a2.25 2.25 0 01-2.25 0l-7.5-4.33A2.25 2.25 0 013 16.5m18 0v-9m0 0a2.25 2.25 0 00-1.125-1.946l-7.5-4.33a2.25 2.25 0 00-2.25 0l-7.5 4.33A2.25 2.25 0 003 7.5m18 0L12 13.5m0 0L3 7.5m9 6l0 9"
          />
        </svg>
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold mb-8 text-[#1C1C1C]">
        News Hive
      </h1>

      {/* 검색 폼 */}
      <form 
        onSubmit={handleSearch} 
        className="flex items-center space-x-4 w-full max-w-md"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="border border-[#6F4E37] p-3 rounded-md w-full text-[#1C1C1C] shadow-md placeholder-[#6F4E37] focus:outline-none focus:ring-2 focus:ring-[#FFB300] bg-white disabled:bg-[#FDF6E3]"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className="bg-[#FFB300] text-[#1C1C1C] font-semibold p-3 rounded-md hover:bg-[#FFD54F] transition-all transform active:scale-95 disabled:bg-[#FFD54F] w-14 h-14 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            // 로딩 스피너
            <svg className="animate-spin w-6 h-6 text-[#1C1C1C]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : (
            // 검색 아이콘
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
