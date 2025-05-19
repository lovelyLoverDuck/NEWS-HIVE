import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import HexKeywordGrid from './HexKeywordGrid';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<string>('');
  const [summaryHistory, setSummaryHistory] = useState<{ keywords: string[], summary: string }[]>([]);
  const { query_list = [], is_initial = true, articles = [], keywords = [] } = location.state || {};

  const primaryQuery = query_list[0] || '';
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeKeywords = Array.isArray(keywords) ? keywords : ['예시1', '예시2', '예시3'];
  const reorderedKeywords = [primaryQuery, ...safeKeywords.filter(k => k !== primaryQuery)];

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [resultArticles, setResultArticles] = useState<any[]>(safeArticles);
  const [resultKeywords, setResultKeywords] = useState<string[]>(reorderedKeywords);
  const [loading, setLoading] = useState(false);
  const [inputKeyword, setInputKeyword] = useState<string>("");

  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const handleAddKeyword = () => {
    const trimmed = inputKeyword.trim();
    if (trimmed && !resultKeywords.includes(trimmed)) {
      setResultKeywords(prev => [trimmed, ...prev]);
      setInputKeyword("");
    }
  };

  const handleToggle = (kw: string) => {
    setSelectedKeywords(prev => {
      let next;
      if (prev.includes(kw)) next = prev.filter(k => k !== kw);
      else if (prev.length < 3) next = [...prev, kw];
      else next = prev;
      reSearch(next);
      return next;
    });
  };

  const reSearch = async (keywordsToSearch?: string[]) => {
    const searchKeywords = keywordsToSearch ?? selectedKeywords;
    if (searchKeywords.length === 0) {
      setResultArticles(safeArticles);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5001/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_list: searchKeywords, is_initial: false })
      });
      const data = await resp.json();
      setResultArticles(data.articles || []);
    } catch (e) {
      alert('뉴스 검색 실패');
    }
    setLoading(false);
  };

  const handleConfirmKeywords = async () => {
    if (selectedKeywords.length === 0) return;
    setLoading(true);
    try {
      const [keywordsResp, summaryResp] = await Promise.all([
        fetch('http://localhost:5001/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: resultArticles })
        }),
        fetch('http://localhost:5001/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: resultArticles })
        })
      ]);

      const keywordsData = await keywordsResp.json();
      const summaryData = await summaryResp.json();

      if (keywordsData.keywords) {
        const newKeywords = (keywordsData.keywords || []).slice(0, 3);
        setResultKeywords(prev => Array.from(new Set([...(prev || []), ...newKeywords])));
      }

      if (summaryData.summary) {
        setSummary(summaryData.summary);
        setSummaryHistory(prev => [...prev, { keywords: [...selectedKeywords], summary: summaryData.summary }]);
      }

    } catch (e: any) {
      alert('키워드 또는 요약 처리 실패');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF', color: '#121212', fontFamily: "var(--font-family-main)" }}>
      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 키워드 영역 */}
        <div className="w-2/3 p-4 border-r overflow-auto" style={{ borderColor: '#E7E7E7' }}>
          <div className="flex flex-col gap-4 h-full">
            {/* 상단: 키워드 입력 & 홈버튼 영역 */}
            <div className="flex items-center justify-between bg-[#f8f8f8] p-3 rounded shadow-sm mb-2">
              <Link to="/" className="bg-[#121212] text-white p-2 rounded hover:opacity-80" title="처음으로">
                <FaHome size={20} />
              </Link>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputKeyword}
                  onChange={e => setInputKeyword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword(); }}
                  placeholder="새로운 키워드 입력"
                  className="border px-2 py-1 rounded w-40 focus:outline-none"
                  style={{ borderColor: '#E7E7E7', backgroundColor: '#FFF', color: '#121212', fontSize: '13px' }}
                  autoFocus
                  disabled={loading}
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={!inputKeyword.trim() || resultKeywords.includes(inputKeyword.trim()) || loading}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    !inputKeyword.trim() || resultKeywords.includes(inputKeyword.trim()) || loading
                      ? 'bg-[#E7E7E7] text-[#AAAAAA] cursor-not-allowed'
                      : 'bg-[#121212] text-white hover:opacity-90'
                  }`}
                >
                  추가
                </button>
              </div>
            </div>
            {/* 중간: 헥사곤 키워드 그리드 */}
            <div className="flex-1 flex items-center justify-center">
              <HexKeywordGrid
                keywords={resultKeywords}
                selected={selectedKeywords}
                onToggle={handleToggle}
              />
            </div>
            {/* 하단: 키워드 생성 버튼 */}
            <div className="sticky bottom-0 left-0 w-full bg-white pt-2 pb-4 flex items-center shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-10 relative">
              <div className="flex-1 flex justify-end pr-4">
                {/* 오른쪽 끝: 탐색 종료 */}
                <button
                  onClick={() => navigate('/final', { state: { summaryHistory } })}
                  disabled={summaryHistory.length === 0}
                  className={`px-5 py-2 rounded-lg font-bold transition text-base shadow-md ${
                    summaryHistory.length === 0
                      ? 'bg-[#E7E7E7] text-[#AAAAAA] cursor-not-allowed'
                      : 'bg-[#121212] text-[#FFF] hover:brightness-105'
                  }`}
                  style={{ minWidth: 120 }}
                >
                  탐색 종료
                </button>
              </div>
              <button
                className="absolute left-1/2 -translate-x-1/2 px-5 py-2 rounded-lg font-bold transition text-base shadow-md"
                style={{ minWidth: 180, zIndex: 10,
                  backgroundColor: selectedKeywords.length === 0 || loading ? '#E7E7E7' : '#ffce00',
                  color: selectedKeywords.length === 0 || loading ? '#AAAAAA' : '#121212',
                  cursor: selectedKeywords.length === 0 || loading ? 'not-allowed' : 'pointer'
                }}
                onClick={handleConfirmKeywords}
                disabled={selectedKeywords.length === 0 || loading}
              >
                키워드 생성하기
              </button>
            </div>
          </div>
        </div>

        {/* 우측 기사/요약 영역 */}
        <div className="w-1/3 p-4 overflow-auto">
          {/* 로딩 바 */}
          {loading && (
            <div style={{ width: '100%', height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                width: '40%',
                height: '100%',
                background: '#ffce00',
                borderRadius: 2,
                animation: 'loading-bar-move 1s linear infinite'
              }} />
              <style>{`
                @keyframes loading-bar-move {
                  0% { margin-left: -40%; }
                  100% { margin-left: 100%; }
                }
              `}</style>
            </div>
          )}
          <div className="mb-4 rounded p-3" style={{ backgroundColor: '#F7DA21', color: '#121212' }}>
            {summary ? (
              <>
                <h3 className="font-semibold text-lg mb-2">📝 인공지능 요약</h3>
                <p className="text-sm whitespace-pre-wrap">{summary}</p>
              </>
            ) : (
              <p className="text-sm text-[#666]">요약 결과가 여기에 표시됩니다.</p>
            )}
          </div>  

          <h2 className="text-xl font-bold mb-2">📰 뉴스 기사 수 : {resultArticles.length}</h2>
          <ul className="space-y-4">
            {resultArticles.map((item, idx) => (
              <li
                key={idx}
                className="p-3 rounded border"
                style={{ borderColor: '#E7E7E7', backgroundColor: '#FAFAFA', color: '#121212' }}
              >
                <h3 className="font-semibold mb-1">
                <a href={item.originallink}  target="_blank"  rel="noopener noreferrer"  style={{ color: '#121212' }}>{item.title}</a>
                </h3>
                <p className="text-sm mb-1">
                <a href={item.originallink}  target="_blank"  rel="noopener noreferrer"  style={{ color: '#808080' }}>{item.description}</a>
                </p>
                <p className="text-sm">
                  <a href={item.originallink}  target="_blank"  rel="noopener noreferrer"  style={{ color: '#808080' }}>발행일 : {item.pubDate}</a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;