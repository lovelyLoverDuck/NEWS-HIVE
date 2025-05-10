import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';


interface Props {
  keywords: string[];
  selected: string[];
  onToggle: (kw: string) => void;
}

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

// sortCoordsByDistance 제거: 좌표 순서를 그대로 사용하여 키워드 위치가 고정되도록 함

const HexKeywordGrid: React.FC<Props> = ({ keywords, selected, onToggle }) => {
  // 모든 키워드를 중앙부터 가까운 순서로 배치
  const displayKeywords = keywords;
  const coords = generateHexCoords(3).sort((a, b) => {
    const da = Math.abs(a.q) + Math.abs(a.r) + Math.abs(a.s);
    const db = Math.abs(b.q) + Math.abs(b.r) + Math.abs(b.s);
    return da - db;
  });

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
      <HexGrid width={700} height={700} viewBox="-80 -60 160 120">
        <Layout
          size={{ x: 12, y: 12 }} // 크기 ↑
          flat={false}
          spacing={1.1}
          origin={{ x: 0, y: 0 }}
        >
          {coords.slice(0, displayKeywords.length).map(({ q, r, s }, i) => {
            const kw = displayKeywords[i];
            const isSelected = kw && selected.includes(kw);
            return (
              <Hexagon
                key={`${q},${r},${s}`}
                q={q}
                r={r}
                s={s}
                onClick={() => kw && onToggle(kw)}
                style={{
                  fill: isSelected ? '#60A5FA' : '#E5E7EB',
                  stroke: '#999',
                  cursor: kw ? 'pointer' : 'default',
                }}
              >
                {kw && (
                  <text
                    x="0"
                    y="0"
                    dy=".35em"
                    fontSize={kw.length >= 5 ? 3.5 : 5.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    alignmentBaseline="middle"
                    fontFamily="system-ui"
                    fontStyle="normal"
                    fontStretch="normal"
                    letterSpacing="0.03em"
                    paintOrder="stroke fill markers"
                    style={{
                      fill: 'black',
                      userSelect: 'none',
                      shapeRendering: 'geometricPrecision',
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
