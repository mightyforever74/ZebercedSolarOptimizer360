export const metadata = {
  title: "SolarOptimizer360",
  description: "SolarOptimizer360 frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial" }}>
        {children}
      </body>
    </html>
  );
}
