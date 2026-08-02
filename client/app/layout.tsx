
import "./globals.css";
import { ReduxProvider } from "./providers";
export const metadata = {
  title: "Metro Timetable Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}