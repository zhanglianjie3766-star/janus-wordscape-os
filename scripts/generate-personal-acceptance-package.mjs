import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputTargets = [
  path.join(root, 'data', 'imports', 'janus-wordscape-core-acceptance-60.json'),
  path.join(root, 'public', 'janus-wordscape-core-acceptance-60.json')
];

const domainPacks = [
  {
    domain_pack_id: 'ai-programming-english',
    name: 'AI Programming English',
    description: 'IDEs, AI coding assistants, agentic coding, Git, CLI, debugging, and technical documentation.',
    scenes: ['ide_editor', 'ai_code_assistant']
  },
  {
    domain_pack_id: 'web3-developer-english',
    name: 'Web3 Developer English',
    description: 'Wallets, smart contracts, DeFi, RPC, block explorers, security, and on-chain development.',
    scenes: ['wallet', 'smart_contract']
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    name: 'Programming Language & Runtime English',
    description: 'Python, TypeScript, JavaScript, Node.js, Shell, YAML, frameworks, dependencies, runtime, and build tooling.',
    scenes: ['typescript_javascript', 'dependencies']
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    name: 'AI Platform & Model Tools English',
    description: 'Model platforms, APIs, tokens, context, billing, console settings, model docs, and account workflows.',
    scenes: ['model_api', 'api_keys']
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    name: 'Developer Cloud & Collaboration Tools English',
    description: 'GitHub, Google Cloud, Gmail, Google Drive, permissions, files, deployment environments, and collaboration workflows.',
    scenes: ['github', 'deployment_environment']
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    name: 'Product Design & Creative Tools English',
    description: 'Figma, Gamma, Lovart, prototyping, canvas, presentation, generation, and creative production tools.',
    scenes: ['figma', 'prototype']
  }
];

const sceneLabels = {
  ide_editor: 'IDE界面',
  ai_code_assistant: 'AI代码助手',
  wallet: '钱包',
  smart_contract: '智能合约',
  typescript_javascript: 'TS/JS',
  dependencies: '依赖管理',
  model_api: '模型API',
  api_keys: 'API密钥',
  github: 'GitHub',
  deployment_environment: '部署环境',
  figma: 'Figma',
  prototype: '原型'
};

const sources = {
  cursor: {
    source_id: 'cursor-docs',
    source_name: 'Cursor Docs',
    source_url: 'https://docs.cursor.com/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  ethereumAccounts: {
    source_id: 'ethereum-accounts-docs',
    source_name: 'Ethereum Accounts Docs',
    source_url: 'https://ethereum.org/en/developers/docs/accounts/',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  solidityContracts: {
    source_id: 'solidity-contracts-docs',
    source_name: 'Solidity Contracts Docs',
    source_url: 'https://docs.soliditylang.org/en/latest/contracts.html',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  mdnJs: {
    source_id: 'mdn-javascript-guide',
    source_name: 'MDN JavaScript Guide',
    source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  npmDocs: {
    source_id: 'npm-docs',
    source_name: 'npm Docs',
    source_url: 'https://docs.npmjs.com/',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  openaiPlatform: {
    source_id: 'openai-platform-docs',
    source_name: 'OpenAI Platform Docs',
    source_url: 'https://platform.openai.com/docs',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  openaiAuth: {
    source_id: 'openai-api-authentication',
    source_name: 'OpenAI API Authentication Docs',
    source_url: 'https://platform.openai.com/docs/api-reference/authentication',
    source_type: 'api_reference',
    source_priority: 'P1'
  },
  githubDocs: {
    source_id: 'github-docs',
    source_name: 'GitHub Docs',
    source_url: 'https://docs.github.com/',
    source_type: 'official_docs',
    source_priority: 'P1'
  },
  figmaHelp: {
    source_id: 'figma-help-center',
    source_name: 'Figma Help Center',
    source_url: 'https://help.figma.com/',
    source_type: 'help_center',
    source_priority: 'P1'
  }
};

const sceneSets = [
  {
    domain_pack_id: 'ai-programming-english',
    scene: 'ide_editor',
    source: sources.cursor,
    cards: [
      {
        headword: 'extension',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '扩展；安装到编辑器中、用于增加功能的插件式模块。',
        definition_en: 'An add-on installed in an editor to extend its capabilities.',
        examples: [
          ['Install the extension before you open the project workspace.', '打开项目工作区前，先安装这个扩展。'],
          ['Disable the extension if it slows down code completion.', '如果这个扩展拖慢代码补全，就把它禁用。']
        ],
        synonyms: ['add-on', 'plugin'],
        confusing_words: ['integration', 'feature'],
        word_family: ['extend', 'extensible', 'extensibility'],
        links: ['plugin', 'settings', 'workspace']
      },
      {
        headword: 'sidebar',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '侧边栏；编辑器左侧或右侧用于显示文件、搜索、聊天等工具的区域。',
        definition_en: 'A side panel in an editor that shows files, search, chat, or tool views.',
        examples: [
          ['Open the sidebar to find the file tree.', '打开侧边栏，找到文件树。'],
          ['The AI chat panel is pinned in the right sidebar.', 'AI 聊天面板固定在右侧边栏。']
        ],
        synonyms: ['side panel', 'tool panel'],
        confusing_words: ['toolbar', 'panel'],
        word_family: ['side', 'bar', 'side-panel'],
        links: ['panel', 'file tree', 'workspace']
      },
      {
        headword: 'workspace',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '工作区；编辑器当前打开的一组项目文件、设置和上下文。',
        definition_en: 'The current project area opened in an editor, including files, settings, and context.',
        examples: [
          ['Add the repository folder to the workspace.', '把仓库文件夹加入工作区。'],
          ['Cursor reads the workspace context before suggesting changes.', 'Cursor 会先读取工作区上下文，再给出修改建议。']
        ],
        synonyms: ['project space', 'working folder'],
        confusing_words: ['repository', 'folder'],
        word_family: ['work', 'workspace settings', 'working directory'],
        links: ['repository', 'context', 'settings']
      },
      {
        headword: 'command palette',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F3',
        definition_zh: '命令面板；通过搜索快速执行编辑器命令的入口。',
        definition_en: 'A searchable launcher for running editor commands quickly.',
        examples: [
          ['Use the command palette to format the current file.', '用命令面板格式化当前文件。'],
          ['Search for the AI command in the command palette.', '在命令面板里搜索 AI 命令。']
        ],
        synonyms: ['command launcher', 'quick command'],
        confusing_words: ['terminal', 'menu'],
        word_family: ['command', 'palette', 'launcher'],
        links: ['shortcut', 'terminal', 'settings']
      },
      {
        headword: 'settings',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '设置；用于调整编辑器、扩展或项目行为的配置项。',
        definition_en: 'Configuration options that control editor, extension, or project behavior.',
        examples: [
          ['Change the editor settings before enabling auto-save.', '启用自动保存前，先修改编辑器设置。'],
          ['The model setting controls which AI model handles the request.', '模型设置控制由哪个 AI 模型处理请求。']
        ],
        synonyms: ['preferences', 'configuration'],
        confusing_words: ['options', 'profile'],
        word_family: ['set', 'setting', 'configured'],
        links: ['configuration', 'profile', 'extension']
      }
    ]
  },
  {
    domain_pack_id: 'ai-programming-english',
    scene: 'ai_code_assistant',
    source: sources.cursor,
    cards: [
      {
        headword: 'completion',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '补全；AI 根据上下文生成的后续代码或文字。',
        definition_en: 'Generated code or text that continues from the current context.',
        examples: [
          ['Accept the completion only after reading the generated code.', '读完生成的代码后，再接受补全。'],
          ['The completion uses nearby files as context.', '这次补全使用了附近文件作为上下文。']
        ],
        synonyms: ['autocomplete', 'code completion'],
        confusing_words: ['suggestion', 'generation'],
        word_family: ['complete', 'completed', 'autocomplete'],
        links: ['suggestion', 'context', 'prompt']
      },
      {
        headword: 'suggestion',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '建议；AI 或工具提出的修改、解释或下一步操作。',
        definition_en: 'A proposed change, explanation, or next action from an AI assistant or tool.',
        examples: [
          ['Review the suggestion before applying it to the file.', '把建议应用到文件前，先检查它。'],
          ['The assistant gave a safer suggestion after reading the error message.', '助手读取错误信息后，给出了更安全的建议。']
        ],
        synonyms: ['recommendation', 'proposal'],
        confusing_words: ['completion', 'instruction'],
        word_family: ['suggest', 'suggested', 'suggestive'],
        links: ['completion', 'diff', 'review']
      },
      {
        headword: 'inline chat',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F2',
        definition_zh: '行内聊天；在代码编辑区内直接向 AI 提问或要求修改的交互方式。',
        definition_en: 'An in-editor chat interaction used to ask for explanations or code changes near the selected code.',
        examples: [
          ['Use inline chat to explain the selected function.', '使用行内聊天解释选中的函数。'],
          ['Inline chat is faster than switching to a separate chat window.', '行内聊天比切换到单独聊天窗口更快。']
        ],
        synonyms: ['in-editor chat', 'inline assistant'],
        confusing_words: ['chat panel', 'comment'],
        word_family: ['inline', 'chat', 'assistant'],
        links: ['selection', 'prompt', 'explanation']
      },
      {
        headword: 'prompt',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '提示词；发送给 AI 的任务描述、约束和上下文说明。',
        definition_en: 'An instruction or task description sent to an AI model, often with constraints and context.',
        examples: [
          ['Write a precise prompt before asking the assistant to refactor code.', '让助手重构代码前，先写一个准确的提示词。'],
          ['A vague prompt may produce a risky patch.', '模糊的提示词可能生成有风险的补丁。']
        ],
        synonyms: ['instruction', 'request'],
        confusing_words: ['context', 'query'],
        word_family: ['prompting', 'prompted', 'prompt template'],
        links: ['instruction', 'context', 'output']
      },
      {
        headword: 'diff',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '差异对比；显示文件修改前后变化的视图或结果。',
        definition_en: 'A view or result showing the difference between two versions of a file.',
        examples: [
          ['Check the diff before you accept the AI change.', '接受 AI 修改前，先检查差异对比。'],
          ['The diff shows that only one function was changed.', '差异对比显示只改了一个函数。']
        ],
        synonyms: ['change view', 'comparison'],
        confusing_words: ['patch', 'merge'],
        word_family: ['different', 'difference', 'diffed'],
        links: ['patch', 'review', 'merge']
      }
    ]
  },
  {
    domain_pack_id: 'web3-developer-english',
    scene: 'wallet',
    source: sources.ethereumAccounts,
    cards: [
      {
        headword: 'wallet',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '钱包；管理账户、密钥、签名和链上交易的软件或硬件工具。',
        definition_en: 'A tool for managing accounts, keys, signatures, and blockchain transactions.',
        examples: [
          ['Connect your wallet before signing the transaction.', '签署交易前，先连接钱包。'],
          ['The wallet shows the active network and account address.', '钱包会显示当前网络和账户地址。']
        ],
        synonyms: ['crypto wallet', 'account manager'],
        confusing_words: ['account', 'address'],
        word_family: ['wallet app', 'hardware wallet', 'wallet account'],
        links: ['account', 'signature', 'network']
      },
      {
        headword: 'address',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '地址；代表链上账户或合约的公开标识。',
        definition_en: 'A public identifier for a blockchain account or contract.',
        examples: [
          ['Copy the address carefully before sending tokens.', '发送代币前，仔细复制地址。'],
          ['The block explorer shows transactions for this address.', '区块浏览器显示这个地址的交易。']
        ],
        synonyms: ['account address', 'public address'],
        confusing_words: ['private key', 'account'],
        word_family: ['addressable', 'address book', 'contract address'],
        links: ['wallet', 'block explorer', 'contract']
      },
      {
        headword: 'seed phrase',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F2',
        definition_zh: '助记词；用于恢复钱包的秘密词组，不能泄露。',
        definition_en: 'A secret recovery phrase used to restore a wallet.',
        examples: [
          ['Never paste your seed phrase into a website.', '不要把助记词粘贴到网站里。'],
          ['Store the seed phrase offline before using the wallet.', '使用钱包前，离线保存助记词。']
        ],
        synonyms: ['recovery phrase', 'mnemonic phrase'],
        confusing_words: ['private key', 'password'],
        word_family: ['seed', 'recovery', 'mnemonic'],
        links: ['private key', 'wallet', 'security']
      },
      {
        headword: 'signature',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '签名；用私钥对消息或交易做出的加密确认。',
        definition_en: 'A cryptographic approval made with a private key for a message or transaction.',
        examples: [
          ['Read the message before approving the signature request.', '批准签名请求前，先阅读消息内容。'],
          ['A malicious signature can grant risky permissions.', '恶意签名可能授予有风险的权限。']
        ],
        synonyms: ['cryptographic signature', 'signed message'],
        confusing_words: ['approval', 'transaction'],
        word_family: ['sign', 'signed', 'signer'],
        links: ['approval', 'private key', 'permission']
      },
      {
        headword: 'network',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '网络；钱包当前连接的区块链环境，如主网或测试网。',
        definition_en: 'The blockchain environment currently selected in a wallet, such as mainnet or testnet.',
        examples: [
          ['Switch the network before opening the dApp.', '打开 dApp 前，先切换网络。'],
          ['The transaction failed because the wallet was on the wrong network.', '交易失败是因为钱包处在错误网络上。']
        ],
        synonyms: ['chain', 'blockchain network'],
        confusing_words: ['node', 'RPC'],
        word_family: ['networking', 'mainnet', 'testnet'],
        links: ['chain id', 'RPC', 'wallet']
      }
    ]
  },
  {
    domain_pack_id: 'web3-developer-english',
    scene: 'smart_contract',
    source: sources.solidityContracts,
    cards: [
      {
        headword: 'contract',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '合约；部署到链上并按代码规则执行的程序。',
        definition_en: 'A program deployed on-chain and executed according to its code.',
        examples: [
          ['Deploy the contract to a testnet before using mainnet.', '上主网前，先把合约部署到测试网。'],
          ['The contract stores the user position on-chain.', '这个合约在链上存储用户仓位。']
        ],
        synonyms: ['smart contract', 'on-chain program'],
        confusing_words: ['agreement', 'script'],
        word_family: ['contractual', 'contract address', 'contract code'],
        links: ['deploy', 'storage', 'function']
      },
      {
        headword: 'function',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '函数；合约中可以被调用的一段逻辑。',
        definition_en: 'A callable unit of logic inside a smart contract.',
        examples: [
          ['Call the function only after checking its parameters.', '检查参数后，再调用这个函数。'],
          ['A public function can be called from outside the contract.', '公开函数可以从合约外部调用。']
        ],
        synonyms: ['method', 'callable logic'],
        confusing_words: ['event', 'modifier'],
        word_family: ['functional', 'function call', 'function selector'],
        links: ['ABI', 'parameter', 'contract']
      },
      {
        headword: 'event',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '事件；合约执行时写入日志、供前端或索引服务监听的记录。',
        definition_en: 'A log emitted by a contract for frontends or indexers to listen to.',
        examples: [
          ['Listen for the Transfer event after the transaction is mined.', '交易被打包后，监听 Transfer 事件。'],
          ['The event helps the frontend update the user interface.', '事件帮助前端更新用户界面。']
        ],
        synonyms: ['log event', 'contract log'],
        confusing_words: ['function', 'transaction'],
        word_family: ['emit', 'emitted', 'event log'],
        links: ['log', 'transaction', 'frontend']
      },
      {
        headword: 'ABI',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '应用二进制接口；描述合约函数、事件和参数编码方式的接口说明。',
        definition_en: 'An interface description for encoding contract functions, events, and parameters.',
        examples: [
          ['Load the ABI before calling the contract from JavaScript.', '从 JavaScript 调用合约前，先加载 ABI。'],
          ['The ABI tells the app how to encode function arguments.', 'ABI 告诉应用如何编码函数参数。']
        ],
        synonyms: ['contract interface', 'application binary interface'],
        confusing_words: ['bytecode', 'interface'],
        word_family: ['encode', 'decode', 'interface'],
        links: ['function', 'event', 'bytecode']
      },
      {
        headword: 'gas',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: 'Gas；链上执行计算和存储操作所需支付的费用单位。',
        definition_en: 'The fee unit used to pay for computation and storage on-chain.',
        examples: [
          ['Estimate gas before sending the transaction.', '发送交易前，先估算 Gas。'],
          ['Complex contract calls usually require more gas.', '复杂的合约调用通常需要更多 Gas。']
        ],
        synonyms: ['transaction fee', 'execution fee'],
        confusing_words: ['ether', 'fee'],
        word_family: ['gas fee', 'gas limit', 'gas price'],
        links: ['transaction', 'fee', 'execution']
      }
    ]
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    scene: 'typescript_javascript',
    source: sources.mdnJs,
    cards: [
      {
        headword: 'type',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '类型；描述值的形状、类别或可用操作的约束。',
        definition_en: 'A description of a value category, shape, or allowed operations.',
        examples: [
          ['Add a type annotation to make the function contract clear.', '添加类型标注，让函数约定更清楚。'],
          ['The error means the value has the wrong type.', '这个错误表示值的类型不对。']
        ],
        synonyms: ['data type', 'type annotation'],
        confusing_words: ['interface', 'class'],
        word_family: ['typed', 'typing', 'type-safe'],
        links: ['interface', 'schema', 'value']
      },
      {
        headword: 'interface',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '接口；描述对象结构、函数签名或模块边界的类型契约。',
        definition_en: 'A type contract that describes object shape, function signatures, or module boundaries.',
        examples: [
          ['Define an interface for the API response.', '为 API 响应定义一个接口。'],
          ['The component props should match this interface.', '组件属性应当匹配这个接口。']
        ],
        synonyms: ['contract', 'shape definition'],
        confusing_words: ['type alias', 'class'],
        word_family: ['interfacing', 'typed interface', 'API interface'],
        links: ['type', 'props', 'schema']
      },
      {
        headword: 'promise',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: 'Promise；表示异步操作最终成功或失败结果的对象。',
        definition_en: 'An object representing the eventual success or failure of an asynchronous operation.',
        examples: [
          ['Return a promise from the fetch wrapper.', '从 fetch 封装函数返回一个 Promise。'],
          ['Handle the promise rejection before showing the result.', '显示结果前，先处理 Promise 拒绝。']
        ],
        synonyms: ['async result', 'future value'],
        confusing_words: ['callback', 'observable'],
        word_family: ['resolve', 'reject', 'thenable'],
        links: ['async', 'await', 'callback']
      },
      {
        headword: 'async',
        part_of_speech: 'adjective',
        frequency_tier: 'F3',
        definition_zh: '异步的；不会阻塞当前执行流程、可在稍后返回结果的。',
        definition_en: 'Non-blocking and able to return a result later.',
        examples: [
          ['Mark the function as async before using await.', '使用 await 前，先把函数标记为 async。'],
          ['The async request should show a loading state.', '异步请求应显示加载状态。']
        ],
        synonyms: ['asynchronous', 'non-blocking'],
        confusing_words: ['sync', 'parallel'],
        word_family: ['asynchronous', 'await', 'async function'],
        links: ['promise', 'await', 'event loop']
      },
      {
        headword: 'module',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '模块；封装并导出代码能力的文件或代码单元。',
        definition_en: 'A file or code unit that encapsulates and exports functionality.',
        examples: [
          ['Export the helper from a shared module.', '从共享模块导出这个辅助函数。'],
          ['The module import failed because the path was wrong.', '模块导入失败，因为路径不对。']
        ],
        synonyms: ['package unit', 'code unit'],
        confusing_words: ['package', 'namespace'],
        word_family: ['modular', 'import', 'export'],
        links: ['import', 'export', 'dependency']
      }
    ]
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    scene: 'dependencies',
    source: sources.npmDocs,
    cards: [
      {
        headword: 'dependency',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '依赖；项目运行或构建时需要安装的外部包。',
        definition_en: 'An external package required by a project to run or build.',
        examples: [
          ['Install the dependency before running the build.', '运行构建前，先安装这个依赖。'],
          ['A vulnerable dependency can affect the whole project.', '有漏洞的依赖可能影响整个项目。']
        ],
        synonyms: ['package dependency', 'required package'],
        confusing_words: ['dev dependency', 'peer dependency'],
        word_family: ['depend', 'dependent', 'dependency tree'],
        links: ['package', 'version', 'lockfile']
      },
      {
        headword: 'version',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '版本；用于区分软件包发布状态和兼容范围的编号。',
        definition_en: 'A number or label that identifies a package release and compatibility range.',
        examples: [
          ['Pin the version if the new release breaks the build.', '如果新版本破坏构建，就固定版本。'],
          ['Check the version before updating the dependency.', '更新依赖前，先检查版本。']
        ],
        synonyms: ['release version', 'package version'],
        confusing_words: ['tag', 'range'],
        word_family: ['versioned', 'versioning', 'semantic version'],
        links: ['dependency', 'release', 'update']
      },
      {
        headword: 'lockfile',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '锁定文件；记录精确依赖版本，保证安装结果可复现的文件。',
        definition_en: 'A file that records exact dependency versions to make installs reproducible.',
        examples: [
          ['Commit the lockfile after changing dependencies.', '修改依赖后，提交锁定文件。'],
          ['The lockfile prevents different machines from installing different versions.', '锁定文件防止不同机器安装出不同版本。']
        ],
        synonyms: ['package lock', 'dependency lockfile'],
        confusing_words: ['manifest', 'package.json'],
        word_family: ['lock', 'locked', 'lock resolution'],
        links: ['version', 'install', 'package manager']
      },
      {
        headword: 'registry',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '注册表；发布和下载软件包的在线仓库服务。',
        definition_en: 'An online service where packages are published and downloaded.',
        examples: [
          ['The package manager downloads packages from the registry.', '包管理器从注册表下载软件包。'],
          ['A private registry can host internal packages.', '私有注册表可以托管内部包。']
        ],
        synonyms: ['package registry', 'package index'],
        confusing_words: ['repository', 'cache'],
        word_family: ['register', 'registered', 'registry mirror'],
        links: ['package manager', 'publish', 'dependency']
      },
      {
        headword: 'peer dependency',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F4',
        definition_zh: '对等依赖；要求宿主项目提供的兼容依赖版本。',
        definition_en: 'A dependency version that the host project is expected to provide.',
        examples: [
          ['Install the peer dependency to remove the warning.', '安装对等依赖以消除警告。'],
          ['React libraries often declare React as a peer dependency.', 'React 库通常把 React 声明为对等依赖。']
        ],
        synonyms: ['peer requirement', 'host dependency'],
        confusing_words: ['dependency', 'dev dependency'],
        word_family: ['peer', 'dependency', 'compatibility'],
        links: ['dependency', 'version', 'warning']
      }
    ]
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    scene: 'model_api',
    source: sources.openaiPlatform,
    cards: [
      {
        headword: 'endpoint',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '端点；客户端发送 API 请求的具体服务地址或接口。',
        definition_en: 'A specific API address or interface where a client sends requests.',
        examples: [
          ['Send the request to the correct endpoint.', '把请求发送到正确的端点。'],
          ['Different endpoints may support different response formats.', '不同端点可能支持不同响应格式。']
        ],
        synonyms: ['API endpoint', 'route'],
        confusing_words: ['URL', 'server'],
        word_family: ['end point', 'API route', 'service endpoint'],
        links: ['request', 'response', 'API']
      },
      {
        headword: 'parameter',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '参数；控制模型请求行为的输入选项。',
        definition_en: 'An input option that controls how a model request behaves.',
        examples: [
          ['Adjust the parameter before comparing model outputs.', '比较模型输出前，先调整参数。'],
          ['A missing parameter can make the request invalid.', '缺少参数可能导致请求无效。']
        ],
        synonyms: ['option', 'request field'],
        confusing_words: ['argument', 'payload'],
        word_family: ['param', 'parameterized', 'configuration'],
        links: ['payload', 'schema', 'request']
      },
      {
        headword: 'streaming',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '流式输出；模型边生成边返回结果的响应方式。',
        definition_en: 'A response mode where model output is returned incrementally as it is generated.',
        examples: [
          ['Enable streaming for a faster perceived response.', '启用流式输出，让用户更快看到响应。'],
          ['The UI should handle streaming chunks safely.', '界面应安全处理流式片段。']
        ],
        synonyms: ['stream output', 'incremental response'],
        confusing_words: ['batch', 'realtime'],
        word_family: ['stream', 'streamed', 'stream chunk'],
        links: ['response', 'chunk', 'latency']
      },
      {
        headword: 'payload',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '载荷；请求或响应中真正承载业务数据的主体内容。',
        definition_en: 'The main body of data carried by a request or response.',
        examples: [
          ['Log the payload only after removing secrets.', '移除密钥后，才记录载荷。'],
          ['The payload must match the expected schema.', '载荷必须匹配预期结构。']
        ],
        synonyms: ['request body', 'data body'],
        confusing_words: ['header', 'parameter'],
        word_family: ['load', 'data payload', 'message body'],
        links: ['schema', 'request', 'response']
      },
      {
        headword: 'schema',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '结构模式；规定数据字段、类型和约束的格式说明。',
        definition_en: 'A structured specification of data fields, types, and constraints.',
        examples: [
          ['Validate the model output against the schema.', '根据结构模式验证模型输出。'],
          ['A clear schema makes downstream parsing safer.', '清晰的结构模式让下游解析更安全。']
        ],
        synonyms: ['data schema', 'structured format'],
        confusing_words: ['template', 'interface'],
        word_family: ['schematic', 'JSON schema', 'schema validation'],
        links: ['payload', 'validation', 'type']
      }
    ]
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    scene: 'api_keys',
    source: sources.openaiAuth,
    cards: [
      {
        headword: 'API key',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F1',
        definition_zh: 'API 密钥；用于向平台证明请求身份的秘密令牌。',
        definition_en: 'A secret token used to authenticate API requests to a platform.',
        examples: [
          ['Store the API key in an environment variable.', '把 API 密钥存放在环境变量里。'],
          ['Never paste an API key into public code.', '不要把 API 密钥粘贴到公开代码里。']
        ],
        synonyms: ['secret key', 'access key'],
        confusing_words: ['password', 'token'],
        word_family: ['key', 'keyed access', 'API credential'],
        links: ['credential', 'environment variable', 'authentication']
      },
      {
        headword: 'credential',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '凭证；用于认证身份或授权访问的密钥、令牌或账号信息。',
        definition_en: 'A key, token, or account detail used for authentication or access.',
        examples: [
          ['Do not commit credentials to the repository.', '不要把凭证提交到代码仓库。'],
          ['Rotate the credential after a suspected leak.', '怀疑泄露后，轮换这个凭证。']
        ],
        synonyms: ['secret', 'auth credential'],
        confusing_words: ['permission', 'profile'],
        word_family: ['credentialed', 'credential store', 'credential manager'],
        links: ['API key', 'secret', 'rotate']
      },
      {
        headword: 'scope',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '权限范围；凭证或令牌被允许访问的资源和操作边界。',
        definition_en: 'The boundary of resources and actions allowed for a key or token.',
        examples: [
          ['Limit the scope of the key to the current project.', '把密钥权限范围限制在当前项目。'],
          ['A broad scope increases the impact of a leaked key.', '过宽的权限范围会放大密钥泄露的影响。']
        ],
        synonyms: ['permission scope', 'access scope'],
        confusing_words: ['role', 'policy'],
        word_family: ['scoped', 'scope limit', 'access boundary'],
        links: ['permission', 'project', 'credential']
      },
      {
        headword: 'rotate',
        part_of_speech: 'verb',
        frequency_tier: 'F3',
        definition_zh: '轮换；停用旧密钥并启用新密钥，以降低泄露风险。',
        definition_en: 'To replace an old secret with a new one to reduce security risk.',
        examples: [
          ['Rotate the API key before sharing the project.', '分享项目前，先轮换 API 密钥。'],
          ['After rotation, update the deployment secret.', '轮换后，更新部署密钥。']
        ],
        synonyms: ['replace', 'refresh'],
        confusing_words: ['revoke', 'regenerate'],
        word_family: ['rotation', 'rotated', 'key rotation'],
        links: ['revoke', 'secret', 'deployment']
      },
      {
        headword: 'revoke',
        part_of_speech: 'verb',
        frequency_tier: 'F4',
        definition_zh: '撤销；让密钥、令牌或权限立即失效。',
        definition_en: 'To invalidate a key, token, or permission immediately.',
        examples: [
          ['Revoke the key if it appears in a public log.', '如果密钥出现在公开日志中，就撤销它。'],
          ['Revoked credentials can no longer call the API.', '被撤销的凭证无法再调用 API。']
        ],
        synonyms: ['disable', 'invalidate'],
        confusing_words: ['rotate', 'delete'],
        word_family: ['revoked', 'revocation', 'access revocation'],
        links: ['credential', 'API key', 'security']
      }
    ]
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    scene: 'github',
    source: sources.githubDocs,
    cards: [
      {
        headword: 'repository',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '仓库；用于保存代码、历史记录、议题和协作流程的项目空间。',
        definition_en: 'A project space for storing code, history, issues, and collaboration workflows.',
        examples: [
          ['Clone the repository before creating a branch.', '创建分支前，先克隆仓库。'],
          ['The repository contains the source code and documentation.', '仓库包含源代码和文档。']
        ],
        synonyms: ['repo', 'code repository'],
        confusing_words: ['project', 'folder'],
        word_family: ['repo', 'repository owner', 'repository settings'],
        links: ['branch', 'commit', 'pull request']
      },
      {
        headword: 'issue',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '议题；用于跟踪问题、需求、任务或讨论的协作条目。',
        definition_en: 'A collaborative item used to track bugs, tasks, feature requests, or discussions.',
        examples: [
          ['Open an issue to describe the bug clearly.', '新建议题，清楚描述这个 bug。'],
          ['Link the pull request to the related issue.', '把拉取请求关联到相关议题。']
        ],
        synonyms: ['ticket', 'task'],
        confusing_words: ['pull request', 'discussion'],
        word_family: ['issue tracker', 'issued', 'issue template'],
        links: ['pull request', 'bug', 'task']
      },
      {
        headword: 'pull request',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F2',
        definition_zh: '拉取请求；提交代码变更并请求评审、讨论和合并的流程。',
        definition_en: 'A workflow for proposing code changes and requesting review, discussion, and merge.',
        examples: [
          ['Create a pull request after pushing the branch.', '推送分支后，创建拉取请求。'],
          ['The pull request must pass checks before merge.', '拉取请求必须通过检查后才能合并。']
        ],
        synonyms: ['PR', 'change request'],
        confusing_words: ['commit', 'merge request'],
        word_family: ['pull', 'request review', 'PR branch'],
        links: ['review', 'branch', 'merge']
      },
      {
        headword: 'branch',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '分支；用于隔离开发工作的一条代码历史线。',
        definition_en: 'A separate line of code history used to isolate development work.',
        examples: [
          ['Create a branch before changing the feature.', '修改功能前，先创建一个分支。'],
          ['Delete the branch after the pull request is merged.', '拉取请求合并后，删除这个分支。']
        ],
        synonyms: ['code branch', 'development branch'],
        confusing_words: ['tag', 'fork'],
        word_family: ['branching', 'branched', 'base branch'],
        links: ['repository', 'merge', 'pull request']
      },
      {
        headword: 'merge',
        part_of_speech: 'verb',
        frequency_tier: 'F4',
        definition_zh: '合并；把一个分支中的变更整合到另一个分支。',
        definition_en: 'To integrate changes from one branch into another branch.',
        examples: [
          ['Merge the pull request after review approval.', '评审通过后，合并拉取请求。'],
          ['Resolve conflicts before you merge the branch.', '合并分支前，先解决冲突。']
        ],
        synonyms: ['integrate', 'combine changes'],
        confusing_words: ['rebase', 'squash'],
        word_family: ['merged', 'merging', 'merge conflict'],
        links: ['conflict', 'branch', 'review']
      }
    ]
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    scene: 'deployment_environment',
    source: sources.githubDocs,
    cards: [
      {
        headword: 'environment',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '环境；代码运行、测试或部署时所在的配置和资源组合。',
        definition_en: 'A set of configuration and resources where code runs, tests, or deploys.',
        examples: [
          ['Deploy the feature to a staging environment first.', '先把功能部署到预发布环境。'],
          ['The production environment uses stricter secrets.', '生产环境使用更严格的密钥。']
        ],
        synonyms: ['runtime environment', 'deployment target'],
        confusing_words: ['workspace', 'server'],
        word_family: ['environmental', 'staging', 'production'],
        links: ['deployment', 'secret', 'preview']
      },
      {
        headword: 'secret',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '密钥；部署或运行时使用、不能公开的敏感配置值。',
        definition_en: 'A sensitive configuration value used at runtime or deployment and kept private.',
        examples: [
          ['Add the API key as a deployment secret.', '把 API 密钥添加为部署密钥。'],
          ['Do not print secrets in build logs.', '不要在构建日志中打印密钥。']
        ],
        synonyms: ['private value', 'sensitive variable'],
        confusing_words: ['variable', 'credential'],
        word_family: ['secret store', 'secret value', 'secret manager'],
        links: ['API key', 'environment variable', 'security']
      },
      {
        headword: 'pipeline',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '流水线；自动执行构建、测试、部署等步骤的流程。',
        definition_en: 'An automated workflow that runs build, test, and deployment steps.',
        examples: [
          ['The pipeline runs tests before deployment.', '流水线在部署前运行测试。'],
          ['A failed pipeline should block production release.', '失败的流水线应阻止生产发布。']
        ],
        synonyms: ['CI/CD pipeline', 'workflow'],
        confusing_words: ['script', 'job'],
        word_family: ['pipe', 'pipelined', 'pipeline job'],
        links: ['workflow', 'build', 'deploy']
      },
      {
        headword: 'preview',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '预览；部署到临时地址、供检查或评审的版本。',
        definition_en: 'A temporary deployed version used for inspection or review.',
        examples: [
          ['Open the preview before approving the change.', '批准变更前，先打开预览。'],
          ['The preview URL shows the latest pull request build.', '预览地址显示最新拉取请求构建。']
        ],
        synonyms: ['preview deployment', 'temporary build'],
        confusing_words: ['production', 'staging'],
        word_family: ['previewed', 'preview URL', 'preview build'],
        links: ['pull request', 'deployment', 'review']
      },
      {
        headword: 'rollback',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '回滚；出现问题后恢复到先前稳定版本的操作。',
        definition_en: 'The act of restoring a previous stable version after a problem occurs.',
        examples: [
          ['Prepare a rollback plan before production release.', '生产发布前，准备回滚方案。'],
          ['Rollback the deployment if the error rate rises.', '如果错误率上升，就回滚部署。']
        ],
        synonyms: ['revert deployment', 'restore previous version'],
        confusing_words: ['redeploy', 'revert'],
        word_family: ['roll back', 'rolled back', 'rollback plan'],
        links: ['production', 'release', 'incident']
      }
    ]
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    scene: 'figma',
    source: sources.figmaHelp,
    cards: [
      {
        headword: 'frame',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '画框；Figma 中承载界面、组件或设计区域的基础容器。',
        definition_en: 'A basic container in Figma for screens, components, or design areas.',
        examples: [
          ['Place the mobile screen inside a frame.', '把手机界面放进一个画框。'],
          ['The frame size controls the visible design area.', '画框尺寸控制可见设计区域。']
        ],
        synonyms: ['artboard', 'container'],
        confusing_words: ['group', 'section'],
        word_family: ['framed', 'frame size', 'frame bounds'],
        links: ['component', 'layout', 'prototype']
      },
      {
        headword: 'component',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '组件；可复用的设计元素，修改主组件可影响其实例。',
        definition_en: 'A reusable design element whose instances can inherit changes from the main component.',
        examples: [
          ['Create a component for the primary button.', '为主按钮创建一个组件。'],
          ['Update the component before publishing the library.', '发布组件库前，先更新这个组件。']
        ],
        synonyms: ['reusable element', 'UI component'],
        confusing_words: ['instance', 'variant'],
        word_family: ['componentized', 'component set', 'component library'],
        links: ['instance', 'variant', 'library']
      },
      {
        headword: 'variant',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '变体；同一组件在不同状态、尺寸或样式下的版本。',
        definition_en: 'A version of the same component for a different state, size, or style.',
        examples: [
          ['Add a disabled variant for the button component.', '为按钮组件添加禁用状态变体。'],
          ['Use variants instead of duplicating separate components.', '使用变体，而不是复制多个独立组件。']
        ],
        synonyms: ['component state', 'component variation'],
        confusing_words: ['instance', 'style'],
        word_family: ['vary', 'variation', 'variant set'],
        links: ['component', 'state', 'design system']
      },
      {
        headword: 'auto layout',
        part_of_speech: 'noun phrase',
        frequency_tier: 'F3',
        definition_zh: '自动布局；让元素根据内容和间距规则自动排列的布局能力。',
        definition_en: 'A layout feature that arranges elements automatically based on content and spacing rules.',
        examples: [
          ['Use auto layout so the button grows with the label.', '使用自动布局，让按钮随文字变宽。'],
          ['Auto layout keeps the card spacing consistent.', '自动布局让卡片间距保持一致。']
        ],
        synonyms: ['automatic layout', 'layout constraints'],
        confusing_words: ['constraint', 'alignment'],
        word_family: ['layout', 'auto-layout frame', 'spacing'],
        links: ['frame', 'component', 'spacing']
      },
      {
        headword: 'instance',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '实例；从主组件复制出来并保持关联的使用副本。',
        definition_en: 'A linked copy created from a main component.',
        examples: [
          ['Override the text in this component instance.', '覆盖这个组件实例里的文字。'],
          ['The instance still receives updates from the main component.', '这个实例仍会接收主组件更新。']
        ],
        synonyms: ['component copy', 'linked copy'],
        confusing_words: ['component', 'duplicate'],
        word_family: ['instantiate', 'instanced', 'instance override'],
        links: ['component', 'override', 'variant']
      }
    ]
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    scene: 'prototype',
    source: sources.figmaHelp,
    cards: [
      {
        headword: 'prototype',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '原型；用于模拟产品流程和交互体验的可点击设计版本。',
        definition_en: 'A clickable design version used to simulate product flows and interactions.',
        examples: [
          ['Share the prototype before the design review.', '设计评审前，先分享原型。'],
          ['The prototype helps test the user flow without code.', '原型能在没有代码的情况下测试用户流程。']
        ],
        synonyms: ['interactive mockup', 'clickable demo'],
        confusing_words: ['wireframe', 'preview'],
        word_family: ['prototyping', 'prototyped', 'prototype link'],
        links: ['interaction', 'flow', 'preview']
      },
      {
        headword: 'interaction',
        part_of_speech: 'noun',
        frequency_tier: 'F1',
        definition_zh: '交互；用户动作与界面反馈之间的行为关系。',
        definition_en: 'The behavior relationship between a user action and an interface response.',
        examples: [
          ['Define the interaction for the submit button.', '为提交按钮定义交互。'],
          ['A clear interaction makes the prototype easier to test.', '清晰的交互让原型更容易测试。']
        ],
        synonyms: ['user interaction', 'behavior'],
        confusing_words: ['animation', 'transition'],
        word_family: ['interact', 'interactive', 'interaction design'],
        links: ['trigger', 'transition', 'prototype']
      },
      {
        headword: 'transition',
        part_of_speech: 'noun',
        frequency_tier: 'F2',
        definition_zh: '过渡；从一个界面状态切换到另一个状态时的变化方式。',
        definition_en: 'The way an interface changes from one state or screen to another.',
        examples: [
          ['Use a simple transition between the list and detail page.', '列表页到详情页之间使用简单过渡。'],
          ['The transition should not hide important content.', '过渡效果不应遮挡重要内容。']
        ],
        synonyms: ['screen transition', 'state change'],
        confusing_words: ['animation', 'motion'],
        word_family: ['transit', 'transitioned', 'transition effect'],
        links: ['interaction', 'animation', 'navigation']
      },
      {
        headword: 'hotspot',
        part_of_speech: 'noun',
        frequency_tier: 'F3',
        definition_zh: '热点区域；原型中可点击并触发跳转或交互的区域。',
        definition_en: 'A clickable area in a prototype that triggers navigation or interaction.',
        examples: [
          ['Add a hotspot over the card arrow.', '在卡片箭头上添加热点区域。'],
          ['The hotspot should match the visible button area.', '热点区域应与可见按钮区域一致。']
        ],
        synonyms: ['click target', 'interactive area'],
        confusing_words: ['button', 'hit area'],
        word_family: ['hot spot', 'target area', 'clickable region'],
        links: ['interaction', 'button', 'navigation']
      },
      {
        headword: 'preview',
        part_of_speech: 'noun',
        frequency_tier: 'F4',
        definition_zh: '预览；在正式交付前查看设计或原型运行效果的视图。',
        definition_en: 'A view for checking how a design or prototype behaves before delivery.',
        examples: [
          ['Open preview mode to test the prototype flow.', '打开预览模式测试原型流程。'],
          ['Preview the mobile layout before exporting assets.', '导出资源前，预览移动端布局。']
        ],
        synonyms: ['preview mode', 'test view'],
        confusing_words: ['publish', 'presentation'],
        word_family: ['previewed', 'preview link', 'live preview'],
        links: ['prototype', 'export', 'mobile layout']
      }
    ]
  }
];

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createCard(group, card, index) {
  const sceneLabel = sceneLabels[group.scene] ?? group.scene;
  const base = card.headword.split(/\s|-/)[0].toLowerCase();

  return {
    card_id: `janus-wordscape-v0-1-${group.domain_pack_id}-${group.scene}-${slug(card.headword)}-${String(index + 1).padStart(2, '0')}`,
    headword: card.headword,
    definition_zh: card.definition_zh,
    definition_en: card.definition_en,
    part_of_speech: card.part_of_speech,
    examples: card.examples.map(([example_en, example_zh], exampleIndex) => ({
      example_en,
      example_zh,
      context: exampleIndex === 0 ? `${sceneLabel} source reading` : `${sceneLabel} real workflow`
    })),
    source: group.source,
    domain_pack_id: group.domain_pack_id,
    scene_tags: [group.scene],
    frequency_tier: card.frequency_tier,
    usage_tasks: [
      `在「${sceneLabel}」场景中识别 ${card.headword}`,
      `把 ${card.headword} 与真实工具界面、文档或操作步骤连接起来`
    ],
    synonyms: card.synonyms,
    confusing_words: card.confusing_words,
    word_family: card.word_family,
    tags: [
      `pack/${group.domain_pack_id}`,
      `scene/${group.scene}`,
      `frequency/${card.frequency_tier}`,
      `source/${group.source.source_id}`
    ],
    links: Array.from(new Set([...card.links, group.scene, card.confusing_words[0]].filter(Boolean))),
    aliases: [`${sceneLabel} ${card.headword}`, `${card.headword} in ${sceneLabel}`],
    notes: `Personal acceptance card for [[${group.scene}]]. Focus: remember the word through scene, source, relation, and operational use. Compare with [[${card.confusing_words[0]}]] when memory feels unstable. #${group.domain_pack_id} #${group.scene} #${card.frequency_tier}`,
    quality: {
      source_verified: true,
      examples_translated: true,
      ready_for_learning: true
    }
  };
}

const cards = sceneSets.flatMap((group) => group.cards.map((card, index) => createCard(group, card, index)));

const packageData = {
  package_id: 'janus-wordscape-core-acceptance-60',
  package_version: '0.1.0',
  generated_by: 'codex-card-factory',
  generated_at: '2026-05-22T12:00:00+08:00',
  default_language: 'zh-CN',
  domain_packs: domainPacks,
  cards
};

for (const outputPath of outputTargets) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(packageData, null, 2)}\n`, 'utf8');
}

const byScene = new Map();
const byFrequency = new Map();
for (const card of cards) {
  const scene = card.scene_tags[0];
  byScene.set(scene, (byScene.get(scene) ?? 0) + 1);
  byFrequency.set(card.frequency_tier, (byFrequency.get(card.frequency_tier) ?? 0) + 1);
}

for (const outputPath of outputTargets) {
  console.log(`wrote=${outputPath}`);
}
console.log(`cards=${cards.length}`);
console.log(`scenes=${byScene.size}`);
console.log(`frequencies=${JSON.stringify(Object.fromEntries([...byFrequency.entries()].sort()))}`);
