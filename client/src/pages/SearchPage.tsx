import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/results', { state: { query: searchQuery } });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">검색 페이지</h1>
      <form onSubmit={handleSearch} className="space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="border p-2 rounded w-full max-w-md"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          검색하기
        </button>
      </form>
    </div>
  );
}

export default SearchPage;
