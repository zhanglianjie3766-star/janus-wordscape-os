import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputTargets = [
  path.join(root, 'data', 'test-fixtures', 'scene-classification-demo-450.json'),
  path.join(root, 'public', 'scene-classification-demo-450.json')
];

const packs = [
  {
    domain_pack_id: 'ai-programming-english',
    name: 'AI Programming English',
    description: 'IDEs, AI coding assistants, agentic coding, Git, CLI, debugging, and technical documentation.',
    scenes: {
      ide_editor: ['extension', 'sidebar', 'workspace', 'command-palette', 'settings', 'panel', 'tab', 'cursor-selection', 'shortcut', 'toolbar'],
      ai_code_assistant: ['completion', 'suggestion', 'inline-chat', 'prompt', 'generate', 'accept', 'apply', 'diff', 'explanation', 'recommendation'],
      agentic_coding: ['agent', 'task', 'plan', 'permission', 'tool-call', 'instruction', 'context', 'checkpoint', 'approval', 'handoff'],
      git_version_control: ['commit', 'branch', 'merge', 'rebase', 'diff', 'pull-request', 'repository', 'checkout', 'conflict', 'tag'],
      cli_terminal: ['command', 'flag', 'argument', 'output', 'terminal', 'path', 'environment', 'stdin', 'stdout', 'exit-code'],
      debugging: ['breakpoint', 'stack-trace', 'exception', 'diagnostic', 'log', 'inspect', 'reproduce', 'patch', 'warning', 'trace'],
      technical_docs: ['overview', 'quickstart', 'reference', 'guide', 'changelog', 'prerequisite', 'tutorial', 'example', 'configuration', 'migration']
    },
    sceneLabels: {
      ide_editor: 'IDE 与编辑器界面',
      ai_code_assistant: 'AI 代码助手',
      agentic_coding: 'AI Agent 编程',
      git_version_control: 'Git 与版本控制',
      cli_terminal: '命令行操作',
      debugging: '调试与错误修复',
      technical_docs: '技术文档阅读'
    },
    source: {
      source_id: 'cursor-official',
      source_name: 'Cursor Official Website',
      source_url: 'https://cursor.com/cn',
      source_type: 'official_website',
      source_priority: 'P0'
    },
    toolContext: 'Cursor / VS Code / Claude Code'
  },
  {
    domain_pack_id: 'web3-developer-english',
    name: 'Web3 Developer English',
    description: 'Wallets, smart contracts, DeFi, RPC, block explorers, security, and on-chain development.',
    scenes: {
      wallet: ['wallet', 'address', 'account', 'seed-phrase', 'private-key', 'public-key', 'balance', 'signature', 'connect', 'network'],
      smart_contract: ['contract', 'function', 'modifier', 'event', 'ABI', 'bytecode', 'constructor', 'interface', 'mapping', 'storage'],
      defi: ['swap', 'liquidity', 'pool', 'yield', 'staking', 'collateral', 'slippage', 'protocol', 'vault', 'position'],
      rpc: ['endpoint', 'provider', 'node', 'request', 'response', 'chain-id', 'latency', 'payload', 'websocket', 'subscription'],
      block_explorer: ['block', 'hash', 'transaction', 'receipt', 'confirmation', 'timestamp', 'gas-fee', 'verify', 'explorer', 'status'],
      security: ['approval', 'revoke', 'phishing', 'audit', 'exploit', 'vulnerability', 'signature-scam', 'permission', 'risk', 'allowance'],
      on_chain_development: ['deploy', 'testnet', 'mainnet', 'faucet', 'gas', 'nonce', 'calldata', 'transaction-hash', 'migration', 'verification']
    },
    sceneLabels: {
      wallet: '钱包与账户',
      smart_contract: '智能合约',
      defi: 'DeFi 协议',
      rpc: 'RPC 与节点连接',
      block_explorer: '区块浏览器',
      security: 'Web3 安全',
      on_chain_development: '链上开发'
    },
    source: {
      source_id: 'ethereum-developer-docs',
      source_name: 'Ethereum Developer Docs',
      source_url: 'https://ethereum.org/en/developers/docs/',
      source_type: 'official_docs',
      source_priority: 'P1'
    },
    toolContext: 'Ethereum / MetaMask / Etherscan / Hardhat'
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    name: 'Programming Language & Runtime English',
    description: 'Python, TypeScript, JavaScript, Node.js, Shell, YAML, frameworks, dependencies, runtime, and build tooling.',
    scenes: {
      python: ['function', 'class', 'module', 'package', 'virtualenv', 'decorator', 'import', 'exception', 'iterator', 'argument'],
      typescript_javascript: ['type', 'interface', 'promise', 'async', 'await', 'callback', 'object', 'array', 'generic', 'module'],
      node_runtime: ['runtime', 'process', 'event-loop', 'module', 'require', 'package-json', 'script', 'stream', 'buffer', 'filesystem'],
      shell: ['shell', 'command', 'path', 'environment-variable', 'pipe', 'redirect', 'permission', 'executable', 'alias', 'script'],
      yaml: ['key', 'value', 'indentation', 'schema', 'anchor', 'list', 'mapping', 'comment', 'scalar', 'sequence'],
      frameworks: ['component', 'route', 'hook', 'middleware', 'server-rendering', 'hydration', 'state', 'props', 'layout', 'provider'],
      dependencies: ['dependency', 'version', 'lockfile', 'install', 'update', 'peer-dependency', 'package-manager', 'registry', 'workspace', 'resolution'],
      build_tools: ['build', 'compile', 'bundle', 'transpile', 'loader', 'plugin', 'minify', 'source-map', 'artifact', 'watch-mode']
    },
    sceneLabels: {
      python: 'Python 语言',
      typescript_javascript: 'TypeScript / JavaScript 语言',
      node_runtime: 'Node.js 运行时',
      shell: 'Shell 与命令行',
      yaml: 'YAML 与配置文件',
      frameworks: '框架使用',
      dependencies: '包与依赖管理',
      build_tools: '构建与打包'
    },
    source: {
      source_id: 'nodejs-docs',
      source_name: 'Node.js Docs',
      source_url: 'https://nodejs.org/en/docs',
      source_type: 'official_docs',
      source_priority: 'P1'
    },
    toolContext: 'Python / TypeScript / Node.js / Shell / YAML'
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    name: 'AI Platform & Model Tools English',
    description: 'Model platforms, APIs, tokens, context, billing, console settings, model docs, and account workflows.',
    scenes: {
      model_api: ['model', 'endpoint', 'request', 'response', 'parameter', 'stream', 'inference', 'output', 'payload', 'schema'],
      console: ['dashboard', 'project', 'organization', 'settings', 'logs', 'usage', 'playground', 'toggle', 'deployment', 'workspace'],
      tokens: ['token', 'input-token', 'output-token', 'context-limit', 'tokenizer', 'cost', 'usage', 'metering', 'prompt-token', 'completion-token'],
      context_window: ['context-window', 'message', 'history', 'truncation', 'memory', 'retrieval', 'window', 'conversation', 'system-message', 'context-limit'],
      billing: ['billing', 'invoice', 'quota', 'credit', 'spend', 'limit', 'subscription', 'rate-limit', 'usage-limit', 'payment-method'],
      account: ['account', 'profile', 'workspace', 'member', 'role', 'organization', 'login', 'session', 'verification', 'team'],
      api_keys: ['api-key', 'secret', 'key', 'project-key', 'rotate', 'revoke', 'environment-variable', 'credential', 'scope', 'permission'],
      model_docs: ['guide', 'reference', 'cookbook', 'example', 'parameter', 'release-note', 'migration', 'quickstart', 'best-practice', 'troubleshooting']
    },
    sceneLabels: {
      model_api: '模型 API 调用',
      console: '官网控制台',
      tokens: 'Token 与用量',
      context_window: '上下文窗口',
      billing: '计费与额度',
      account: '账号与组织',
      api_keys: 'API Key 与认证',
      model_docs: '模型文档与帮助'
    },
    source: {
      source_id: 'openai-platform-docs',
      source_name: 'OpenAI Platform Docs',
      source_url: 'https://platform.openai.com/docs',
      source_type: 'official_docs',
      source_priority: 'P1'
    },
    toolContext: 'OpenAI Platform / Claude / Gemini'
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    name: 'Developer Cloud & Collaboration Tools English',
    description: 'GitHub, Google Cloud, Gmail, Google Drive, permissions, files, deployment environments, and collaboration workflows.',
    scenes: {
      github: ['repository', 'issue', 'pull-request', 'commit', 'branch', 'merge', 'release', 'fork', 'review', 'workflow'],
      cloud: ['resource', 'project', 'region', 'service', 'instance', 'bucket', 'quota', 'deployment', 'compute', 'storage'],
      permissions: ['permission', 'role', 'access', 'owner', 'member', 'admin', 'policy', 'token', 'scope', 'grant'],
      files: ['file', 'folder', 'upload', 'download', 'share', 'sync', 'attachment', 'version', 'shortcut', 'drive'],
      collaboration: ['comment', 'review', 'approve', 'assign', 'mention', 'thread', 'notification', 'resolve', 'request-change', 'collaborator'],
      deployment_environment: ['deploy', 'environment', 'domain', 'secret', 'variable', 'build', 'pipeline', 'preview', 'production', 'rollback'],
      workspace_admin: ['workspace', 'admin-console', 'billing', 'member', 'policy', 'audit-log', 'seat', 'group', 'directory', 'security-setting']
    },
    sceneLabels: {
      github: 'GitHub 仓库与协作',
      cloud: '云服务控制台',
      permissions: '身份与权限',
      files: '云盘与文件',
      collaboration: '协作与评审',
      deployment_environment: '部署环境',
      workspace_admin: '团队与管理后台'
    },
    source: {
      source_id: 'github-docs',
      source_name: 'GitHub Docs',
      source_url: 'https://docs.github.com/',
      source_type: 'official_docs',
      source_priority: 'P1'
    },
    toolContext: 'GitHub / Google Cloud / Google Workspace'
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    name: 'Product Design & Creative Tools English',
    description: 'Figma, Gamma, Lovart, prototyping, canvas, presentation, generation, and creative production tools.',
    scenes: {
      figma: ['frame', 'component', 'variant', 'layer', 'auto-layout', 'constraint', 'style', 'prototype', 'library', 'instance'],
      gamma: ['slide', 'deck', 'template', 'outline', 'theme', 'presentation', 'export', 'card', 'layout', 'embed'],
      lovart: ['canvas', 'prompt', 'generate', 'variation', 'render', 'asset', 'styleboard', 'concept', 'reference', 'composition'],
      prototype: ['prototype', 'flow', 'interaction', 'trigger', 'transition', 'hotspot', 'preview', 'animation', 'state', 'navigation'],
      canvas: ['canvas', 'align', 'resize', 'group', 'mask', 'crop', 'zoom', 'position', 'arrange', 'selection'],
      presentation: ['slide', 'layout', 'speaker-notes', 'title', 'subtitle', 'animation', 'section', 'theme', 'transition', 'presenter-view'],
      generative_design: ['prompt', 'generation', 'variation', 'remix', 'reference', 'moodboard', 'output', 'render', 'style', 'iteration'],
      creative_workflow: ['draft', 'iterate', 'feedback', 'approve', 'publish', 'version', 'asset', 'brief', 'review', 'handoff']
    },
    sceneLabels: {
      figma: 'Figma 设计文件',
      gamma: 'Gamma 演示工具',
      lovart: 'Lovart 生成式创作',
      prototype: '原型与交互',
      canvas: '画布与编辑',
      presentation: '演示文稿',
      generative_design: '生成式设计',
      creative_workflow: '创意工作流'
    },
    source: {
      source_id: 'figma-help',
      source_name: 'Figma Help Center',
      source_url: 'https://help.figma.com/',
      source_type: 'help_center',
      source_priority: 'P1'
    },
    toolContext: 'Figma / Gamma / Lovart.ai'
  }
];

const frequencyTiers = ['F1', 'F1', 'F2', 'F2', 'F3', 'F3', 'F4', 'F1', 'F2', 'F3'];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeCard(pack, sceneId, term, index) {
  const sceneLabel = pack.sceneLabels[sceneId] ?? sceneId;
  const nextTerm = pack.scenes[sceneId][(index + 1) % pack.scenes[sceneId].length];
  const base = term.split('-')[0];

  return {
    card_id: `${pack.domain_pack_id}-${sceneId}-${slug(term)}-${String(index + 1).padStart(2, '0')}`,
    headword: term,
    definition_zh: `${term}：在「${sceneLabel}」场景中需要能读懂、能操作、能用来描述真实任务步骤的技术英语词。`,
    definition_en: `A technical English term used when working in the ${sceneLabel} scene.`,
    part_of_speech: term.includes('-') ? 'noun phrase' : 'noun',
    examples: [
      {
        example_en: `In the ${sceneLabel} scene, identify "${term}" in ${pack.source.source_name} before you follow the workflow.`,
        example_zh: `在「${sceneLabel}」场景中，先在 ${pack.source.source_name} 里识别 "${term}"，再跟着流程操作。`,
        context: 'official source reading'
      },
      {
        example_en: `When using ${pack.toolContext}, use "${term}" to explain the next step clearly.`,
        example_zh: `使用 ${pack.toolContext} 时，用 "${term}" 清楚说明下一步操作。`,
        context: 'real tool workflow'
      }
    ],
    source: pack.source,
    domain_pack_id: pack.domain_pack_id,
    scene_tags: [sceneId],
    frequency_tier: frequencyTiers[index % frequencyTiers.length],
    usage_tasks: [
      `在「${sceneLabel}」场景中识别并理解 ${term}`,
      `把 ${term} 对应到真实官网、工具界面或文档步骤`
    ],
    synonyms: [nextTerm],
    confusing_words: [base === term ? `${term}-setting` : base],
    word_family: [base, `${base}s`, `${base}-related`],
    tags: [`pack/${pack.domain_pack_id}`, `scene/${sceneId}`, `source/${pack.source.source_id}`],
    links: [nextTerm, sceneId],
    aliases: [`${sceneLabel} ${term}`, `${pack.name} ${term}`],
    notes: `Scene demo card for [[${sceneId}]]. This package is for checking deck, browser, FSRS queue, and Word Galaxy behavior before final editorial polishing.`
  };
}

const cards = [];

for (const pack of packs) {
  for (const [sceneId, terms] of Object.entries(pack.scenes)) {
    terms.forEach((term, index) => cards.push(makeCard(pack, sceneId, term, index)));
  }
}

const pkg = {
  package_id: 'techlex-os-scene-classification-demo-450',
  package_version: '0.11.0-demo',
  generated_by: 'codex-scene-demo-generator',
  generated_at: new Date().toISOString(),
  default_language: 'zh-CN',
  domain_packs: packs.map((pack) => ({
    domain_pack_id: pack.domain_pack_id,
    name: pack.name,
    description: pack.description,
    scenes: Object.keys(pack.scenes)
  })),
  cards
};

for (const outputPath of outputTargets) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

console.log(`cards=${cards.length}`);
for (const outputPath of outputTargets) {
  console.log(`wrote=${outputPath}`);
}
