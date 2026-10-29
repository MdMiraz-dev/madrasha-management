'use client';

import React from 'react';

interface OfficialWatermarkProps {
  instituteName?: string;
  size?: number | string;
  className?: string;
  opacity?: string;
  showText?: boolean;
}

/**
 * Premium Official Seal Watermark for Madrasa Documents
 * (ID Cards, Money Receipts, Marksheets, Testimonials)
 */
export default function OfficialWatermark({
  instituteName = 'জামিয়া আরাবিয়া ইমদাদুল উলুম ফরিদাবাদ',
  size = 220,
  className = '',
  opacity = 'opacity-[0.06] print:opacity-[0.09]',
  showText = true,
}: OfficialWatermarkProps) {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div 
        className={`relative flex items-center justify-center transition-all ${opacity}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full text-emerald-900 dark:text-emerald-300"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Decorative Gear / Scallop Circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="6 4"
          />
          {/* Outer Solid Ring */}
          <circle
            cx="150"
            cy="150"
            r="132"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          {/* Inner Ring */}
          <circle
            cx="150"
            cy="150"
            r="94"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Innermost Ring */}
          <circle
            cx="150"
            cy="150"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Decorative Stars */}
          <g transform="translate(150, 26) scale(0.7)">
            <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" />
          </g>
          <g transform="translate(42, 150) scale(0.6)">
            <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" />
          </g>
          <g transform="translate(258, 150) scale(0.6)">
            <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" />
          </g>
          <g transform="translate(150, 274) scale(0.7)">
            <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" />
          </g>

          {/* Circular Text Path */}
          <defs>
            <path
              id="watermark-top-curve"
              d="M 35, 150 A 115, 115 0 0, 1 265, 150"
              fill="none"
            />
            <path
              id="watermark-bottom-curve"
              d="M 265, 150 A 115, 115 0 0, 1 35, 150"
              fill="none"
            />
          </defs>

          {showText && (
            <>
              <text
                fontSize="11.5"
                fontWeight="bold"
                letterSpacing="1"
                fill="currentColor"
                textAnchor="middle"
              >
                <textPath href="#watermark-top-curve" startOffset="50%">
                  {instituteName}
                </textPath>
              </text>

              <text
                fontSize="10"
                fontWeight="bold"
                letterSpacing="2"
                fill="currentColor"
                textAnchor="middle"
              >
                <textPath href="#watermark-bottom-curve" startOffset="50%">
                  ★ অফিশিয়াল সিলমোহর • OFFICIAL SEAL ★
                </textPath>
              </text>
            </>
          )}

          {/* Center Islamic Emblem: Open Quran on Rehal with Crescent & Minaret */}
          <g transform="translate(150, 150)">
            {/* Crescent Moon */}
            <path
              d="M 0 -58 A 20 20 0 0 1 -18 -32 A 16 16 0 0 0 -5 -54 Z"
              fill="currentColor"
            />
            {/* Small Star */}
            <polygon
              points="-9,-44 -7.5,-40.5 -4,-40.5 -6.5,-38.5 -5.5,-35 -8.5,-37 -11.5,-35 -10.5,-38.5 -13,-40.5 -9.5,-40.5"
              fill="currentColor"
            />

            {/* Dome Silhouette */}
            <path
              d="M -30 -10 C -30 -35 0 -45 0 -45 C 0 -45 30 -35 30 -10 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />

            {/* Open Book (Quran) */}
            <path
              d="M 0 -8 C -15 -18 -38 -15 -42 -2 C -42 12 -20 18 0 8 C 20 18 42 12 42 -2 C 38 -15 15 -18 0 -8 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Book Spine Center Line */}
            <line x1="0" y1="-8" x2="0" y2="8" stroke="currentColor" strokeWidth="2.5" />

            {/* Book Pages Lines */}
            <path d="M -35 0 C -25 -8 -10 -4 0 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 35 0 C 25 -8 10 -4 0 0" fill="none" stroke="currentColor" strokeWidth="1.5" />

            {/* Rehal (Book Stand) Cross */}
            <path
              d="M -26 12 L 26 40 M 26 12 L -26 40"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M -32 40 L 32 40"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Arabic Calligraphy / Quran Word 'ইকরা / اقرأ' stylization */}
            <text
              y="-18"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
              fill="currentColor"
              className="font-arabic"
            >
              اقْرَأْ
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
