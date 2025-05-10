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

  // 최종 보고 관련 상태
  const [finalReport, setFinalReport] = useState('');
  const [definitions, setDefinitions] = useState<{[k: string]: string}>({});
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState('');

  const reportRef = useRef<HTMLDivElement>(null);

  // 최종 보고 fetch
  React.useEffect(() => {
    const fetchFinalReport = async () => {
      if (!typedSummaryHistory.length) return;
      const last = typedSummaryHistory[typedSummaryHistory.length - 1];
      if (!last.keywords?.length || !last.summary) return;
      setLoadingReport(true);
      setErrorReport('');
      try {
        const resp = await fetch('http://localhost:5001/final_report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords: last.keywords,
            summary: last.summary,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.final_report) {
          setFinalReport(data.final_report);
          setDefinitions(data.definitions || {});
        } else {
          setErrorReport(data.error || '최종 보고 생성 실패');
        }
      } catch (e) {
        setErrorReport('최종 보고 생성 실패');
      }
      setLoadingReport(false);
    };
    fetchFinalReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedSummaryHistory]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#fff',
      windowWidth: reportRef.current.scrollWidth,
      windowHeight: reportRef.current.scrollHeight,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    // 여러 페이지 지원 (텍스트 잘림 방지)
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save('summary.pdf');
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#FFFFFF', color: '#121212' }}>
      {/* 좌상단 홈 버튼 + 중앙 타이틀+라벨 */}
      <div className="flex items-start mb-6">
        <Link
          to="/"
          className="bg-[#121212] text-white p-2 rounded hover:opacity-80 mr-4 mt-1"
          title="처음으로"
        >
          <FaHome size={20} />
        </Link>
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center">최종 요약 결과</h1>
        </div>
      </div>

    

      {/* 최종 보고 영역 */}
      {typedSummaryHistory.length > 0 && typedSummaryHistory[typedSummaryHistory.length-1]?.keywords?.length > 0 && (
        <div className="w-full flex flex-col items-center justify-center mb-8">
          <h2 className="text-xl font-bold my-2">최종 보고</h2>
          {loadingReport ? (
            <div className="text-gray-500">최종 보고 생성 중...</div>
          ) : errorReport ? (
            <div className="text-red-500">{errorReport}</div>
          ) : finalReport ? (
            <div className="bg-gray-50 p-4 rounded shadow w-full max-w-2xl text-left whitespace-pre-line border border-[#f7da21]">
              {finalReport}
            </div>
          ) : null}
        </div>
      )}

      {/* PDF 용 숨김 영역 - 보고서 스타일 */}
      <div
        ref={reportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          background: '#fff',
          color: '#121212',
          width: '900px',
          minHeight: '1200px',
          padding: '48px 32px',
          zIndex: -1,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* PDF 전체를 하나의 parent div로 감싼다 */}
        <div style={{ width: '100%' }}>
          {/* 최종 요약 결과 제목 (항상 최상단) */}
          <h1 style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: '2.2rem', textAlign: 'center', letterSpacing: '0.02em' }}>최종 요약 결과</h1>
          {/* 최종 보고 PDF에 반드시 포함 - 키워드 아래 */}
          {finalReport && (
            <div
              style={{
                background: '#f9f9f9',
                border: '2px solid #f7da21',
                borderRadius: 12,
                padding: 28,
                margin: '30px 0',
                width: '100%',
                fontSize: 18,
                fontWeight: 500,
                whiteSpace: 'pre-line',
                color: '#222',
              }}
            >
              {finalReport}
            </div>
          )}
          {/* summary history */}
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
          {/* PDF 메모 영역 */}
          <div style={{ marginTop: 32, width: '100%' }}>
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
      </div>


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

      {/* 하단 버튼들 (실제 화면에서만 보임, PDF에는 포함X) */}
      <div className="mt-10 flex justify-center gap-4">
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
      <ul className="space-y-6 mt-12"></ul>
      <ul className="space-y-6 mt-12"></ul>
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
    </div>
    
  );
}

export default FinalPage;