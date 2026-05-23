import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requestedCards = Math.max(1, Number(process.env.CARD_COUNT || 300));
const outputDir = path.join(root, 'data', 'test-fixtures');
const outputPath = path.join(outputDir, `large-card-package-${requestedCards}.json`);

const packs = [
  {
    domain_pack_id: 'ai-programming-english',
    name: 'AI Programming English',
    source_id: 'cursor-official',
    source_name: 'Cursor Official Website',
    source_url: 'https://cursor.com/cn',
    scenes: ['ide_editor', 'ai_code_assistant', 'agentic_coding', 'debugging'],
    terms: ['extension', 'agent', 'prompt', 'inline', 'completion', 'suggestion', 'permission', 'workspace', 'context', 'terminal']
  },
  {
    domain_pack_id: 'web3-developer-english',
    name: 'Web3 Developer English',
    source_id: 'ethereum-developer-docs',
    source_name: 'Ethereum Developer Docs',
    source_url: 'https://ethereum.org/en/developers/docs/',
    scenes: ['wallet', 'smart_contract', 'defi', 'rpc'],
    terms: ['wallet', 'contract', 'transaction', 'address', 'gas', 'signature', 'token', 'liquidity', 'oracle', 'block']
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    name: 'Programming Language & Runtime English',
    source_id: 'nodejs-docs',
    source_name: 'Node.js Docs',
    source_url: 'https://nodejs.org/en/docs',
    scenes: ['node_runtime', 'typescript_javascript', 'shell', 'build_tools'],
    terms: ['runtime', 'syntax', 'module', 'dependency', 'package', 'script', 'process', 'environment', 'compile', 'bundle']
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    name: 'AI Platform & Model Tools English',
    source_id: 'openai-platform-docs',
    source_name: 'OpenAI Platform Docs',
    source_url: 'https://platform.openai.com/docs',
    scenes: ['model_api', 'tokens', 'context_window', 'api_keys'],
    terms: ['model', 'token', 'context', 'endpoint', 'request', 'response', 'quota', 'billing', 'apikey', 'latency']
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    name: 'Developer Cloud & Collaboration Tools English',
    source_id: 'github-docs',
    source_name: 'GitHub Docs',
    source_url: 'https://docs.github.com/',
    scenes: ['github', 'cloud', 'permissions', 'collaboration'],
    terms: ['repository', 'branch', 'commit', 'pullrequest', 'workflow', 'secret', 'permission', 'artifact', 'issue', 'review']
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    name: 'Product Design & Creative Tools English',
    source_id: 'figma-help',
    source_name: 'Figma Help Center',
    source_url: 'https://help.figma.com/',
    scenes: ['figma', 'prototype', 'canvas', 'creative_workflow'],
    terms: ['frame', 'component', 'variant', 'prototype', 'canvas', 'layer', 'asset', 'template', 'presentation', 'generation']
  }
];

const suffixes = ['setup', 'console', 'docs', 'error', 'workflow'];
const frequencyTiers = ['F1', 'F1', 'F2', 'F2', 'F3', 'F4'];

function termFor(pack, index) {
  const base = pack.terms[index % pack.terms.length];
  const round = Math.floor(index / pack.terms.length);
  const suffix = suffixes[round % suffixes.length];
  return index < pack.terms.length ? base : `${base}-${suffix}-${round}`;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeCard(pack, index) {
  const headword = termFor(pack, index);
  const scene = pack.scenes[index % pack.scenes.length];
  const cardNumber = String(index + 1).padStart(3, '0');

  return {
    card_id: `${pack.domain_pack_id}-${slug(headword)}-${cardNumber}`,
    headword,
    definition_zh: `${headword} 在 ${pack.name} 场景中表示一个需要能读懂并能操作的技术术语。`,
    definition_en: `A real-use technical term used in ${pack.name} workflows.`,
    part_of_speech: 'noun',
    examples: [
      {
        example_en: `Open the official ${pack.name} page and identify where "${headword}" appears in the workflow.`,
        example_zh: `打开 ${pack.name} 的官方页面，找出 "${headword}" 在工作流中出现的位置。`,
        context: 'official source reading'
      },
      {
        example_en: `Use "${headword}" correctly when explaining the next step in the developer task.`,
        example_zh: `在解释下一步开发任务时，正确使用 "${headword}" 这个词。`,
        context: 'real developer task'
      }
    ],
    source: {
      source_id: pack.source_id,
      source_name: pack.source_name,
      source_url: pack.source_url,
      source_type: 'official_docs',
      source_priority: index < 20 ? 'P0' : 'P1'
    },
    domain_pack_id: pack.domain_pack_id,
    scene_tags: [scene, pack.scenes[(index + 1) % pack.scenes.length]],
    frequency_tier: frequencyTiers[index % frequencyTiers.length],
    usage_tasks: [`Use ${headword} while reading official docs or operating a real tool.`],
    synonyms: [`${headword}-related`],
    confusing_words: [`${headword}-similar`],
    word_family: [headword.split('-')[0], `${headword.split('-')[0]}s`],
    notes: 'Generated by Phase 7B large-package fixture. Content is for real-use hardening, not final learning editorial quality.'
  };
}

const cardsPerPack = Math.ceil(requestedCards / packs.length);
const cards = packs.flatMap((pack) => Array.from({ length: cardsPerPack }, (_, index) => makeCard(pack, index))).slice(0, requestedCards);

const pkg = {
  package_id: `techlex-os-large-package-${requestedCards}`,
  package_version: '0.7.0',
  generated_by: 'phase7b-large-package-generator',
  generated_at: new Date().toISOString(),
  default_language: 'zh-CN',
  domain_packs: packs.map((pack) => ({
    domain_pack_id: pack.domain_pack_id,
    name: pack.name,
    description: `Phase 7B large-package validation pack for ${pack.name}.`,
    scenes: pack.scenes
  })),
  cards
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
console.log(`large_package=${outputPath}`);
console.log(`cards=${cards.length}`);
