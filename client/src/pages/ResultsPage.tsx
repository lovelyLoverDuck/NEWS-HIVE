import { useLocation, useNavigate } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = location.state?.query || '검색어 없음';

  const handleConfirm = () => {
    navigate('/final', { state: { query: searchQuery } });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">검색 결과 페이지</h1>
      <div className="mb-4">
        <p className="text-lg">검색어: <span className="font-semibold">{searchQuery}</span></p>
      </div>
      <button 
        onClick={handleConfirm}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        확인
      </button>
    </div>
  );
}

export default ResultsPage;
