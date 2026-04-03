import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PlayNode — Play. Share. Earn.",
  description:
    "게임 공략이 수익이 되는 곳. PlayNode는 Sui 블록체인 기반의 Game Creator Economy Platform입니다. 공략을 작성하고, 리뷰하고, 거래하세요.",
  keywords: [
    "PlayNode",
    "Sui",
    "blockchain",
    "gaming",
    "creator economy",
    "게임 공략",
    "NFT",
  ],
  openGraph: {
    title: "PlayNode — Play. Share. Earn.",
    description: "게임 공략이 수익이 되는 곳. Game Creator Economy Platform on Sui.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`dark ${outfit.variable} ${jetbrainsMono.variable} ${notoSansKR.variable}`}
    >
      <body className="relative min-h-screen overflow-x-hidden">
        {/* Noise overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        {children}
      </body>
    </html>
  );
}
