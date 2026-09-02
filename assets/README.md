# Subscription App — Full Asset Pack

Everything beyond the app icon/splash: in-app UI icons, category badges for
subscription services, onboarding illustrations, and an empty state. All in
your app's dark navy (`#0B1220`) + teal (`#2DD4BF`) palette.

```
subscription-assets/
├── icons/
│   ├── ui/                  17 icons, 64x64, transparent bg, teal strokes
│   │   home, insights, subscription, settings, add, calendar, bell,
│   │   card, search, check, close, edit, trash, chevron-right,
│   │   wallet, clock, user
│   └── categories/          8 badges, 128x128, colored circle + white glyph
│       streaming, music, cloud, gaming, fitness, reading, software, utilities
└── illustrations/
    ├── onboarding-track.png      900x900 — "track all your subscriptions"
    ├── onboarding-remind.png     900x900 — "get renewal reminders"
    ├── onboarding-insights.png   900x900 — "see spending insights"
    └── empty-state-no-subscriptions.png   700x700, transparent bg
```

## How to use

**UI icons** — drop `icons/ui/*.png` into `assets/icons/` (the folder already
in your project). Use directly as `<Image source={require('...')} />`, or since
they're flat teal linework, treat them as one-offs for anything the
`@expo/vector-icons` library doesn't cover.

**Category badges** — use these next to each subscription row instead of
pulling in real service logos (Spotify's, Netflix's, etc. are trademarked and
can't be reproduced) — e.g. tag Spotify/Apple Music as "Music", Netflix/Disney+
as "Streaming", Dropbox/iCloud as "Cloud". Map your own service list to these
8 categories, or ping me and I'll generate more.

**Onboarding illustrations** — one per onboarding slide. They're full 900x900
navy squares (not transparent) so they can be dropped straight in as a
full-bleed image behind your slide text.

**Empty state** — for the subscriptions list before the user adds anything.
Transparent background so it drops onto any card color.

## Note on service logos

I can't generate real brand marks (Spotify, Netflix, Disney+, etc.) since
those are trademarked — the category badges above are the safe substitute.
If you want, I can also build a small local icon-lookup map (`"Spotify" →
music badge + brand color`) so new subscriptions auto-assign a badge based on
name/category.
