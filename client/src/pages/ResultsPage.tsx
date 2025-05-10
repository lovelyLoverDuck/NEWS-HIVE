import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
//import HexKeywordGrid from './HexKeywordGrid'; 



function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  //요약저장
  const [summary, setSummary] = useState<string>(''); // GPT 요약문
  const [summaryHistory, setSummaryHistory] = useState<{ keywords: string[], summary: string }[]>([]);


  // location.state가 없으면 홈으로 리디렉트
  React.useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  // 백엔드에서 받은 구조에 맞게 분해
  const { query_list = [], is_initial = true, articles = [], keywords = [] } = location.state || {};
  // 항상 배열 보장
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeKeywords = Array.isArray(keywords) ? keywords : [];

  // 토글 키워드 상태 (최대 3개)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [resultArticles, setResultArticles] = useState<any[]>(safeArticles);
  const [resultKeywords, setResultKeywords] = useState<string[]>(safeKeywords.length > 0 ? safeKeywords : ['예시1', '예시2', '예시3']);
  const [loading, setLoading] = useState(false);

  // 사용자 입력 키워드 추가 상태
  const [inputKeyword, setInputKeyword] = useState<string>("");

  // 키워드 추가 핸들러
  const handleAddKeyword = () => {
    const trimmed = inputKeyword.trim();
    if (trimmed && !resultKeywords.includes(trimmed)) {
      setResultKeywords(prev => [trimmed, ...prev]);
      setInputKeyword("");
    }
  };

  React.useEffect(() => {
    setResultKeywords(safeKeywords.length > 0 ? safeKeywords : ['예시1', '예시2', '예시3']);
  }, [safeKeywords]);


  // 토글 버튼 클릭
  const handleToggle = (kw: string) => {
    setSelectedKeywords(prev => {
      let next;
      if (prev.includes(kw)) next = prev.filter(k => k !== kw);
      else if (prev.length < 3) next = [...prev, kw];
      else next = prev;
      // 토글 후 즉시 재검색
      reSearch(next);
      return next;
    });
  };

  // 토글된 키워드로 재검색 (selectedKeywords 인자를 받음)
  // 토글된 키워드로 재검색 (selectedKeywords 인자를 받음)
  const reSearch = async (keywordsToSearch?: string[]) => {
    const searchKeywords = keywordsToSearch ?? selectedKeywords;
    if (searchKeywords.length === 0) {
      setResultArticles(safeArticles); // 아무 키워드도 없으면 전체 기사
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
      // 키워드 버튼은 기존 resultKeywords 유지 (추출X)
    } catch (e) {
      alert('뉴스 검색 실패');
    }
    setLoading(false);
  };

  //추가2
  const handleConfirmKeywords = async () => {
    if (selectedKeywords.length === 0) return;
    setLoading(true);
    try {
      // 키워드 추출 요청
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

      // 키워드 갱신
      if (keywordsData.keywords) {
        setResultKeywords(prev => Array.from(new Set([...(prev || []), ...(keywordsData.keywords || [])])));
      }

      // 요약 저장
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
      <div className="h-[60px] px-4 py-2 flex gap-2 border-b border-gray-300">
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
        <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          처음으로
        </Link>
      </div>

      {/* 중간 콘텐츠 (키워드 버튼 + 기사 리스트) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 키워드 버튼 */}
        <div className="w-2/3 p-4 border-r border-gray-300 overflow-auto">
          {/* 키워드 입력 및 추가 */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={inputKeyword}
              onChange={e => setInputKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword(); }}
              placeholder="키워드 입력"
              className="border px-2 py-1 rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          {/* 키워드 버튼 리스트 */}
          <div className="flex flex-wrap gap-2">
            {resultKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => handleToggle(kw)}
                className={`px-3 py-1 rounded border text-sm transition ${selectedKeywords.includes(kw)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
        {/* 우측: 뉴스 기사 */}
        <div className="w-1/3 p-4 overflow-auto">
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

      {/* 하단: GPT 요약 */}
      <div className="h-[120px] p-4 border-t border-gray-300 bg-yellow-50 overflow-auto">
        {summary ? (
          <>
            <h3 className="font-semibold text-lg mb-2">📝 GPT 요약</h3>
            <p className="text-sm whitespace-pre-wrap">{summary}</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">요약 결과가 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  );

}

export default ResultsPage;
