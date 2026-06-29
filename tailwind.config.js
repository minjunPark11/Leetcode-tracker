/** @type {import('tailwindcss').Config} */

// ── 디자인 토큰 ──────────────────────────────────────────────
// 색상·라운드·그림자·간격을 여기서 한 번만 정의하고, 모든 페이지/
// 컴포넌트는 이 토큰(과 index.css 의 .card/.btn/.input 등 토큰 클래스)만
// 사용해 일관성을 유지한다.

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 브랜드(보라) 액센트 스케일
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // 의미 색상 (난이도)
        difficulty: {
          easy: '#10b981',
          medium: '#f59e0b',
          hard: '#f43f5e',
        },
      },
      borderRadius: {
        control: '0.75rem', // 입력 요소·버튼·작은 항목
        card: '1rem', // 카드
        panel: '1.5rem', // 큰 패널(사이드바 등)
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(99, 102, 241, 0.20)',
        'card-hover': '0 20px 44px -16px rgba(124, 58, 237, 0.32)',
        control: '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
      },
      // 페이지 섹션 간 일관 간격 토큰
      spacing: {
        gutter: '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        float: 'float 8s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
