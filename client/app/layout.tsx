
import AuthGuard from "@/components/auth/AuthGuard";
import "./globals.css";
import { ReduxProvider } from "./providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Metro Timetable Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      
        <body className="bg-slate-100">
          <AuthGuard>
            <ReduxProvider>{children}</ReduxProvider>
          </AuthGuard>
        </body>
    </html>
  );
}