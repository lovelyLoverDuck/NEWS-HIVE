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


// import { Link, useLocation } from 'react-router-dom';
// import React, { useState, useRef } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { FaHome } from 'react-icons/fa';

// type SummaryItem = { keywords: string[]; summary: string };

// function FinalPage() {
//   const location = useLocation();
//   const { summaryHistory = [] } = location.state || {};
//   const [userMemo, setUserMemo] = useState('');
//   const typedSummaryHistory: SummaryItem[] = summaryHistory as SummaryItem[];

//   const reportRef = useRef<HTMLDivElement>(null);

//   const handleExportPDF = async () => {
//     if (!reportRef.current) return;
//     const element = reportRef.current;
//     const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     const imgProps = { width: canvas.width, height: canvas.height };
//     const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
//     const imgW = imgProps.width * ratio;
//     const imgH = imgProps.height * ratio;
//     pdf.addImage(imgData, 'PNG', (pageWidth - imgW) / 2, 10, imgW, imgH);
//     pdf.save('report.pdf');
//   };

//   return (
//     <div className="p-4">
//       {/* 홈 아이콘 + 제목 같이 배치 */}
//       <div className="flex items-center mb-4">
//         <Link
//           to="/"
//           className="mr-2 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
//           title="처음으로"
//         >
//           <FaHome size={20} />
//         </Link>
//         <h1 className="text-2xl font-bold">최종 요약 결과</h1>
//       </div>

//       {/* PDF 추출용 숨겨진 영역 */}
//       <div
//         ref={reportRef}
//         style={{
//           position: 'absolute',
//           left: '-9999px',
//           top: 0,
//           background: '#fff',
//           color: '#222',
//           width: '800px',
//           padding: '32px',
//           zIndex: -1,
//           fontFamily: 'system-ui, sans-serif',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
//         }}
//       >
//         <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>최종 요약 결과</h1>
//         {typedSummaryHistory.length === 0 ? (
//           <p>요약된 정보가 없습니다.</p>
//         ) : (
//           <ul style={{ marginBottom: '2rem' }}>
//             {typedSummaryHistory.map((item, index) => (
//               <li
//                 key={index}
//                 style={{
//                   border: '1px solid #bbb',
//                   borderRadius: 8,
//                   padding: 16,
//                   background: '#fafafa',
//                   marginBottom: 16,
//                 }}
//               >
//                 <p style={{ fontSize: 14, color: '#666' }}>🔑 키워드: {item.keywords.join(', ')}</p>
//                 <p style={{ marginTop: 8 }}>{item.summary}</p>
//               </li>
//             ))}
//           </ul>
//         )}
//         <div style={{ marginTop: 32 }}>
//           <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>📝 나의 메모</h2>
//           <div
//             style={{
//               whiteSpace: 'pre-wrap',
//               border: '1px solid #bbb',
//               borderRadius: 8,
//               padding: 16,
//               background: '#fffbe6',
//               minHeight: 120,
//             }}
//           >
//             {userMemo || <span style={{ color: '#bbb' }}>(메모 없음)</span>}
//           </div>
//         </div>
//       </div>

//       {/* 실제 화면 내용 */}
//       {typedSummaryHistory.length === 0 ? (
//         <p>요약된 정보가 없습니다.</p>
//       ) : (
//         <ul className="space-y-6">
//           {typedSummaryHistory.map((item, index) => (
//             <li key={index} className="border border-gray-300 rounded p-4 bg-white">
//               <p className="text-sm text-gray-600">🔑 키워드: {item.keywords.join(', ')}</p>
//               <p className="mt-2">{item.summary}</p>
//             </li>
//           ))}
//         </ul>
//       )}

//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-2">📝 나의 메모</h2>
//         <textarea
//           value={userMemo}
//           onChange={e => setUserMemo(e.target.value)}
//           rows={6}
//           placeholder="여기에 자유롭게 메모를 작성하세요..."
//           className="w-full p-4 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
//         />
//       </div>

//       <div className="mt-4 space-x-2">
//         <button
//           onClick={handleExportPDF}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//         >
//           보고서 추출 (PDF)
//         </button>
//         <button
//           onClick={() => {
//             navigator.clipboard.writeText(userMemo);
//             alert('메모가 클립보드에 복사되었습니다!');
//           }}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           메모 복사하기
//         </button>
//       </div>
//     </div>
//   );
// }

// export default FinalPage;

// // import { Link, useLocation } from 'react-router-dom';
// // import React, { useState, useRef } from 'react';
// // import jsPDF from 'jspdf';
// // import html2canvas from 'html2canvas';


// // type SummaryItem = { keywords: string[]; summary: string };

// // function FinalPage() {
// //   const location = useLocation();
// //   // const { query, results } = location.state || { query: '검색어 없음', results: { items: [] } };
// //   const { summaryHistory = [] } = location.state || {};
// //   const [userMemo, setUserMemo] = useState('');
// //   const typedSummaryHistory: SummaryItem[] = summaryHistory as SummaryItem[];

// //   // PDF 추출용 ref
// //   const reportRef = useRef<HTMLDivElement>(null);

// //   // PDF 추출 함수
// //   const handleExportPDF = async () => {
// //     if (!reportRef.current) return;
// //     const element = reportRef.current;
// //     const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
// //     const imgData = canvas.toDataURL('image/png');
// //     const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
// //     const pageWidth = pdf.internal.pageSize.getWidth();
// //     const pageHeight = pdf.internal.pageSize.getHeight();
// //     // 이미지 비율에 맞게 크기 조정
// //     const imgProps = { width: canvas.width, height: canvas.height };
// //     const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
// //     const imgW = imgProps.width * ratio;
// //     const imgH = imgProps.height * ratio;
// //     pdf.addImage(imgData, 'PNG', (pageWidth - imgW) / 2, 10, imgW, imgH);
// //     pdf.save('report.pdf');
// //   };

// //   return (
// //     <div className="p-4">
// //       {/* PDF 추출용: 화면에는 안 보이지만 PDF로는 이 부분이 캡처됨 */}
// //       <div
// //         ref={reportRef}
// //         style={{
// //           position: 'absolute',
// //           left: '-9999px',
// //           top: 0,
// //           background: '#fff',
// //           color: '#222',
// //           width: '800px',
// //           padding: '32px',
// //           zIndex: -1,
// //           fontFamily: 'system-ui, sans-serif',
// //           borderRadius: '12px',
// //           boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
// //         }}
// //       >
// //         <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>최종 요약 결과</h1>
// //         {summaryHistory.length === 0 ? (
// //           <p>요약된 정보가 없습니다.</p>
// //         ) : (
// //           <ul style={{ marginBottom: '2rem' }}>
// //             {typedSummaryHistory.map((item: SummaryItem, index: numbero) => (
// //               <li key={index} style={{ border: '1px solid #bbb', borderRadius: 8, padding: 16, background: '#fafafa', marginBottom: 16 }}>
// //                 <p style={{ fontSize: 14, color: '#666' }}>🔑 키워드: {item.keywords.join(', ')}</p>
// //                 <p style={{ marginTop: 8 }}>{item.summary}</p>
// //               </li>
// //             ))}
// //           </ul>
// //         )}
// //         <div style={{ marginTop: 32 }}>
// //           <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>📝 나의 메모</h2>
// //           <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #bbb', borderRadius: 8, padding: 16, background: '#fffbe6', minHeight: 120 }}>
// //             {userMemo || <span style={{ color: '#bbb' }}>(메모 없음)</span>}
// //           </div>
// //         </div>
// //       </div>
// //       {/* 실제 화면에 보이는 부분 */}
// //       <h1 className="text-2xl font-bold mb-4">최종 요약 결과</h1>
// //       {summaryHistory.length === 0 ? (
// //         <p>요약된 정보가 없습니다.</p>
// //       ) : (
// //         <ul className="space-y-6">
// //           {typedSummaryHistory.map((item: SummaryItem, index: number) => (
// //             <li key={index} className="border border-gray-300 rounded p-4 bg-white">
// //               <p className="text-sm text-gray-600">🔑 키워드: {item.keywords.join(', ')}</p>
// //               <p className="mt-2">{item.summary}</p>
// //             </li>
// //           ))}
// //         </ul>
// //       )}
// //       <div className="mt-8">
// //         <h2 className="text-xl font-semibold mb-2">📝 나의 메모</h2>
// //         <textarea
// //           value={userMemo}
// //           onChange={e => setUserMemo(e.target.value)}
// //           rows={6}
// //           placeholder="여기에 자유롭게 메모를 작성하세요..."
// //           className="w-full p-4 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
// //         />
// //       </div>
// //       <button
// //         onClick={handleExportPDF}
// //         className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
// //       >
// //         보고서 추출 (PDF)
// //       </button>
// //       <button
// //         onClick={() => {
// //           navigator.clipboard.writeText(userMemo);
// //           alert('메모가 클립보드에 복사되었습니다!');
// //         }}
// //         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
// //       >
// //         메모 복사하기
// //       </button>
// //       <div className="mt-6">
// //         <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
// //           처음으로
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }

// // export default FinalPage;
