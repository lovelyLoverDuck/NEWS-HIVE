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

const HexKeywordGrid: React.FC<Props> = ({ keywords, selected, onToggle }) => {
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
          size={{ x: 12, y: 12 }}
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
                  fill: isSelected ? '#F7DA21' : '#E5E7EB',
                  stroke: 'none',
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
                    letterSpacing="0.03em"
                    style={{
                      fill: '#121212',
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
