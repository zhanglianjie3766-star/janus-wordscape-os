# Security Policy

## Supported Versions

The current public preview line is:

```text
v0.1.x-alpha
```

Only the latest alpha release is expected to receive fixes.

## Data Safety

This is a local-first PWA. The primary risk is local data loss caused by:

```text
clearing browser storage
browser profile reset
device replacement
importing malformed or untrusted card packages
losing exported backup files
```

Users should export backups before major imports, browser cleanup, or device
migration.

## Reporting Issues

For public GitHub usage, report problems through GitHub Issues.

Do not post private learning backups, personal card packages, tokens, API keys,
or screenshots containing sensitive data in public issues.

## Import Safety

Only import card packages from trusted sources. A standard package is JSON data,
but it may contain external source URLs or audio URLs. Review unknown packages
before importing.
