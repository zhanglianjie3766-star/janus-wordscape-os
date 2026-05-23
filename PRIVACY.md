# Privacy

雅努斯词境 OS is local-first.

## Local Learning Data

By default, the app stores learning data in the user's browser:

```text
Primary storage: IndexedDB
Bootstrap/shadow storage: localStorage
```

Stored data may include:

```text
imported word cards
learning plan
ReviewEvent history
UserMemoryState
backup metadata
user profile display name and avatar
```

The app does not require an account for the current local-first release.

## Network Requests

When hosted on GitHub Pages or another static host, the hosting provider may
record standard access logs.

Pronunciation playback may use:

```text
browser Web Speech APIs
public dictionary audio fallback URLs
card-provided audio_url or audio_asset_id fields
```

Do not import card packages that contain private or sensitive audio URLs unless
you understand where those URLs are hosted.

## Backups

Exported backups are local files controlled by the user. Anyone who obtains a
backup file may be able to inspect the user's card package and learning history.

Before clearing browser storage, switching browsers, or changing devices, export
a backup from Settings.

## Data Deletion

The current release stores data in the browser profile. Users can delete data by:

```text
using app settings where available;
clearing browser site data for the app origin;
starting in a fresh browser profile.
```

Clearing site data is destructive unless a backup has been exported.
