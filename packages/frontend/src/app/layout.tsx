import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "@/styles/globals.css";
import ClientProviders from "@/components/providers/ClientProviders";

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
      <head>
        {/* Protect native Array/Object methods from SES lockdown injected by Sui Wallet browser extension */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var A=Array.prototype,O=Object;var r=A.reduce,f=A.filter,m=A.map,fe=A.forEach,s=A.slice,sp=A.splice,c=A.concat,fi=A.find,fI=A.findIndex,i=A.includes,e=A.every,so=A.some,fl=A.flat,fm=A.flatMap,j=A.join,k=O.keys,v=O.values,en=O.entries,a=O.assign,fr=O.freeze,dp=O.defineProperty;function g(o,n,fn){if(!fn)return;try{O.defineProperty(o,n,{value:fn,writable:true,configurable:true,enumerable:false})}catch(e){}}g(A,'reduce',r);g(A,'filter',f);g(A,'map',m);g(A,'forEach',fe);g(A,'slice',s);g(A,'splice',sp);g(A,'concat',c);g(A,'find',fi);g(A,'findIndex',fI);g(A,'includes',i);g(A,'every',e);g(A,'some',so);g(A,'flat',fl);g(A,'flatMap',fm);g(A,'join',j);if(k)O.keys=k;if(v)O.values=v;if(en)O.entries=en;if(a)O.assign=a;var _DP=O.defineProperty;O.defineProperty=function(obj,prop,desc){try{return _DP(obj,prop,desc)}catch(e){return obj}};var _F=O.freeze;O.freeze=function(obj){try{return _F(obj)}catch(e){return obj}};})();`,
          }}
        />
      </head>
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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
