import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';

interface Props {
  keywords: string[];
  selected: string[];
  onToggle: (kw: string) => void;
}

// 육각형 좌표 생성기
const generateHexCoords = (radius: number) => {
  const coords = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        coords.push({ q, r, s });
      }
    }
  }
  return coords;
};

// 중심과 가까운 순서로 정렬
const distanceFromCenter = (hex: { q: number; r: number; s: number }) =>
  Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(hex.s));

const HexKeywordGrid: React.FC<Props> = ({ keywords, selected, onToggle }) => {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  // 키워드 수에 따라 동적으로 반지름 설정
  const radius = Math.ceil(Math.sqrt(keywords.length));
  const coords = generateHexCoords(radius).sort((a, b) => distanceFromCenter(a) - distanceFromCenter(b));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <HexGrid width={700} height={700} viewBox="-80 -40 160 120">
        <Layout
          size={{ x: 12, y: 12 }}
          flat={false}
          spacing={1.1}
          origin={{ x: 0, y: 0 }}
        >
          {coords.slice(0, keywords.length).map(({ q, r, s }, i) => {
            const kw = keywords[i];
            const isSelected = kw && selected.includes(kw);
            const isFirst = i === 0;
            return (
              <Hexagon
                key={`${q},${r},${s}`}
                q={q}
                r={r}
                s={s}
                onClick={() => kw && onToggle(kw)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  fill: hoveredIdx === i ? '#ffce00' : isSelected ? '#F7DA21' : '#E5E7EB',
                  stroke: isFirst ? '#ffce00' : 'none', // 첫 키워드만 노란색 테두리
                  strokeWidth: isFirst ? 1 : 0,
                  cursor: kw ? 'pointer' : 'default',
                  transition: 'fill 0.2s',
                }}
              >
                {kw && (
                  <text
                    x="0"
                    y="0"
                    dy=".35em"
                    fontSize={kw.length >= 5 ? 3.5 : 5.5}
                    textAnchor="middle"
                    style={{
                      fill: '#121212',
                      userSelect: 'none',
                      fontFamily: 'var(--font-family-main)',
                      shapeRendering: 'geometricPrecision',
                      stroke: 'none',
                      strokeWidth: 0,
                      paintOrder: 'fill',
                    }}
                  >
                    {kw}
                  </text>
                )}
              </Hexagon>
            );
          })}
        </Layout>
      </HexGrid>
    </div>
  );
};

export default HexKeywordGrid;