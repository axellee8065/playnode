# PlayNode — Brand Identity System v2.0

---

## Brand Overview

| Element | Value |
|---------|-------|
| Name | PlayNode |
| Tagline | Play. Share. Earn. |
| Korean Tagline | 공략이 수익이 되는 곳. |
| Extended Tagline | Your guides. Your reviews. Your revenue. |
| Positioning | Game Creator Economy Platform on Sui |
| Chain | Sui (invisible to users in UI) |
| Currency | USDC (visible) / SUI gas (invisible, sponsored) |
| UI Language Rule | Never use "blockchain/token/on-chain/Web3" in user-facing UI. Gamer language only. |

---

## Logo

### Concept

Hexagonal node frame + Play triangle. The hexagon represents a network node (blockchain node + creator hub). The play button represents gaming.

### Logo SVG

```svg
<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer hex (faint) -->
  <path d="M60 8L108 32V78L60 112L12 78V32L60 8Z" stroke="#00FF88" stroke-width="2" fill="none" opacity="0.25"/>
  <!-- Inner hex (stronger) -->
  <path d="M60 18L98 38V72L60 102L22 72V38L60 18Z" stroke="#00FF88" stroke-width="2.5" fill="none" opacity="0.5"/>
  <!-- Play triangle -->
  <path d="M48 40L48 80L82 60L48 40Z" fill="#00FF88"/>
  <!-- Corner nodes -->
  <circle cx="60" cy="8" r="4" fill="#00FF88"/>
  <circle cx="108" cy="32" r="3" fill="#00FF88" opacity="0.5"/>
  <circle cx="108" cy="78" r="3" fill="#00FF88" opacity="0.5"/>
  <circle cx="60" cy="112" r="4" fill="#00FF88"/>
  <circle cx="12" cy="78" r="3" fill="#00FF88" opacity="0.5"/>
  <circle cx="12" cy="32" r="3" fill="#00FF88" opacity="0.5"/>
</svg>
```

### Wordmark

- Font: Outfit, weight 900
- "Play" in white (#F5F5F7), "Node" in Node Green (#00FF88)
- Letter spacing: -2px to -3px
- Always one word: "PlayNode" (not "Play Node")

### Logo Variations

| Variant | Background | "Play" Color | "Node" Color | Use Case |
|---------|-----------|-------------|-------------|----------|
| On Dark | #0A0A0B | #F5F5F7 | #00FF88 | Default (dark UI) |
| On Light | #F0F0F2 | #0A0A0B | #009E55 | Light backgrounds, print |
| On Brand | #00FF88 | #0A0A0B | #0A0A0B | Marketing, merch |
| Mono | #17171C | #F5F5F7 | #F5F5F7 | Monochrome contexts |

### Favicon / App Icon

- Hexagon + play triangle only (no wordmark)
- 32×32, 192×192, 512×512
- Node Green fill on Dark background

---

## Color System

### Core Palette

```css
:root {
  /* Backgrounds */
  --pn-black: #0A0A0B;           /* Page background */
  --pn-dark: #111113;            /* Secondary background */
  --pn-surface: #17171C;         /* Cards, panels */
  --pn-surface-2: #1F1F26;       /* Elevated surface */
  --pn-surface-3: #27272F;       /* Hover states */

  /* Borders */
  --pn-border: #2A2A32;          /* Default border */
  --pn-border-light: #35353F;    /* Subtle border */

  /* Text */
  --pn-muted: #6B6B7B;           /* Secondary text, labels */
  --pn-text: #CDCDD6;            /* Body text */
  --pn-text-bright: #E8E8EE;     /* Emphasized text */
  --pn-white: #F5F5F7;           /* Headings, primary text */

  /* Brand Colors */
  --pn-green: #00FF88;           /* Primary CTA, revenue, USDC amounts */
  --pn-green-dim: #00CC6A;       /* Green secondary */
  --pn-green-dark: #00994F;      /* Green tertiary */
  --pn-green-glow: rgba(0,255,136,0.12);  /* Green background glow */

  --pn-cyan: #00D4FF;            /* Reviews, info, view counts */
  --pn-purple: #8B5CF6;          /* Pixel Grid, premium content */
  --pn-amber: #FFB800;           /* Shop, quests, commissions */
  --pn-red: #FF4757;             /* Community, ping, alerts */
  --pn-blue: #3B82F6;            /* Rank, verification badges */
}
```

### Semantic Color Mapping

| Color | Variable | Semantic Use |
|-------|----------|-------------|
| Node Green | --pn-green | Primary CTA, revenue display, USDC amounts, earning indicators, Drop badges |
| Cyan | --pn-cyan | Review badges, info indicators, view counts, links |
| Amber | --pn-amber | Shop elements, Quest badges, commission displays, warnings |
| Purple | --pn-purple | Pixel Grid, premium content badges, special features |
| Red | --pn-red | Ping/tip buttons, Link (subscription), alerts, Community features |
| Blue | --pn-blue | Rank badges, verification indicators, trust signals |

### Feature-to-Color Mapping

| Feature | Primary Color | Badge Background |
|---------|--------------|-----------------|
| Drops | Green (#00FF88) | rgba(0,255,136,0.10) |
| Reviews | Cyan (#00D4FF) | rgba(0,212,255,0.10) |
| Shop | Amber (#FFB800) | rgba(255,184,0,0.10) |
| Pixel Grid | Purple (#8B5CF6) | rgba(139,92,246,0.10) |
| Community | Red (#FF4757) | rgba(255,71,87,0.10) |
| Rank/Verify | Blue (#3B82F6) | rgba(59,130,246,0.10) |

---

## Typography

### Font Stack

```css
--font-primary: 'Outfit', 'Noto Sans KR', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--font-kr: 'Noto Sans KR', sans-serif;
```

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```

### Type Scale

| Level | Font | Weight | Size | Tracking | Use |
|-------|------|--------|------|----------|-----|
| Display | Outfit | 900 | 48~80px | -2px | Hero text, page titles |
| H1 | Outfit | 800 | 36~44px | -1.5px | Section titles |
| H2 | Outfit | 700 | 28~32px | -0.5px | Subsection titles |
| H3 | Outfit | 600 | 20~24px | 0 | Card titles |
| Body | Outfit | 400 | 15~16px | 0 | Paragraph text |
| Small | Outfit | 400 | 12~13px | 0 | Metadata, captions |
| Mono Data | JetBrains Mono | 600~700 | 14~26px | 0 | USDC amounts, stats, prices |
| Mono Label | JetBrains Mono | 500 | 9~11px | 2~4px | Section labels, badges, uppercase |
| Korean Body | Noto Sans KR | 400~500 | 15~16px | 0 | Korean text |
| Korean Heading | Noto Sans KR | 700~900 | 20~30px | -0.5px | Korean titles |

### USDC Display Convention

```
Always use JetBrains Mono for monetary values:
  $4,280.00 USDC   (font-weight: 700, color: --pn-green)
  +23%              (font-weight: 500, color: --pn-green-dim)
  $0.00             (font-weight: 500, color: --pn-muted)
```

---

## Spacing & Layout

### Radius

```css
--radius-sm: 8px;     /* Buttons, badges, inputs */
--radius-md: 12px;    /* Cards, panels */
--radius-lg: 16px;    /* Major containers, modals */
--radius-xl: 20px;    /* App container, hero elements */
--radius-full: 9999px; /* Pills, avatars */
```

### Grid

- Max content width: 1240px
- Page padding: 40px (desktop), 20px (mobile)
- Card gap: 12~16px
- Section padding: 80~100px vertical

---

## Component Patterns

### Badges

```
Feature badges (category indicators):
  font: JetBrains Mono, 9px, uppercase, letter-spacing 1px
  padding: 3px 7px
  border-radius: 4px
  background: feature color at 10% opacity
  color: feature color

Examples:
  DROP   → bg: rgba(0,255,136,0.1), color: #00FF88
  REVIEW → bg: rgba(0,212,255,0.1), color: #00D4FF
  SHOP   → bg: rgba(255,184,0,0.1), color: #FFB800
```

### Revenue Display

```
Earning card:
  background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.04))
  border: 1px solid rgba(0,255,136,0.15)
  border-radius: 12px

Value: JetBrains Mono, 24~26px, weight 700, --pn-green
Label: 10px, uppercase, letter-spacing 1px, --pn-muted
Sub: 10~11px, --pn-green-dim
```

### Pixel Grid Visual

```
Grid container:
  display: grid
  grid-template-columns: repeat(20, 1fr)  (or 16 for compact)
  gap: 2px

Individual pixel:
  aspect-ratio: 1
  border-radius: 2px
  background: --pn-surface-2 (empty)
  Sold pixels: various colors per advertiser (#1a4a8a, #8a3a1a, #1a6a3a, etc.)
```

### Cards

```
Standard card:
  background: --pn-surface
  border: 1px solid --pn-border
  border-radius: 12px
  padding: 16~20px

Hover: border-color: --pn-border-light
Active/Selected: border-color: --pn-green (subtle)
```

### Buttons

```
Primary:
  background: --pn-green
  color: --pn-black
  font-weight: 700
  border-radius: 8px
  padding: 8px 18px

Secondary:
  background: --pn-surface-2
  border: 1px solid --pn-border
  color: --pn-text
  
Ghost:
  background: transparent
  color: --pn-muted
  hover: color: --pn-white
```

---

## World Language (Terminology)

All user-facing terms avoid blockchain jargon. Gaming-native vocabulary only.

| Term | Korean | Color Code | Definition | UI Context |
|------|--------|-----------|------------|-----------|
| Node | 노드 | Green | Creator's personal page/hub | Profile, navigation |
| Drop | 드롭 | Green | Guide/walkthrough publication | Content creation, listings |
| Review | 리뷰 | Cyan | Verified game review | Content creation, listings |
| Shop | 숍 | Amber | Game recommendation commerce | Store, affiliate links |
| Grid | 그리드 | Purple | Pixel ad board | Advertising, revenue |
| Wire | 와이어 | Green | USDC revenue transfer to wallet | Earnings, dashboard |
| Ping | 핑 | Red | One-time tip/donation | Support buttons |
| Link | 링크 | Red | Monthly subscription to a creator | Subscription UI |
| Quest | 퀘스트 | Amber | Bounty/commission from publisher | Quest board |
| Rank | 랭크 | Blue | Creator tier (Bronze~Master) | Profile, badges |
| Verify | 검증 | Blue | Playtime proof via game API | Review badges |
| Stamp | 스탬프 | Green | On-chain authorship timestamp | Content metadata |

### UI Copy Examples

```
DO:
  "새 Drop 발행하기"
  "이번 달 Wire: $4,280"
  "Ping 보내기 ☕"
  "842시간 Verified 리뷰"
  "Diamond Rank 크리에이터"

DON'T:
  "온체인에 공략 민팅"
  "블록체인 기반 수익 정산"
  "NFT 가이드 발행"
  "토큰으로 보상 받기"
  "스마트 컨트랙트 에스크로"
```

---

## Taglines

| Type | Text |
|------|------|
| Primary | Play. Share. Earn. |
| Extended | Your guides. Your reviews. Your revenue. |
| Korean | 공략이 수익이 되는 곳. |
| Creator-focused | Write once. Earn forever. |
| Gamer-focused | The best players don't just play. They earn. |
| Technical | USDC-native. Sui-powered. Zero tokens required. |

---

## Tone of Voice

### Principles

1. **Gamer-native:** Talk like a gamer, not a blockchain developer.
2. **Direct:** No fluff. Say what it is.
3. **Confident:** We know this works. No hedging.
4. **Empowering:** "You" earn, "you" own, "your" revenue.

### Examples

```
Good: "내 공략, 내 수익. 지금 바로."
Bad:  "블록체인 기술을 활용한 탈중앙화 게임 가이드 플랫폼입니다."

Good: "$5 공략 팔았다. 즉시 $4가 내 지갑에."
Bad:  "크리에이터 토큰 이코노미를 통한 수익 분배 메커니즘."

Good: "842시간 플레이한 사람의 리뷰."
Bad:  "온체인 검증된 플레이타임 오라클 시스템."
```

---

## Dark Theme Only

PlayNode는 dark theme만 사용한다. 게이머 문화(Discord, Steam, Twitch)와 일관성.

```
Light mode: NOT supported
Background: #0A0A0B (Deep Black)
All UI built on dark surface palette
```

---

## Animations

### Page Load

- Staggered fade-up reveal (animation-delay per element)
- Content sections: 0ms, 50ms, 100ms, 150ms...
- Duration: 400ms, ease-out

### Hover States

- Cards: border-color transition (150ms)
- Buttons: background brightness shift (150ms)
- Grid pixels: slight scale(1.1) on hover (100ms)

### Revenue Updates

- USDC amount counter animation (count-up)
- Green glow pulse on new Wire received
- Revenue bar chart smooth width transition

### Pixel Grid

- Sold pixel: fade-in with slight scale
- Auction countdown: pulsing border
- Purchase success: ripple effect from purchased block

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm: tablets */ }
@media (min-width: 768px)  { /* md: small laptops */ }
@media (min-width: 1024px) { /* lg: desktop */ }
@media (min-width: 1280px) { /* xl: wide desktop */ }
```

### Layout Shifts

| Breakpoint | App Layout |
|-----------|-----------|
| < 768px | Single column, bottom nav, collapsible sidebar |
| 768~1024px | 2 columns (sidebar + main) |
| > 1024px | 3 columns (sidebar + main + right panel) |

---

**PlayNode Brand Identity v2.0 — April 2026**
