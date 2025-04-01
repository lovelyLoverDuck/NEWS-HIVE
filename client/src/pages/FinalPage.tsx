import { Link, useLocation } from 'react-router-dom';

function FinalPage() {
  const location = useLocation();
  const searchQuery = location.state?.query || '검색어 없음';

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">최종 결과 페이지</h1>
      <div className="mb-4">
        <p className="text-lg">검색어: <span className="font-semibold">{searchQuery}</span></p>
      </div>
      <Link 
        to="/"
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 inline-block"
      >
        처음으로
      </Link>
    </div>
  );
}

export default FinalPage;
