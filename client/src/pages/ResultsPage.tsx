import { useLocation, useNavigate } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, results } = location.state || { query: '검색어 없음', results: { items: [] } };

  const handleConfirm = () => {
    navigate('/final', { state: { query, results } });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">검색 결과 페이지</h1>
      <div className="mb-4">
        <p className="text-lg">검색어: <span className="font-semibold">{query}</span></p>
        <p className="text-lg mt-2">총 검색 결과: <span className="font-semibold">{results.total || 0}개</span></p>
      </div>
      
      <div className="space-y-4">
        {results.items?.map((item: any, index: number) => (
          <div key={index} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {item.title}
              </a>
            </h2>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <div className="text-sm text-gray-500">
              <p>원문 링크: <a href={item.originallink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.originallink}</a></p>
              <p>발행일: {item.pubDate}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleConfirm}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        확인
      </button>
    </div>
  );
}

export default ResultsPage;
