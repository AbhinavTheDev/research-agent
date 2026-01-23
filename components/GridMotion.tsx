import React, { isValidElement } from "react";

interface GridMotionProps {
  items?: (string | React.ReactElement | undefined)[];
  gradientColor?: string;
  rows?: number;
  cols?: number;
  webSearch?: boolean; // Added for consistency with usage in index.tsx
}

const GridMotion: React.FC<GridMotionProps> = ({
  items = [],
  gradientColor = "black",
  rows = 4,
  cols = 7,
  webSearch = false, // Default to false
}) => {
  const totalItems = rows * cols;
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`,
  );
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  return (
    <div className="h-full w-full overflow-hidden">
      <section
        className="w-[98%] h-[97vh] overflow-hidden relative flex items-center justify-center opacity-20"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
          "--rows": rows,
          "--cols": cols,
        } as React.CSSProperties}
      >
        {/* Pseudo-element equivalent for .intro::after */}
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            backgroundSize: "250px",
          }}
        ></div>
        <div
          className="flex-none relative gap-4 w-screen h-[150vh] grid z-[1] -rotate-[15deg] origin-center"
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: "100%",
          }}
        >
          {[...Array(rows)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 will-change-transform"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }}
            >
              {[...Array(cols)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * cols + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div
                      className="relative w-full h-full overflow-hidden rounded-[10px] flex items-center justify-center bg-[#131313] text-[rgb(49, 49, 49)] text-xl"
                      style={{
                        backgroundColor: "rgba(17, 17, 17, 0.2)", // Reduced opacity for better visibility of overlaying content
                        border: "1px solid rgba(255, 255, 255, 0.05)", // Subtle border
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
                      }}
                    >
                      {typeof content === "object" &&
                      isValidElement(content) ? (
                        content
                      ) : typeof content === "string" &&
                        content.startsWith("http") ? (
                        <div
                          className="absolute inset-0 w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full inset-0 pointer-events-none">
          {/* .fullview styles applied; inner border-radius override can be handled if needed */}
        </div>
      </section>
    </div>
  );
};

export default GridMotion;
