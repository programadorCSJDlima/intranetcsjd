import React from 'react';

export default function CardView({ img, title, showTitle = true, link }) {
  const base = import.meta.env.BASE_URL;

  return (
    <div className="group relative w-full fondito rounded-md overflow-hidden shadow hover:shadow-lg transition-shadow">
      {link ? (
        <a href={link} target='_blank' rel="noopener noreferrer">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `${base}images/no-image.jpg`;
            }}
          />
        </a>
      ) : (
        <img
          src={img}
          alt={title}
          className="w-full h-auto object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `${base}images/no-image.jpg`;
          }}
        />
      )}

      <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>

      {showTitle && title && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white bg-opacity-70 px-3 py-1 text-center text-sm font-semibold text-gray-700 txt-min">
          {title}
        </div>
      )}
    </div>
  );
}
