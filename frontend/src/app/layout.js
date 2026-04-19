import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "TemplateHub — Discover & Share Professional Templates",
  description: "Explore thousands of beautifully crafted templates for reports, presentations, resumes, and more. Upload, rate, and download templates created by professionals.",
  keywords: "templates, documents, presentations, resumes, reports, download, professional",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev'}>
            <AuthProvider>
              <Navbar />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
