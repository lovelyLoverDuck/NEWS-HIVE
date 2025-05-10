import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import HexKeywordGrid from './HexKeywordGrid';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<string>(''); // GPT 요약문
  const [summaryHistory, setSummaryHistory] = useState<{ keywords: string[], summary: string }[]>([]);
  const { query_list = [], is_initial = true, articles = [], keywords = [] } = location.state || {};
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeKeywords = Array.isArray(keywords) ? keywords : ['예시1', '예시2', '예시3'];

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [resultArticles, setResultArticles] = useState<any[]>(safeArticles);
  const [resultKeywords, setResultKeywords] = useState<string[]>(safeKeywords);
  const [loading, setLoading] = useState(false);
  const [inputKeyword, setInputKeyword] = useState<string>("");

  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    setResultKeywords(safeKeywords);
  }, []);

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
    <div className="h-screen flex flex-col">
      {/* 상단 버튼 영역 */}
      <div className="h-[60px] px-4 py-2 flex gap-2 items-center border-b border-gray-300">
        <Link
          to="/"
          className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
          title="처음으로"
        >
          <FaHome size={20} />
        </Link>

        <button
          onClick={handleConfirmKeywords}
          disabled={selectedKeywords.length === 0 || loading}
          className={`px-4 py-2 rounded font-semibold transition ${selectedKeywords.length === 0 || loading
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          키워드 확정(추출)
        </button>

        <button
          onClick={() => navigate('/final', { state: { summaryHistory } })}
          disabled={summaryHistory.length === 0}
          className={`px-4 py-2 rounded font-semibold transition ${summaryHistory.length === 0
            ? 'bg-green-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          완료
        </button>
      </div>

      {/* 중간 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 키워드 */}
        <div className="w-2/3 p-4 border-r border-gray-300 overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={inputKeyword}
              onChange={e => setInputKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword(); }}
              placeholder="키워드 입력"
              className="border px-2 py-1 rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              disabled={loading}
            />
            <button
              onClick={handleAddKeyword}
              disabled={!inputKeyword.trim() || resultKeywords.includes(inputKeyword.trim()) || loading}
              className={`px-3 py-1 rounded font-semibold transition ${!inputKeyword.trim() || resultKeywords.includes(inputKeyword.trim()) || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              추가
            </button>
          </div>
          <HexKeywordGrid
            keywords={resultKeywords}
            selected={selectedKeywords}
            onToggle={handleToggle}
          />
        </div>

        {/* 우측: GPT 요약 + 뉴스 목록 */}
        <div className="w-1/3 p-4 overflow-auto">
          {/* GPT 요약을 우측 상단으로 이동 */}
          <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded p-3">
            {summary ? (
              <>
                <h3 className="font-semibold text-lg mb-2">📝 GPT 요약</h3>
                <p className="text-sm whitespace-pre-wrap">{summary}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">요약 결과가 여기에 표시됩니다.</p>
            )}
          </div>

          <h2 className="text-xl font-bold mb-2">📰 뉴스 기사 수: {resultArticles.length}</h2>
          <ul className="space-y-4">
            {resultArticles.map((item, idx) => (
              <li key={idx} className="border border-gray-300 p-3 rounded">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-700 mb-1">{item.description}</p>
                <p className="text-sm">
                  <a
                    href={item.originallink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    원문 보기
                  </a>
                  <span className="ml-4 text-gray-500">발행일: {item.pubDate}</span>
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
