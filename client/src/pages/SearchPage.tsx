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
      // 검색 결과 없음 또는 서버에서 알림 메시지(alert) 전달 시 팝업 표시
      if (data.alert) {
        alert(`${data.alert}\n추천 키워드: ${data.recommend_keywords ? data.recommend_keywords.join(', ') : ''}`);
        return; // 경고가 있으면 ResultPage로 이동하지 않음
      }
      if (response.ok) {
        navigate('/results', {
          state: {
            query_list: data.query_list || [searchQuery],
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9D6] px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col items-center p-10">
        <h1 className="text-5xl font-extrabold text-center mb-3 text-[#222] tracking-tight">뉴스 하이브</h1>
        <p className="text-center text-lg text-[#888] mb-8">키워드를 따라가는 뉴스 탐색 여정</p>
        <form onSubmit={handleSearch} className="flex items-center w-full bg-[#f8f8f8] rounded-xl px-4 py-3 gap-2 shadow-sm">
          <input
            type="text"
            className="flex-1 border-0 outline-none bg-transparent text-lg py-2 px-2 placeholder-[#bbb]"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={e => {
              setComposing(false);
              let value = e.currentTarget.value;
              const replaced = value.replace(/[^a-zA-Z0-9\uac00-\ud7a3 ]/g, "");
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
                const replaced = value.replace(/[^a-zA-Z0-9\uac00-\ud7a3 ]/g, "");
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
          <button
            type="submit"
            className="bg-[#222] text-white rounded-xl p-3 flex items-center justify-center hover:bg-[#444] transition shadow"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" /></svg>
            )}
          </button>
        </form>
        {showSpecialCharWarning && (
          <div className="text-red-500 text-xs mt-2 text-center">특수문자는 입력할 수 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
