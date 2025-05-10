import { Link, useLocation } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaHome } from 'react-icons/fa';

type SummaryItem = { keywords: string[]; summary: string };

function FinalPage() {
  const location = useLocation();
  const { summaryHistory = [] } = location.state || {};
  const [userMemo, setUserMemo] = useState('');
  const typedSummaryHistory: SummaryItem[] = summaryHistory as SummaryItem[];

  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#fff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('summary.pdf');
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#FFFFFF', color: '#121212' }}>
      {/* 상단 홈 버튼 + 제목 */}
      <div className="flex items-center mb-6">
        <Link
          to="/"
          className="mr-3 bg-[#121212] text-white p-2 rounded hover:opacity-80"
          title="처음으로"
        >
          <FaHome size={20} />
        </Link>
        <h1 className="text-2xl font-bold">최종 요약 결과</h1>
      </div>

      {/* 선택한 키워드 시각화 */}
      {typedSummaryHistory.length > 0 && typedSummaryHistory[typedSummaryHistory.length-1]?.keywords?.length > 0 && (
        <div className="mb-8 mt-2 w-full flex flex-col items-center">
          <div className="text-[#121212] font-semibold mb-3 text-lg">선택한 키워드</div>
          <div className="flex items-center gap-0 justify-center w-full">
            {typedSummaryHistory[typedSummaryHistory.length-1].keywords.map((kw, idx, arr) => (
              <React.Fragment key={idx}>
                <div
                  className="flex items-center justify-center rounded-full overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ width: 70, height: 70, background: '#F7DA21', color: '#121212', fontWeight: 600, fontSize: arr.length > 6 ? 17 : 24, maxWidth: 70 }}
                  title={kw}
                >
                  <span className="px-2 w-full text-center block overflow-hidden text-ellipsis whitespace-nowrap" style={{fontSize: arr.length > 8 ? 13 : arr.length > 6 ? 16 : 20}}>{kw}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="mx-2" style={{ height: 4, width: 56, background: '#e5e7eb', borderRadius: 2 }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* PDF 용 숨김 영역 */}
      <div
        ref={reportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          background: '#fff',
          color: '#121212',
          width: '800px',
          padding: '32px',
          zIndex: -1,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: '12px',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>최종 요약 결과</h1>
        {typedSummaryHistory.length === 0 ? (
          <p>요약된 정보가 없습니다.</p>
        ) : (
          <ul style={{ marginBottom: '2rem' }}>
            {typedSummaryHistory.map((item, index) => (
              <li
                key={index}
                style={{
                  border: '1px solid #E7E7E7',
                  borderRadius: 8,
                  padding: 16,
                  background: '#FAFAFA',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 14, color: '#666' }}>🔑 키워드: {item.keywords.join(', ')}</p>
                <p style={{ marginTop: 8 }}>{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>📝 나의 메모</h2>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              border: '1px solid #E7E7E7',
              borderRadius: 8,
              padding: 16,
              background: '#fffbe6',
              minHeight: 120,
            }}
          >
            {userMemo || <span style={{ color: '#bbb' }}>(메모 없음)</span>}
          </div>
        </div>
      </div>

      {/* 실제 요약 내용 */}
      {typedSummaryHistory.length === 0 ? (
        <p>요약된 정보가 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {typedSummaryHistory.map((item, index) => (
            <li
              key={index}
              className="rounded p-4"
              style={{ backgroundColor: '#FAFAFA', border: '1px solid #E7E7E7' }}
            >
              <p className="text-sm text-[#666]">🔑 키워드: {item.keywords.join(', ')}</p>
              <p className="mt-2">{item.summary}</p>
            </li>
          ))}
        </ul>
      )}

      {/* 메모 영역 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📝 나의 메모</h2>
        <textarea
          value={userMemo}
          onChange={(e) => setUserMemo(e.target.value)}
          rows={6}
          placeholder="여기에 자유롭게 메모를 작성하세요..."
          className="w-full p-4 border rounded shadow-sm focus:outline-none"
          style={{
            borderColor: '#E7E7E7',
            backgroundColor: '#FFFFFF',
            color: '#121212',
          }}
        />
      </div>

      {/* 버튼들 */}
      <div className="mt-6 space-x-2">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 rounded font-semibold"
          style={{
            backgroundColor: '#F7DA21',
            color: '#121212',
          }}
        >
          보고서 추출 (PDF)
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(userMemo);
            alert('메모가 클립보드에 복사되었습니다!');
          }}
          className="px-4 py-2 rounded font-semibold"
          style={{
            backgroundColor: '#121212',
            color: '#FFFFFF',
          }}
        >
          메모 복사하기
        </button>
      </div>
    </div>
  );
}

export default FinalPage;