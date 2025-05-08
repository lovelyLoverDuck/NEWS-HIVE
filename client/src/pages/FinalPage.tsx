import { Link, useLocation } from 'react-router-dom';
import React, { useState } from 'react';


function FinalPage() {
  const location = useLocation();
  // const { query, results } = location.state || { query: '검색어 없음', results: { items: [] } };
  const { summaryHistory = [] } = location.state || {};
  const [userMemo, setUserMemo] = useState('');

  return (
    <div className="p-4">
  <h1 className="text-2xl font-bold mb-4">최종 요약 결과</h1>

  {summaryHistory.length === 0 ? (
    <p>요약된 정보가 없습니다.</p>
  ) : (
    <ul className="space-y-6">
      {summaryHistory.map((item, index) => (
        <li key={index} className="border border-gray-300 rounded p-4 bg-white">
          <p className="text-sm text-gray-600">🔑 키워드: {item.keywords.join(', ')}</p>
          <p className="mt-2">{item.summary}</p>
        </li>
      ))}
    </ul>
  )}
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-2">📝 나의 메모</h2>
    <textarea
      value={userMemo}
      onChange={(e) => setUserMemo(e.target.value)}
      rows={6}
      placeholder="여기에 자유롭게 메모를 작성하세요..."
      className="w-full p-4 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
     />
  </div>
  <button
    onClick={() => {
      navigator.clipboard.writeText(userMemo);
      alert('메모가 클립보드에 복사되었습니다!');
    }}
    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    메모 복사하기
  </button>

  <div className="mt-6">
    <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      처음으로
    </Link>
  </div>
</div>

  );
}

export default FinalPage;
