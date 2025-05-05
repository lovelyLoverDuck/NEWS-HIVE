import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const reSearch = (keywordsToSearch?: string[]) => {
    const searchKeywords = keywordsToSearch ?? selectedKeywords;
    if (searchKeywords.length === 0) {
      setResultArticles(safeArticles); // 아무 키워드도 없으면 전체 기사
      return;
    }
    setLoading(true);
    // Redis 캐시 활용: 프론트 articles에서 해당 키워드 포함 기사만 필터링
    // (실제 Redis는 서버에서 관리, 프론트는 단순 필터)
    // 모든 키워드가 기사 text에 포함되는 기사만 보여줌
    const filtered = safeArticles.filter((article: any) =>
      searchKeywords.every(kw =>
        (article.title && article.title.includes(kw)) ||
        (article.description && article.description.includes(kw))
      )
    );
    setResultArticles(filtered);
    setLoading(false);
  };

  // 키워드 확정(추출) 버튼 (최초 검색이 아닐 때만)
  const handleConfirmKeywords = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5001/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_list: selectedKeywords, is_initial: true })
      });
      const data = await resp.json();
      setResultArticles(data.articles || []);
      setResultKeywords(data.keywords || []);
    } catch (e) {
      alert('키워드 추출 실패');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 디버깅용 상태 출력 */}
      <h2>검색 결과</h2>
      <div>
        <b>키워드 버튼 (최대 3개): </b>
        {resultKeywords.map((kw: string) => (
          <button
            key={kw}
            style={{
              margin: 4,
              background: selectedKeywords.includes(kw) ? '#007bff' : '#eee',
              color: selectedKeywords.includes(kw) ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer'
            }}
            onClick={() => handleToggle(kw)}
          >
            {kw}
          </button>
        ))}
      </div>
      <div style={{ margin: '10px 0' }}>
        <button onClick={() => reSearch()} disabled={selectedKeywords.length === 0 || loading}>
          선택 키워드로 재검색
        </button>
        <button onClick={handleConfirmKeywords} disabled={selectedKeywords.length === 0 || loading} style={{ marginLeft: 8 }}>
          키워드 확정(추출)
        </button>
      </div>
      <div>
        <b>뉴스 기사 수: {resultArticles.length}</b>
        <ul>
          {resultArticles.map((item, idx) => (
            <li key={idx} style={{ border: '1px solid #ddd', margin: 8, padding: 8 }}>
              <b>{item.title}</b>
              <div>{item.description}</div>
              <div>원문: <a href={item.originallink} target="_blank" rel="noopener noreferrer">{item.originallink}</a></div>
              <div>발행일: {item.pubDate}</div>
            </li>
          ))}
        </ul>
      </div>
      {loading && <div>로딩중...</div>}
    </div>
  );
}

export default ResultsPage;
