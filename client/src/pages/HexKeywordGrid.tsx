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

const sortCoordsByDistance = (coords: { q: number; r: number; s: number }[]) => {
  return coords.sort((a, b) => {
    const da = Math.abs(a.q) + Math.abs(a.r) + Math.abs(a.s);
    const db = Math.abs(b.q) + Math.abs(b.r) + Math.abs(b.s);
    return da - db;
  });
};

const HexKeywordGrid: React.FC<Props> = ({ keywords, selected, onToggle }) => {
  const coords = sortCoordsByDistance(generateHexCoords(3)); // 반지름 3 = 최대 37개 셀

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
          {coords.map(({ q, r, s }, i) => {
            const kw = keywords[i];
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
                    style={{
                        fill: 'black',
                        userSelect: 'none',
                        fontWeight: 100,
                        fontFamily: 'Arial, sans-serif',          
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
