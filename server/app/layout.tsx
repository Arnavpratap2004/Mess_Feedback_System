export const metadata = {
  title: 'Mess Feedback API',
  description: 'Backend API for the Mess Feedback System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
