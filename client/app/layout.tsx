
import AuthGuard from "@/components/auth/AuthGuard";
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
          <AuthGuard>
            <ReduxProvider>{children}</ReduxProvider>
          </AuthGuard>
        </body>
    </html>
  );
}