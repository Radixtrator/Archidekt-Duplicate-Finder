# MTG Collection Tracker

A web application to track your Magic: The Gathering card collection and identify card overlaps across multiple decks. Upload your collection from Archidekt and see which cards you need to proxy or purchase more copies of.

## Features

- **Upload Collection**: Import your card collection from Archidekt (CSV export)
- **Upload Decks**: Add multiple deck lists to compare
- **Overlap Analysis**: See which cards appear in multiple decks
- **Shortage Detection**: Identify cards where you own fewer copies than needed across all decks
- **Local Storage**: All data is stored in your browser - no account required

## Supported Formats

### Collection Import
- Archidekt CSV export

### Deck List Import
- Archidekt CSV export
- Standard deck list format (`1 Card Name`)
- MTGO format (`1x Card Name`)
- Arena format (`1 Card Name (SET) 123`)

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## How to Export from Archidekt

### Exporting Your Collection
1. Go to [archidekt.com](https://archidekt.com) and log in
2. Navigate to your Collection
3. Click the export/download button
4. Select CSV format
5. Upload the downloaded file to this app

### Exporting a Deck
1. Open your deck on Archidekt
2. Click the export button
3. Choose "Export to CSV" or copy the deck list as text
4. Upload or paste into this app

## Deploy on Vercel

The easiest way to deploy this app:

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy!

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- [Next.js 16](https://nextjs.org) - React framework
- [TypeScript](https://typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- Local Storage - Data persistence
