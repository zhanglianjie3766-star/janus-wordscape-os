import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = packageJson.version;
const releaseRoot = path.join(root, 'releases');
const releaseDir = path.join(releaseRoot, `janus-wordscape-os-v${version}`);
const distDir = path.join(root, 'dist');

if (!fs.existsSync(distDir)) {
  throw new Error('dist does not exist. Run pnpm run build before packaging.');
}

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

function copyIfExists(sourceRelative, targetRelative = sourceRelative) {
  const source = path.join(root, sourceRelative);
  const target = path.join(releaseDir, targetRelative);

  if (!fs.existsSync(source)) {
    return;
  }

  copyRecursive(source, target);
}

function copyRecursive(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });

    for (const item of fs.readdirSync(source)) {
      copyRecursive(path.join(source, item), path.join(target, item));
    }

    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

copyIfExists('dist');
copyIfExists('README.md');
copyIfExists('LICENSE');
copyIfExists('NOTICE');
copyIfExists('PRIVACY.md');
copyIfExists('SECURITY.md');
copyIfExists('CHANGELOG.md');
copyIfExists('ROADMAP.md');
copyIfExists('PROJECT_STATE.md');
copyIfExists('docs');
copyIfExists('schemas');
copyIfExists('examples');
copyIfExists('data/card-production', 'data/card-production');

const manifest = {
  name: packageJson.name,
  version,
  built_at: new Date().toISOString(),
  runtime: 'local-static-web-app',
  entry: 'dist/index.html',
  includes: [
    'dist',
    'README.md',
    'LICENSE',
    'NOTICE',
    'PRIVACY.md',
    'SECURITY.md',
    'CHANGELOG.md',
    'ROADMAP.md',
    'PROJECT_STATE.md',
    'docs',
    'schemas',
    'examples',
    'data/card-production'
  ],
  notes: [
    'Open dist/index.html through a static server for service-worker/PWA testing.',
    'The app uses IndexedDB as the primary local data store and localStorage as a small bootstrap/shadow layer.',
    'Use Settings -> Export learning data before moving devices or clearing browser storage.'
  ]
};

fs.writeFileSync(path.join(releaseDir, 'release-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

fs.writeFileSync(
  path.join(releaseDir, 'START_HERE.md'),
  `# 雅努斯词境 OS · 技术英语词汇网络 v${version}\n\nThis package contains the static Janus Wordscape OS PWA runtime.\n\nHistorical development codename: TechLex OS.\n\n## Run Locally\n\nFrom the project root:\n\n\`\`\`text\ncorepack pnpm run serve:dist\n\`\`\`\n\nThen open:\n\n\`\`\`text\nhttp://127.0.0.1:4173\n\`\`\`\n\n## First Use\n\n1. Open Settings -> Cards And Backup.\n2. Import a standard JSON card package.\n3. Start from Notebook -> second-level scene folder.\n4. Export a backup before clearing browser storage or changing devices.\n\n## Data Safety\n\nThis alpha release stores learning data in browser IndexedDB, with localStorage used only as a bootstrap/shadow layer. Before switching browser, clearing site data, or moving machines, export a backup from Settings.\n\n## Restore\n\nUse Settings -> Restore backup and choose a Janus Wordscape OS JSON backup file.\n`,
  'utf8'
);

console.log(`release_dir=${releaseDir}`);
