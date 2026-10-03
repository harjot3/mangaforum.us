# Catalog sources

The main catalog is synchronized from [AniList](https://anilist.co/) using its [GraphQL API](https://docs.anilist.co/). `npm run catalog:sync` fetches every page of non-adult Japanese manga marked `RELEASING`, with no popularity cutoff. Coverage depends on AniList’s indexing and status accuracy; this does not claim to include every manga published worldwide. Previously imported titles remain available when completed or on hiatus.

Popularity is AniList’s reader-list count, not a MangaForum discussion count or a claim about recent chapter activity. The homepage shows the top 24 ongoing series; discovery paginates the whole catalog and supports popularity or alphabetical sorting. Source IDs and metadata links are stored for each title. `frontend/data/catalog-sync.json` records snapshot time and coverage.

## Refreshing

Run `npm run catalog:sync` from the repository root. Node 22 and outbound HTTPS access to `graphql.anilist.co` are required; no API key is needed. Requests are spaced below the provider’s degraded 30/minute limit, retry transient failures, and honor `Retry-After`. Stable ID ordering and exclusion batches traverse beyond the 5,000-entry offset limit. Provider limits or incomplete responses fail the refresh rather than publish a truncated catalog.

The importer fetches and validates the full run before replacing the frontend JSON and the backend repeatable Flyway migration. Existing titles missing from the ongoing feed are re-fetched to update finished/hiatus status. Existing slugs, IDs, publisher links, curated synopses, follows, and chapter relationships are preserved. The backend upserts by slug without deleting series. The frontend and backend IDs need not match; links use stable slugs.

`.github/workflows/catalog-sync.yml` schedules a daily refresh and supports manual dispatch. Once pushed to the default branch, it commits complete snapshots using the workflow token (requires repository Actions write permissions and a branch policy allowing the bot). Rebuild/redeploy the frontend and restart the updated backend to serve a new snapshot; this workflow does not deploy services. For local development, Next.js reloads the changed JSON; restart Spring Boot to run the updated repeatable migration. A provider outage leaves the previous snapshot in place, including when the site runs without a backend.

New series use factual descriptions assembled from title/genre metadata rather than copied synopses. Cover thumbnails are served from AniList’s image CDN; images belong to their respective rights holders. The eight original titles retain their locally served publisher covers and original short summaries.

## Original curated entries

| Series | Publisher source | Local cover |
| --- | --- | --- |
| Blue Period | [Kodansha](https://kodansha.us/series/blue-period/) | `blue-period.webp` |
| Chainsaw Man | [VIZ](https://www.viz.com/chainsaw-man) | `chainsaw-man.jpg` |
| Dandadan | [VIZ](https://www.viz.com/dandadan) | `dandadan.jpg` |
| Death Note | [VIZ](https://www.viz.com/death-note) | `death-note.jpg` |
| Fullmetal Alchemist | [VIZ](https://www.viz.com/fullmetal-alchemist) | `fullmetal-alchemist.jpg` |
| Naruto | [VIZ](https://www.viz.com/naruto) | `naruto.jpg` |
| One Piece | [VIZ](https://www.viz.com/one-piece) | `one-piece.jpg` |
| Witch Hat Atelier | [Kodansha](https://kodansha.us/series/witch-hat-atelier/) | `witch-hat-atelier.webp` |

Cover images identify the series; editions may differ. Artwork belongs to the respective creators and publishers. Files are stored under `frontend/public/covers` and served locally without runtime format conversion. VIZ images are book covers; Kodansha images are series illustrations. These are not generated artwork.

## Original image URLs

- Blue Period: https://production.image.azuki.co/182be2f3-e93f-4ffa-a83b-a0051aed7387/800_7-8.webp
- Chainsaw Man: https://dw9to29mmj727.cloudfront.net/products/1974709930.jpg
- Dandadan: https://dw9to29mmj727.cloudfront.net/products/1974734633.jpg
- Death Note: https://dw9to29mmj727.cloudfront.net/products/1421501686.jpg
- Fullmetal Alchemist: https://dw9to29mmj727.cloudfront.net/products/1421540185.jpg
- Naruto: https://dw9to29mmj727.cloudfront.net/products/1569319006.jpg
- One Piece: https://dw9to29mmj727.cloudfront.net/products/1569319014.jpg
- Witch Hat Atelier: https://production.image.azuki.co/407d5152-4ca0-48d0-8c18-2e74a5af72c7/800_7-8.webp

## Chapter records

No verified chapter feed is connected. The historical V2 seed assigned identical artificial dates to chapters 1–12 for every title. V3 removes only those exact fixture records, preserving unrelated or subsequently edited chapters. Chapter pages remain usable and direct readers to the publisher until verified records are imported.
