import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // pdfkit and exceljs read data files (font metrics, etc.) from disk at
  // runtime, which breaks if the bundler inlines them. Keep them external and
  // make sure their assets are traced into the serverless function.
  serverExternalPackages: ['pdfkit', 'exceljs'],
  outputFileTracingIncludes: {
    '/api/feedback/export/pdf': ['./node_modules/pdfkit/js/data/**'],
  },
};

export default nextConfig;
