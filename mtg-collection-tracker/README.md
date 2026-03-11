# Shortfall

**Find missing cards across your MTG decks**

A privacy-focused web app to track your Magic: The Gathering collection and identify card conflicts across multiple decks. Upload your collection from Archidekt or Moxfield and instantly see which cards you need to proxy or purchase more copies of.

**Live App**: [deckflict.vercel.app](https://deckflict.vercel.app)

---

## Features

- **Upload Collection** — Import your card collection from Archidekt or Moxfield (CSV export)
- **Upload Decks** — Add multiple deck lists to compare (via URL or file upload)
- **Card Count Analysis** — See which cards appear in multiple decks
- **Shortage Detection** — Identify cards where you own fewer copies than needed
- **Cards Not Owned** — View all cards you need to acquire
- **Export Missing Cards** — Download a list for easy purchasing
- **Basic Lands Filter** — Toggle to include/exclude basic and snow-covered lands
- **Scryfall Links** — Look up any card instantly
- **100% Private** — All data stays in your browser, no server, no tracking

---

## Support

Please do not feel any need to send some money my way. If you would still like to help me buy singles then feel free to support me here: [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F21VGARY)

---

## Supported Formats

### Collection Import
- Archidekt CSV export
- Moxfield CSV export

### Deck List Import
- Archidekt deck URL (public decks)
- Moxfield deck URL (public decks)
- Archidekt CSV export
- Standard deck list format (`1 Card Name`)
- MTGO format (`1x Card Name`)
- Arena format (`1 Card Name (SET) 123`)

---

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm start
```

---

## How to Export from Archidekt or Moxfield

### Exporting Your Collection
1. Go to [archidekt.com](https://archidekt.com) or [moxfield.com](https://www.moxfield.com) and log in
2. Navigate to your Collection
3. Click the menu or export button
4. Select **Export as CSV**
5. Upload the downloaded file to Shortfall

### Exporting a Deck
1. Open your deck on Archidekt or Moxfield
2. Paste the deck URL into Shortfall, or click **Export** and upload the file

---

## Privacy

Shortfall is **100% client-side**. Your deck and collection data stay in your browser:

- No account or login required
- No data is sent to any server that you control or to any analytics/advertising service
- The app makes requests only to:
	- Archidekt's public API (or CSV exports) to load your own public deck data
	- Moxfield's public API to load your own public deck data
	- Scryfall's public API to look up card data and prices
- No cookies or tracking scripts
- Data is stored locally using your browser's `localStorage` and can be cleared at any time from within the app

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — React framework with App Router
- [TypeScript](https://typescriptlang.org) — Type safety
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [Vercel](https://vercel.com) — Deployment
- Browser localStorage — Data persistence

---

## Legal

- Shortfall is an independent fan project and is **not affiliated with, endorsed, or sponsored by** Wizards of the Coast, Archidekt, Moxfield, or Scryfall.
- **Magic: The Gathering** and all related marks and logos are trademarks of Wizards of the Coast LLC.
- If you use Scryfall data or images with this project, please follow their terms and attribution requirements (see [scryfall.com](https://scryfall.com)).

## License

This project is licensed under the MIT License — see the root `LICENSE` file for details.

## AI Usage

This is a human passion project, but it is still worth mentioning that I use the Github Copilot extension for VSCode when working on this. NO AI is used in the actual tool, just in making it. I strongly denounce the use of AI for anything artistic or when it is meant to replace peoples livelihoods. 