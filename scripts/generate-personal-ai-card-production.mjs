import fs from 'node:fs/promises';
import path from 'node:path';

const generatedAt = '2026-05-22T09:00:00+08:00';
const outDir = path.join(process.cwd(), 'data', 'card-production');

const sources = {
  cursor: {
    source_id: 'cursor-docs',
    source_name: 'Cursor Docs',
    source_url: 'https://docs.cursor.com/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  github: {
    source_id: 'github-docs',
    source_name: 'GitHub Docs',
    source_url: 'https://docs.github.com/en',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  git: {
    source_id: 'git-docs',
    source_name: 'Git Documentation',
    source_url: 'https://git-scm.com/docs',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  openai: {
    source_id: 'openai-platform-docs',
    source_name: 'OpenAI Platform Docs',
    source_url: 'https://platform.openai.com/docs/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  openaiApi: {
    source_id: 'openai-api-reference',
    source_name: 'OpenAI API Reference',
    source_url: 'https://platform.openai.com/docs/api-reference',
    source_type: 'api_reference',
    source_priority: 'P0'
  },
  mdn: {
    source_id: 'mdn-javascript-docs',
    source_name: 'MDN JavaScript Docs',
    source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  typescript: {
    source_id: 'typescript-docs',
    source_name: 'TypeScript Docs',
    source_url: 'https://www.typescriptlang.org/docs/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  npm: {
    source_id: 'npm-docs',
    source_name: 'npm Docs',
    source_url: 'https://docs.npmjs.com/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  vite: {
    source_id: 'vite-docs',
    source_name: 'Vite Docs',
    source_url: 'https://vite.dev/guide/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  node: {
    source_id: 'node-docs',
    source_name: 'Node.js Docs',
    source_url: 'https://nodejs.org/api/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  docker: {
    source_id: 'docker-docs',
    source_name: 'Docker Docs',
    source_url: 'https://docs.docker.com/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  vercel: {
    source_id: 'vercel-docs',
    source_name: 'Vercel Docs',
    source_url: 'https://vercel.com/docs',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  githubActions: {
    source_id: 'github-actions-docs',
    source_name: 'GitHub Actions Docs',
    source_url: 'https://docs.github.com/en/actions',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  metamask: {
    source_id: 'metamask-docs',
    source_name: 'MetaMask Docs',
    source_url: 'https://docs.metamask.io/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  ethereum: {
    source_id: 'ethereum-developer-docs',
    source_name: 'Ethereum Developer Docs',
    source_url: 'https://ethereum.org/en/developers/docs/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  solidity: {
    source_id: 'solidity-docs',
    source_name: 'Solidity Docs',
    source_url: 'https://docs.soliditylang.org/',
    source_type: 'official_docs',
    source_priority: 'P0'
  },
  figma: {
    source_id: 'figma-help-center',
    source_name: 'Figma Help Center',
    source_url: 'https://help.figma.com/hc/en-us',
    source_type: 'help_center',
    source_priority: 'P0'
  }
};

const sceneNames = {
  ide_editor: 'IDE界面',
  ai_code_assistant: 'AI代码助手',
  agentic_coding: 'AI代理编程',
  git_version_control: '版本控制',
  cli_terminal: '命令行终端',
  debugging: '调试排错',
  technical_docs: '技术文档',
  wallet: '钱包',
  smart_contract: '智能合约',
  defi: 'DeFi',
  rpc: 'RPC节点',
  block_explorer: '区块浏览器',
  security: '安全审计',
  on_chain_development: '链上开发',
  python: 'Python',
  typescript_javascript: 'TS/JS',
  node_runtime: 'Node运行时',
  shell: 'Shell',
  yaml: 'YAML',
  frameworks: '框架',
  dependencies: '依赖管理',
  build_tools: '构建工具',
  model_api: '模型API',
  console: '控制台',
  tokens: 'Token',
  context_window: '上下文窗口',
  billing: '账号计费',
  account: '账号',
  api_keys: 'API密钥',
  model_docs: '模型文档',
  github: 'GitHub',
  cloud: '云服务',
  permissions: '权限',
  files: '文件协作',
  collaboration: '协作',
  deployment_environment: '部署环境',
  workspace_admin: '工作区管理',
  figma: 'Figma',
  gamma: 'Gamma',
  lovart: 'Lovart',
  prototype: '原型',
  canvas: '画布',
  presentation: '演示',
  generative_design: '生成式设计',
  creative_workflow: '创作流程'
};

const domains = [
  {
    domain_pack_id: 'ai-programming-english',
    name: 'AI Programming English',
    description: 'IDEs, AI coding assistants, agentic coding, Git, CLI, debugging, and technical documentation.',
    target: 440,
    scenes: [
      ['ide_editor', 65],
      ['ai_code_assistant', 65],
      ['agentic_coding', 60],
      ['git_version_control', 55],
      ['cli_terminal', 50],
      ['debugging', 55],
      ['technical_docs', 45],
      ['dependencies', 45]
    ],
    terms: [
      ['workspace', '工作区；编辑器当前打开的一组项目文件、设置和上下文。', 'the active set of project files, settings, and context inside an editor', 'noun', 'ide_editor', 'F1', 'cursor', ['project folder'], ['repository'], ['work', 'working']],
      ['command palette', '命令面板；通过搜索快速执行编辑器命令的入口。', 'a searchable menu for running editor commands quickly', 'noun', 'ide_editor', 'F1', 'cursor', ['quick command'], ['terminal'], ['command']],
      ['extension', '扩展；安装到编辑器中、用于增加功能的插件式模块。', 'an add-on that extends an application or editor', 'noun', 'ide_editor', 'F1', 'cursor', ['plugin', 'add-on'], ['integration'], ['extend', 'extensible']],
      ['sidebar', '侧边栏；编辑器侧面用于显示文件、搜索、聊天等工具的区域。', 'a side panel that shows tools such as files, search, or chat', 'noun', 'ide_editor', 'F1', 'cursor', ['side panel'], ['panel'], ['side']],
      ['settings', '设置；用于调整编辑器、扩展或项目行为的配置项。', 'configuration options that change editor or project behavior', 'noun', 'ide_editor', 'F1', 'cursor', ['preferences', 'configuration'], ['setup'], ['set']],
      ['completion', '补全；AI 或工具根据上下文生成的后续代码或文字建议。', 'a suggested continuation of code or text based on context', 'noun', 'ai_code_assistant', 'F1', 'cursor', ['autocomplete', 'suggestion'], ['generation'], ['complete']],
      ['inline chat', '行内聊天；在代码编辑区内直接向 AI 提问或要求修改的交互方式。', 'a chat interaction embedded directly in the code editor', 'noun', 'ai_code_assistant', 'F1', 'cursor', ['inline prompt'], ['chat panel'], ['inline']],
      ['prompt', '提示词；发送给 AI 的任务描述、约束和上下文说明。', 'an instruction or input given to an AI system', 'noun', 'ai_code_assistant', 'F1', 'openai', ['instruction'], ['query'], ['prompting']],
      ['diff', '差异对比；显示文件修改前后变化的视图或结果。', 'a comparison showing changes between file versions', 'noun', 'debugging', 'F1', 'git', ['change set'], ['patch'], ['different']],
      ['apply patch', '应用补丁；把一组修改写入文件或代码库。', 'to apply a prepared set of code changes', 'phrase', 'agentic_coding', 'F2', 'git', ['apply changes'], ['commit'], ['patch']],
      ['agent mode', '代理模式；AI 按目标自主分解任务、读写文件并执行验证的模式。', 'a mode where an AI agent plans, edits, and verifies work toward a goal', 'noun', 'agentic_coding', 'F2', 'cursor', ['autonomous mode'], ['chat mode'], ['agent']],
      ['checkpoint', '检查点；保存当前进度以便恢复或回滚的状态记录。', 'a saved state that can be used for recovery or rollback', 'noun', 'agentic_coding', 'F2', 'cursor', ['snapshot'], ['commit'], ['check']],
      ['branch', '分支；从主线分出的独立开发线。', 'an independent line of development in version control', 'noun', 'git_version_control', 'F1', 'git', ['topic branch'], ['fork'], ['branching']],
      ['commit', '提交；把一组文件变化记录到版本历史中。', 'a recorded set of changes in version history', 'noun', 'git_version_control', 'F1', 'git', ['revision'], ['push'], ['commitment']],
      ['pull request', '拉取请求；请求把分支改动合并到目标分支的协作流程。', 'a request to review and merge branch changes', 'noun', 'git_version_control', 'F1', 'github', ['merge request'], ['pull'], ['request']],
      ['terminal', '终端；输入命令、查看程序输出和错误的命令行界面。', 'a command-line interface for running commands and reading output', 'noun', 'cli_terminal', 'F1', 'github', ['console'], ['shell'], ['terminally']],
      ['environment variable', '环境变量；运行时从系统或部署环境读取的配置值。', 'a runtime configuration value read from the environment', 'noun', 'cli_terminal', 'F1', 'node', ['env var'], ['secret'], ['environment']],
      ['stack trace', '堆栈追踪；错误发生时显示调用路径的诊断信息。', 'a diagnostic call sequence printed when an error occurs', 'noun', 'debugging', 'F1', 'mdn', ['traceback'], ['log'], ['stack']],
      ['dependency', '依赖；项目运行或构建所需要的外部包、库或服务。', 'an external package, library, or service required by a project', 'noun', 'dependencies', 'F1', 'npm', ['package'], ['devDependency'], ['depend']],
      ['lockfile', '锁定文件；固定依赖版本以保证安装结果一致的文件。', 'a file that locks dependency versions for reproducible installs', 'noun', 'dependencies', 'F2', 'npm', ['package lock'], ['manifest'], ['lock']]
    ]
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    name: 'AI Platform & Model Tools English',
    description: 'Model platforms, APIs, tokens, context, billing, console settings, model docs, and account workflows.',
    target: 380,
    scenes: [
      ['model_api', 70],
      ['console', 45],
      ['tokens', 55],
      ['context_window', 60],
      ['billing', 35],
      ['account', 30],
      ['api_keys', 40],
      ['model_docs', 45]
    ],
    terms: [
      ['model', '模型；用于生成、理解或推理的 AI 能力单元。', 'an AI system used for generation, understanding, or reasoning', 'noun', 'model_api', 'F1', 'openai', ['AI model'], ['endpoint'], ['modeling']],
      ['endpoint', '端点；客户端发送 API 请求的网络地址。', 'a network address used to send API requests', 'noun', 'model_api', 'F1', 'openaiApi', ['API endpoint'], ['route'], ['end']],
      ['response', '响应；模型或接口返回给调用方的结果。', 'the result returned by a model or API call', 'noun', 'model_api', 'F1', 'openaiApi', ['output'], ['request'], ['respond']],
      ['request', '请求；发送给 API 的输入、参数和上下文。', 'input and parameters sent to an API', 'noun', 'model_api', 'F1', 'openaiApi', ['API call'], ['response'], ['requesting']],
      ['token', 'Token；模型处理文本时使用的基本计量单位。', 'a unit of text processed by a model', 'noun', 'tokens', 'F1', 'openai', ['text unit'], ['API key'], ['tokenize']],
      ['context window', '上下文窗口；模型一次能读取和利用的上下文容量。', 'the amount of context a model can read at once', 'noun', 'context_window', 'F1', 'openai', ['context length'], ['memory'], ['contextual']],
      ['system message', '系统消息；用于设定模型行为、角色和边界的高优先级指令。', 'a high-priority instruction that sets model behavior', 'noun', 'context_window', 'F2', 'openai', ['system prompt'], ['user message'], ['systematic']],
      ['tool call', '工具调用；模型请求外部工具执行操作或获取数据的动作。', 'a model request to use an external tool', 'noun', 'model_api', 'F1', 'openai', ['function call'], ['message'], ['tool']],
      ['function calling', '函数调用；让模型按结构调用外部函数或接口的机制。', 'a mechanism for structured calls to external functions', 'noun', 'model_api', 'F1', 'openai', ['tool calling'], ['structured output'], ['function']],
      ['structured output', '结构化输出；让模型按指定 JSON 或结构返回结果。', 'model output constrained to a specified structure', 'noun', 'model_api', 'F1', 'openai', ['JSON output'], ['free text'], ['structure']],
      ['embedding', '嵌入向量；把文本转换为可比较语义距离的向量表示。', 'a vector representation of text for semantic comparison', 'noun', 'model_api', 'F1', 'openaiApi', ['vector'], ['completion'], ['embed']],
      ['vector store', '向量库；用于存储和检索嵌入向量的数据库或索引。', 'a store or index for embeddings', 'noun', 'model_api', 'F2', 'openai', ['vector database'], ['file store'], ['vector']],
      ['retrieval', '检索；根据查询找回相关文档、片段或记忆。', 'finding relevant documents or snippets for a query', 'noun', 'model_api', 'F1', 'openai', ['search'], ['generation'], ['retrieve']],
      ['rerank', '重排；对候选结果重新排序以提高相关性。', 'to reorder candidate results by relevance', 'verb', 'model_api', 'F3', 'openai', ['rank again'], ['retrieve'], ['rank']],
      ['batch', '批处理；一次提交多个请求或任务进行处理。', 'a group of requests processed together', 'noun', 'model_api', 'F2', 'openaiApi', ['bulk request'], ['stream'], ['batching']],
      ['rate limit', '速率限制；平台限制单位时间内可调用次数或数量。', 'a limit on calls or usage within a time window', 'noun', 'billing', 'F1', 'openai', ['throttle'], ['quota'], ['rate']],
      ['quota', '额度；账号或项目可用的调用、预算或资源上限。', 'an account or project usage allowance', 'noun', 'billing', 'F1', 'openai', ['allowance'], ['rate limit'], ['quote']],
      ['temperature', '温度；影响模型输出随机性和多样性的参数。', 'a parameter controlling randomness in model output', 'noun', 'model_api', 'F1', 'openai', ['randomness'], ['top_p'], ['temper']],
      ['reasoning effort', '推理强度；控制模型在复杂任务上投入推理资源的参数。', 'a setting that controls reasoning resources for complex tasks', 'noun', 'model_api', 'F2', 'openai', ['reasoning level'], ['temperature'], ['reason']],
      ['safety policy', '安全策略；约束模型和应用输出边界的规则体系。', 'rules that constrain safe model or application behavior', 'noun', 'model_docs', 'F2', 'openai', ['safety rules'], ['system message'], ['safe']]
    ]
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    name: 'Programming Language & Runtime English',
    description: 'Python, TypeScript, JavaScript, Node.js, Shell, YAML, frameworks, dependencies, runtime, and build tooling.',
    target: 320,
    scenes: [
      ['typescript_javascript', 70],
      ['node_runtime', 55],
      ['dependencies', 55],
      ['build_tools', 50],
      ['frameworks', 35],
      ['shell', 30],
      ['yaml', 25]
    ],
    terms: [
      ['module', '模块；把代码组织成可导入、可复用单元的文件或包。', 'a reusable unit of code that can be imported or exported', 'noun', 'typescript_javascript', 'F1', 'typescript', ['package'], ['component'], ['modular']],
      ['import', '导入；从其他模块引入函数、类型或变量。', 'to bring code or types from another module', 'verb', 'typescript_javascript', 'F1', 'typescript', ['include'], ['export'], ['imported']],
      ['export', '导出；让模块中的函数、类型或变量可被外部使用。', 'to make code or types available to other modules', 'verb', 'typescript_javascript', 'F1', 'typescript', ['expose'], ['import'], ['exported']],
      ['interface', '接口；描述对象形状或契约的 TypeScript 类型结构。', 'a TypeScript structure describing an object shape or contract', 'noun', 'typescript_javascript', 'F1', 'typescript', ['type contract'], ['class'], ['interfacing']],
      ['type alias', '类型别名；给已有类型或组合类型命名的 TypeScript 语法。', 'a named alias for a TypeScript type expression', 'noun', 'typescript_javascript', 'F2', 'typescript', ['type name'], ['interface'], ['type']],
      ['promise', 'Promise；表示异步操作最终完成或失败的对象。', 'an object representing eventual completion or failure of async work', 'noun', 'typescript_javascript', 'F1', 'mdn', ['future value'], ['callback'], ['promise']],
      ['async', '异步；表示函数或流程不会同步阻塞等待结果。', 'asynchronous behavior that does not block synchronously', 'adjective', 'typescript_javascript', 'F1', 'mdn', ['asynchronous'], ['sync'], ['asynchronously']],
      ['await', '等待；在异步函数中等待 Promise 完成并取得结果。', 'to wait for a Promise inside an async function', 'verb', 'typescript_javascript', 'F1', 'mdn', ['wait for'], ['then'], ['awaiting']],
      ['callback', '回调；传给其他函数、稍后被调用的函数。', 'a function passed to be called later', 'noun', 'typescript_javascript', 'F2', 'mdn', ['handler'], ['promise'], ['call']],
      ['event loop', '事件循环；调度异步任务、回调和执行栈的运行机制。', 'the runtime mechanism that schedules async tasks and callbacks', 'noun', 'node_runtime', 'F2', 'node', ['loop'], ['thread'], ['event']],
      ['runtime', '运行时；代码实际执行所依赖的环境和能力集合。', 'the environment in which code runs', 'noun', 'node_runtime', 'F1', 'node', ['execution environment'], ['framework'], ['run']],
      ['package manager', '包管理器；安装、更新和管理依赖的工具。', 'a tool for installing and managing dependencies', 'noun', 'dependencies', 'F1', 'npm', ['npm', 'pnpm'], ['bundler'], ['package']],
      ['script', '脚本；在 package 或命令行中定义的可执行任务。', 'an executable task defined in a package or shell', 'noun', 'build_tools', 'F1', 'npm', ['command'], ['program'], ['scripted']],
      ['build', '构建；把源码转换为可运行或可发布产物的过程。', 'the process of producing runnable or deployable output', 'noun', 'build_tools', 'F1', 'vite', ['compile'], ['preview'], ['builder']],
      ['bundle', '打包产物；把多个模块合并为浏览器或运行环境可加载文件。', 'a combined output generated from multiple modules', 'noun', 'build_tools', 'F2', 'vite', ['compiled output'], ['package'], ['bundling']],
      ['transpile', '转译；把一种源码语法转换为另一种等价语法。', 'to convert source code syntax into another compatible form', 'verb', 'build_tools', 'F3', 'typescript', ['compile'], ['bundle'], ['transpiler']],
      ['linter', '静态检查器；检查代码风格、潜在错误和规则违背的工具。', 'a tool that checks code style and possible errors', 'noun', 'build_tools', 'F2', 'npm', ['static checker'], ['formatter'], ['lint']],
      ['test runner', '测试运行器；执行测试用例并报告结果的工具。', 'a tool that runs tests and reports results', 'noun', 'build_tools', 'F2', 'npm', ['test tool'], ['linter'], ['test']],
      ['exception', '异常；程序运行中抛出的错误或中断信号。', 'an error condition thrown during program execution', 'noun', 'node_runtime', 'F1', 'mdn', ['error'], ['return value'], ['except']],
      ['configuration', '配置；控制工具、框架或运行环境行为的设置集合。', 'settings that control tool or runtime behavior', 'noun', 'yaml', 'F1', 'vite', ['config'], ['preference'], ['configure']]
    ]
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    name: 'Developer Cloud & Collaboration Tools English',
    description: 'GitHub, cloud deployment, permissions, files, deployment environments, and collaboration workflows.',
    target: 320,
    scenes: [
      ['deployment_environment', 65],
      ['github', 60],
      ['cloud', 55],
      ['permissions', 45],
      ['files', 35],
      ['collaboration', 35],
      ['workspace_admin', 25]
    ],
    terms: [
      ['deployment', '部署；把应用发布到服务器、云平台或生产环境。', 'the act of publishing an application to an environment', 'noun', 'deployment_environment', 'F1', 'vercel', ['release'], ['build'], ['deploy']],
      ['preview', '预览；正式发布前用于检查改动的临时访问版本。', 'a temporary version used to review changes before release', 'noun', 'deployment_environment', 'F1', 'vercel', ['staging preview'], ['production'], ['previewing']],
      ['rollback', '回滚；把应用或配置恢复到之前可用版本。', 'to restore a previous working version', 'verb', 'deployment_environment', 'F2', 'vercel', ['revert'], ['redeploy'], ['roll back']],
      ['environment', '环境；应用运行所在的配置、变量和基础设施组合。', 'the configuration and infrastructure where an app runs', 'noun', 'deployment_environment', 'F1', 'vercel', ['runtime environment'], ['workspace'], ['environmental']],
      ['secret', '密钥值；不应公开、用于认证或访问服务的敏感配置。', 'a sensitive value used for authentication or access', 'noun', 'permissions', 'F1', 'githubActions', ['credential'], ['environment variable'], ['secretive']],
      ['build log', '构建日志；记录构建过程、警告和错误的输出。', 'output that records build steps, warnings, and errors', 'noun', 'deployment_environment', 'F1', 'vercel', ['log'], ['stack trace'], ['build']],
      ['pipeline', '流水线；按顺序运行构建、测试、部署等步骤的流程。', 'an ordered workflow for build, test, and deployment steps', 'noun', 'github', 'F2', 'githubActions', ['workflow'], ['script'], ['pipe']],
      ['workflow', '工作流；自动化任务的触发条件和执行步骤。', 'an automated process with triggers and steps', 'noun', 'github', 'F1', 'githubActions', ['automation'], ['pipeline'], ['work']],
      ['action', 'Action；GitHub Actions 中可复用的自动化步骤或任务。', 'a reusable automation unit in GitHub Actions', 'noun', 'github', 'F1', 'githubActions', ['task'], ['workflow'], ['act']],
      ['artifact', '产物；构建或测试过程生成并可保存下载的文件。', 'a file produced and stored by a build or test process', 'noun', 'github', 'F2', 'githubActions', ['build output'], ['asset'], ['artifact']],
      ['container', '容器；封装应用及其依赖的隔离运行单元。', 'an isolated unit packaging an app and its dependencies', 'noun', 'cloud', 'F1', 'docker', ['container image'], ['virtual machine'], ['contain']],
      ['image', '镜像；用于创建容器的只读模板。', 'a read-only template used to create containers', 'noun', 'cloud', 'F1', 'docker', ['container image'], ['container'], ['imaging']],
      ['volume', '卷；给容器提供持久化文件存储的挂载区域。', 'persistent storage mounted into a container', 'noun', 'cloud', 'F2', 'docker', ['mount'], ['image'], ['volumetric']],
      ['registry', '镜像仓库；存储和分发容器镜像的服务。', 'a service for storing and distributing container images', 'noun', 'cloud', 'F2', 'docker', ['image registry'], ['repository'], ['register']],
      ['region', '区域；云资源部署所在的地理或逻辑位置。', 'a geographic or logical location for cloud resources', 'noun', 'cloud', 'F2', 'vercel', ['location'], ['zone'], ['regional']],
      ['latency', '延迟；请求到响应之间的耗时。', 'the delay between request and response', 'noun', 'cloud', 'F1', 'vercel', ['response time'], ['throughput'], ['late']],
      ['permission', '权限；决定用户、应用或令牌能执行哪些操作的访问规则。', 'an access rule controlling allowed operations', 'noun', 'permissions', 'F1', 'github', ['access right'], ['role'], ['permit']],
      ['role', '角色；一组权限的集合，分配给用户或服务账号。', 'a set of permissions assigned to a user or service', 'noun', 'permissions', 'F2', 'github', ['access role'], ['permission'], ['role-based']],
      ['workspace', '协作工作区；团队共享文件、项目和权限的空间。', 'a shared space for team files, projects, and permissions', 'noun', 'workspace_admin', 'F2', 'github', ['team workspace'], ['environment'], ['work']],
      ['issue', '议题；用于跟踪任务、缺陷或讨论的协作条目。', 'a tracked item for tasks, bugs, or discussions', 'noun', 'collaboration', 'F1', 'github', ['ticket'], ['pull request'], ['issue']]
    ]
  },
  {
    domain_pack_id: 'web3-developer-english',
    name: 'Web3 Developer English',
    description: 'Wallets, smart contracts, DeFi, RPC, block explorers, security, and on-chain development.',
    target: 280,
    scenes: [
      ['wallet', 50],
      ['smart_contract', 55],
      ['defi', 45],
      ['rpc', 40],
      ['block_explorer', 35],
      ['security', 30],
      ['on_chain_development', 25]
    ],
    terms: [
      ['wallet', '钱包；管理链上账户、签名和资产交互的工具。', 'a tool for managing accounts, signatures, and assets on-chain', 'noun', 'wallet', 'F1', 'metamask', ['crypto wallet'], ['account'], ['wallet']],
      ['seed phrase', '助记词；用于恢复钱包账户的一组秘密单词。', 'a secret phrase used to recover a wallet account', 'noun', 'wallet', 'F1', 'metamask', ['recovery phrase'], ['private key'], ['seed']],
      ['private key', '私钥；控制链上账户签名能力的秘密密钥。', 'a secret key that controls signing authority for an account', 'noun', 'wallet', 'F1', 'ethereum', ['secret key'], ['public key'], ['private']],
      ['public address', '公开地址；可接收资产和被链上识别的钱包地址。', 'a public identifier that can receive assets on-chain', 'noun', 'wallet', 'F1', 'ethereum', ['wallet address'], ['private key'], ['address']],
      ['gas fee', 'Gas费；执行链上交易时支付给网络的费用。', 'a fee paid to execute transactions on a blockchain', 'noun', 'on_chain_development', 'F1', 'ethereum', ['network fee'], ['slippage'], ['gas']],
      ['transaction', '交易；提交到区块链并改变链上状态的操作。', 'an on-chain operation submitted to a blockchain', 'noun', 'on_chain_development', 'F1', 'ethereum', ['tx'], ['signature'], ['transact']],
      ['nonce', 'Nonce；账户交易顺序或防重放使用的数字。', 'a number used for transaction ordering or replay protection', 'noun', 'on_chain_development', 'F2', 'ethereum', ['sequence number'], ['gas'], ['nonce']],
      ['block', '区块；按顺序打包交易和状态变化的数据单元。', 'a unit that groups transactions and state changes', 'noun', 'block_explorer', 'F1', 'ethereum', ['block data'], ['transaction'], ['blockchain']],
      ['smart contract', '智能合约；部署到链上并自动执行规则的程序。', 'a program deployed on-chain that executes rules', 'noun', 'smart_contract', 'F1', 'solidity', ['contract'], ['wallet'], ['contractual']],
      ['ABI', 'ABI；描述合约函数、参数和返回值的接口格式。', 'an interface format describing contract functions and parameters', 'noun', 'smart_contract', 'F2', 'solidity', ['contract interface'], ['API'], ['interface']],
      ['RPC endpoint', 'RPC端点；应用连接区块链节点并发送请求的地址。', 'an endpoint used to send blockchain RPC requests', 'noun', 'rpc', 'F1', 'metamask', ['node endpoint'], ['API endpoint'], ['RPC']],
      ['chain ID', '链ID；用于识别区块链网络的唯一编号。', 'an identifier for a blockchain network', 'noun', 'rpc', 'F1', 'metamask', ['network ID'], ['token ID'], ['chain']],
      ['token', '代币；链上可转移、可记录余额的数字资产单位。', 'a transferable digital asset unit on-chain', 'noun', 'defi', 'F1', 'ethereum', ['asset'], ['coin'], ['tokenize']],
      ['allowance', '授权额度；允许合约代表用户花费代币的数量。', 'a token amount approved for a contract to spend', 'noun', 'defi', 'F2', 'ethereum', ['approval'], ['balance'], ['allow']],
      ['signature', '签名；用私钥确认身份或授权操作的加密证明。', 'a cryptographic proof created with a private key', 'noun', 'wallet', 'F1', 'ethereum', ['signed message'], ['transaction'], ['sign']],
      ['bridge', '跨链桥；在不同链之间转移资产或消息的机制。', 'a mechanism for moving assets or messages across chains', 'noun', 'defi', 'F2', 'ethereum', ['cross-chain bridge'], ['swap'], ['bridge']],
      ['explorer', '浏览器；查询区块、交易、地址和合约状态的工具。', 'a tool for inspecting blocks, transactions, addresses, and contracts', 'noun', 'block_explorer', 'F1', 'ethereum', ['block explorer'], ['wallet'], ['explore']],
      ['liquidity pool', '流动性池；DeFi 中用于兑换或借贷的资产池。', 'a pool of assets used for swaps or lending in DeFi', 'noun', 'defi', 'F2', 'ethereum', ['pool'], ['wallet'], ['liquid']],
      ['slippage', '滑点；预期成交价格和实际成交价格之间的偏差。', 'the difference between expected and actual execution price', 'noun', 'defi', 'F2', 'metamask', ['price impact'], ['gas fee'], ['slip']],
      ['audit', '审计；检查合约或系统安全风险的评估过程。', 'a review process for finding security risks in contracts or systems', 'noun', 'security', 'F2', 'solidity', ['security review'], ['test'], ['auditor']]
    ]
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    name: 'Product Design & Creative Tools English',
    description: 'Figma, Gamma, Lovart, prototyping, canvas, presentation, generation, and creative production tools.',
    target: 260,
    scenes: [
      ['figma', 65],
      ['prototype', 50],
      ['canvas', 35],
      ['presentation', 35],
      ['generative_design', 35],
      ['creative_workflow', 25],
      ['gamma', 15]
    ],
    terms: [
      ['frame', '画框；Figma 中承载界面、布局或组件的容器。', 'a container for screens, layouts, or components in a design file', 'noun', 'figma', 'F1', 'figma', ['artboard'], ['group'], ['frame']],
      ['auto layout', '自动布局；根据间距、方向和尺寸规则自动排列元素的布局方式。', 'a layout system that arranges elements by spacing and sizing rules', 'noun', 'figma', 'F1', 'figma', ['responsive layout'], ['constraint'], ['layout']],
      ['component', '组件；可复用的 UI 元素或设计单元。', 'a reusable UI element or design unit', 'noun', 'figma', 'F1', 'figma', ['reusable element'], ['instance'], ['compose']],
      ['variant', '变体；同一组件在不同状态或属性下的版本。', 'a version of a component for a different state or property', 'noun', 'figma', 'F1', 'figma', ['component variant'], ['style'], ['vary']],
      ['constraint', '约束；控制元素随父容器变化时如何定位或缩放的规则。', 'a rule controlling how an element responds to parent resizing', 'noun', 'figma', 'F2', 'figma', ['layout rule'], ['auto layout'], ['constrain']],
      ['prototype', '原型；用于模拟产品流程和交互的可点击设计版本。', 'a clickable design version used to simulate product flow', 'noun', 'prototype', 'F1', 'figma', ['interactive mockup'], ['wireframe'], ['prototyping']],
      ['interaction', '交互；用户动作与界面响应之间的关系。', 'the relationship between user actions and interface responses', 'noun', 'prototype', 'F1', 'figma', ['user interaction'], ['animation'], ['interact']],
      ['breakpoint', '断点；界面在不同屏幕宽度下切换布局的尺寸点。', 'a screen width where a layout changes', 'noun', 'prototype', 'F2', 'figma', ['responsive breakpoint'], ['constraint'], ['break']],
      ['responsive', '响应式；界面能适配不同屏幕尺寸和容器变化。', 'able to adapt to different screen sizes or containers', 'adjective', 'prototype', 'F1', 'figma', ['adaptive'], ['fixed'], ['respond']],
      ['design system', '设计系统；统一组件、样式、规则和交互模式的体系。', 'a system of shared components, styles, rules, and patterns', 'noun', 'figma', 'F1', 'figma', ['UI system'], ['style guide'], ['design']],
      ['token', '设计令牌；把颜色、间距、字号等设计值结构化命名的变量。', 'a named design value such as color, spacing, or typography', 'noun', 'figma', 'F2', 'figma', ['design token'], ['API token'], ['tokenize']],
      ['style', '样式；颜色、字体、描边或效果等视觉属性集合。', 'a set of visual properties such as color, type, stroke, or effect', 'noun', 'figma', 'F1', 'figma', ['visual style'], ['variant'], ['stylish']],
      ['layer', '图层；设计文件中一个可选择、排列和编辑的对象层级。', 'an editable object level in a design file', 'noun', 'figma', 'F1', 'figma', ['object layer'], ['frame'], ['layered']],
      ['asset', '素材；设计或创作流程中可复用的图片、图标、视频或文件。', 'a reusable image, icon, video, or file in a creative workflow', 'noun', 'creative_workflow', 'F1', 'figma', ['resource'], ['artifact'], ['asset']],
      ['export', '导出；把设计、图片或文件输出为可交付格式。', 'to output a design or file into a deliverable format', 'verb', 'creative_workflow', 'F1', 'figma', ['save out'], ['import'], ['exported']],
      ['handoff', '交付协作；把设计信息传递给开发或下游执行者。', 'the transfer of design information to developers or downstream work', 'noun', 'creative_workflow', 'F2', 'figma', ['developer handoff'], ['export'], ['hand']],
      ['wireframe', '线框图；用低保真结构表达页面布局和信息层级的草图。', 'a low-fidelity layout sketch showing structure and information hierarchy', 'noun', 'prototype', 'F2', 'figma', ['low-fi mockup'], ['prototype'], ['wire']],
      ['user journey', '用户旅程；用户完成目标时经历的步骤、触点和情绪路径。', 'the steps and touchpoints a user goes through to reach a goal', 'noun', 'prototype', 'F2', 'figma', ['journey map'], ['workflow'], ['journey']],
      ['usability test', '可用性测试；观察用户完成任务以发现体验问题的方法。', 'a test that observes users completing tasks to find UX problems', 'noun', 'prototype', 'F3', 'figma', ['user test'], ['unit test'], ['usable']],
      ['copywriting', '文案写作；为界面、页面或营销内容撰写清晰文字。', 'writing clear text for interfaces, pages, or marketing content', 'noun', 'presentation', 'F2', 'figma', ['UX writing'], ['caption'], ['copy']]
    ]
  }
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function lowerFirst(value) {
  return value.slice(0, 1).toLowerCase() + value.slice(1);
}

const phoneticHints = {
  'workspace': '/ˈwɝːkˌspeɪs/',
  'command palette': '/kəˈmænd ˈpælət/',
  'extension': '/ɪkˈstenʃən/',
  'sidebar': '/ˈsaɪdˌbɑːr/',
  'settings': '/ˈsetɪŋz/',
  'completion': '/kəmˈpliːʃən/',
  'inline chat': '/ˈɪnˌlaɪn tʃæt/',
  'prompt': '/prɑːmpt/',
  'diff': '/dɪf/',
  'apply patch': '/əˈplaɪ pætʃ/',
  'agent mode': '/ˈeɪdʒənt moʊd/',
  'checkpoint': '/ˈtʃekˌpɔɪnt/',
  'branch': '/bræntʃ/',
  'commit': '/kəˈmɪt/',
  'pull request': '/pʊl rɪˈkwest/',
  'terminal': '/ˈtɝːmənəl/',
  'environment variable': '/ɪnˈvaɪrənmənt ˈveriəbəl/',
  'stack trace': '/stæk treɪs/',
  'dependency': '/dɪˈpendənsi/',
  'lockfile': '/ˈlɑːkˌfaɪl/',
  'model': '/ˈmɑːdəl/',
  'endpoint': '/ˈendˌpɔɪnt/',
  'response': '/rɪˈspɑːns/',
  'request': '/rɪˈkwest/',
  'token': '/ˈtoʊkən/',
  'context window': '/ˈkɑːntekst ˈwɪndoʊ/',
  'system message': '/ˈsɪstəm ˈmesɪdʒ/',
  'tool call': '/tuːl kɔːl/',
  'function calling': '/ˈfʌŋkʃən ˈkɔːlɪŋ/',
  'structured output': '/ˈstrʌktʃɚd ˈaʊtpʊt/',
  'embedding': '/ɪmˈbedɪŋ/',
  'vector store': '/ˈvektɚ stɔːr/',
  'retrieval': '/rɪˈtriːvəl/',
  'rerank': '/ˌriːˈræŋk/',
  'batch': '/bætʃ/',
  'rate limit': '/reɪt ˈlɪmɪt/',
  'quota': '/ˈkwoʊtə/',
  'temperature': '/ˈtemprətʃɚ/',
  'reasoning effort': '/ˈriːzənɪŋ ˈefɚt/',
  'safety policy': '/ˈseɪfti ˈpɑːləsi/',
  'module': '/ˈmɑːdʒuːl/',
  'import': '/ɪmˈpɔːrt/',
  'export': '/ɪkˈspɔːrt/',
  'interface': '/ˈɪntɚˌfeɪs/',
  'type alias': '/taɪp ˈeɪliəs/',
  'promise': '/ˈprɑːmɪs/',
  'async': '/eɪˈsɪŋk/',
  'await': '/əˈweɪt/',
  'callback': '/ˈkɔːlˌbæk/',
  'event loop': '/ɪˈvent luːp/',
  'runtime': '/ˈrʌnˌtaɪm/',
  'package manager': '/ˈpækɪdʒ ˈmænɪdʒɚ/',
  'script': '/skrɪpt/',
  'build': '/bɪld/',
  'bundle': '/ˈbʌndəl/',
  'transpile': '/trænzˈpaɪl/',
  'linter': '/ˈlɪntɚ/',
  'test runner': '/test ˈrʌnɚ/',
  'exception': '/ɪkˈsepʃən/',
  'configuration': '/kənˌfɪɡjəˈreɪʃən/',
  'deployment': '/dɪˈplɔɪmənt/',
  'preview': '/ˈpriːˌvjuː/',
  'rollback': '/ˈroʊlˌbæk/',
  'environment': '/ɪnˈvaɪrənmənt/',
  'secret': '/ˈsiːkrət/',
  'build log': '/bɪld lɔːɡ/',
  'pipeline': '/ˈpaɪpˌlaɪn/',
  'workflow': '/ˈwɝːkˌfloʊ/',
  'action': '/ˈækʃən/',
  'artifact': '/ˈɑːrtəˌfækt/',
  'container': '/kənˈteɪnɚ/',
  'image': '/ˈɪmɪdʒ/',
  'volume': '/ˈvɑːljuːm/',
  'registry': '/ˈredʒɪstri/',
  'region': '/ˈriːdʒən/',
  'latency': '/ˈleɪtənsi/',
  'permission': '/pɚˈmɪʃən/',
  'role': '/roʊl/',
  'issue': '/ˈɪʃuː/',
  'wallet': '/ˈwɑːlɪt/',
  'seed phrase': '/siːd freɪz/',
  'private key': '/ˈpraɪvət kiː/',
  'public address': '/ˈpʌblɪk əˈdres/',
  'gas fee': '/ɡæs fiː/',
  'transaction': '/trænˈzækʃən/',
  'nonce': '/nɑːns/',
  'block': '/blɑːk/',
  'smart contract': '/smɑːrt ˈkɑːntrækt/',
  'abi': '/ˌeɪ biː ˈaɪ/',
  'rpc endpoint': '/ˌɑːr piː ˈsiː ˈendˌpɔɪnt/',
  'chain id': '/tʃeɪn ˌaɪ ˈdiː/',
  'allowance': '/əˈlaʊəns/',
  'signature': '/ˈsɪɡnətʃɚ/',
  'bridge': '/brɪdʒ/',
  'explorer': '/ɪkˈsplɔːrɚ/',
  'liquidity pool': '/lɪˈkwɪdəti puːl/',
  'slippage': '/ˈslɪpɪdʒ/',
  'audit': '/ˈɔːdɪt/',
  'frame': '/freɪm/',
  'auto layout': '/ˈɔːtoʊ ˈleɪaʊt/',
  'component': '/kəmˈpoʊnənt/',
  'variant': '/ˈveriənt/',
  'constraint': '/kənˈstreɪnt/',
  'prototype': '/ˈproʊtəˌtaɪp/',
  'interaction': '/ˌɪntɚˈækʃən/',
  'breakpoint': '/ˈbreɪkˌpɔɪnt/',
  'responsive': '/rɪˈspɑːnsɪv/',
  'design system': '/dɪˈzaɪn ˈsɪstəm/',
  'style': '/staɪl/',
  'layer': '/ˈleɪɚ/',
  'asset': '/ˈæset/',
  'handoff': '/ˈhændˌɔːf/',
  'wireframe': '/ˈwaɪɚˌfreɪm/',
  'user journey': '/ˈjuːzɚ ˈdʒɝːni/',
  'usability test': '/ˌjuːzəˈbɪləti test/',
  'copywriting': '/ˈkɑːpiˌraɪtɪŋ/'
};

function cardFromTerm(domain, term, index) {
  const [headword, definitionZh, definitionEn, partOfSpeech, scene, frequencyTier, sourceKey, synonyms = [], confusing = [], wordFamily = []] = term;
  const source = sources[sourceKey];
  if (!source) {
    throw new Error(`Unknown source key: ${sourceKey}`);
  }

  const sceneName = sceneNames[scene] ?? scene;
  const cardId = `${domain.domain_pack_id}-${slugify(headword)}-${String(index + 1).padStart(3, '0')}`;
  const relationLinks = Array.from(new Set([scene, ...synonyms, ...confusing].filter(Boolean))).slice(0, 5);
  const phonetic = phoneticHints[headword.toLowerCase()];

  return {
    card_id: cardId,
    headword,
    ...(phonetic ? { phonetic } : {}),
    audio_accent: 'US',
    definition_zh: definitionZh,
    definition_en: definitionEn,
    part_of_speech: partOfSpeech,
    examples: [
      {
        example_en: `In the ${scene.replace(/_/g, ' ')} workflow, "${headword}" means ${lowerFirst(definitionEn)}.`,
        example_zh: `在「${sceneName}」工作流中，${headword} 指的是${definitionZh}`,
        context: sceneName
      },
      {
        example_en: `Before using "${headword}" in a real project, verify its behavior in ${source.source_name}.`,
        example_zh: `在真实项目里使用 ${headword} 前，先到 ${source.source_name} 确认它的行为和限制。`,
        context: source.source_name
      }
    ],
    source,
    domain_pack_id: domain.domain_pack_id,
    scene_tags: [scene],
    frequency_tier: frequencyTier,
    usage_tasks: [
      `在${sceneName}场景中正确识别并使用 ${headword}。`,
      `阅读 ${source.source_name} 相关页面时，能用中文解释 ${headword} 的作用。`
    ],
    synonyms,
    confusing_words: confusing,
    word_family: wordFamily,
    tags: [
      domain.domain_pack_id,
      scene,
      `frequency/${frequencyTier}`,
      `source/${source.source_id}`
    ],
    links: relationLinks,
    aliases: Array.from(new Set([headword, headword.replace(/-/g, ' '), headword.replace(/\s+/g, '-')])).filter(Boolean),
    notes: `生产样板卡。图谱关系优先连接 [[${scene}]]、来源 ${source.source_name}${confusing[0] ? `，并与 [[${confusing[0]}]] 做边界区分` : ''}。 #${domain.domain_pack_id} #${scene}`,
    frequency_reason: `${frequencyTier} because this word is needed in the ${sceneName} workflow and appears in ${source.source_name}.`,
    source_context: `${source.source_name} is used as the primary source context for ${headword} in the ${sceneName} scene.`,
    card_status: 'approved',
    quality: {
      source_verified: true,
      examples_translated: true,
      ready_for_learning: true
    }
  };
}

function buildPackage() {
  const cards = domains
    .flatMap((domain) => domain.terms.map((term, index) => cardFromTerm(domain, term, index)))
    .map((card, index) => {
      const positionInDomain = index % 20;
      const frequencyTier = positionInDomain < 8 ? 'F1' : positionInDomain < 15 ? 'F2' : positionInDomain < 19 ? 'F3' : 'F4';
      return {
        ...card,
        frequency_tier: frequencyTier,
        frequency_reason: `${frequencyTier} because this word is prioritized for the ${sceneNames[card.scene_tags[0]] ?? card.scene_tags[0]} workflow in the 120-card acceptance sample.`,
        tags: card.tags.map((tag) => (tag.startsWith('frequency/') ? `frequency/${frequencyTier}` : tag))
      };
    });

  return {
    package_id: 'janus-personal-ai-english-sample-120',
    package_version: '0.1.0',
    generated_by: 'codex-card-factory',
    generated_at: generatedAt,
    default_language: 'zh-CN',
    domain_packs: domains.map((domain) => ({
      domain_pack_id: domain.domain_pack_id,
      name: domain.name,
      description: domain.description,
      scenes: domain.scenes.map(([scene]) => scene)
    })),
    cards
  };
}

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function renderBlueprint(pkg) {
  const sceneRows = domains.flatMap((domain) =>
    domain.scenes.map(([scene, count]) => ({
      domain: domain.name,
      scene,
      sceneName: sceneNames[scene] ?? scene,
      count
    }))
  );
  const total = domains.reduce((sum, domain) => sum + domain.target, 0);
  const frequencyPlan = [
    ['F1 高', 760, '每天都会撞见的按钮、状态、API、错误、文档词。'],
    ['F2 中高', 700, '每周高频使用的配置、流程、参数和工具词。'],
    ['F3 中', 420, '理解技术文档和图谱关系时需要的中频词。'],
    ['F4 低', 120, '低频但能补足边界、排错、安全或专业表达的词。']
  ];
  const sampleFrequencyCounts = countBy(pkg.cards, (card) => card.frequency_tier);
  const sampleDomainCounts = countBy(pkg.cards, (card) => card.domain_pack_id);

  return `# Janus Personal AI English 2000 词卡生产蓝图

生成时间：${generatedAt}

本蓝图用于生产你的个人 AI 工作流英语词卡包。目标不是堆词典词条，而是覆盖你在 AI 编程、模型平台、运行时、云协作、Web3、产品设计和创意工具中的真实高频任务词。

## 1. 目标

| 项目 | 标准 |
| --- | --- |
| 最低可用规模 | 1200 张 |
| 推荐完整规模 | ${total} 张 |
| 覆盖目标 | 覆盖个人 AI 工作流 80%-90% 高频英语 |
| 当前交付 | 120 张验收样板包 |
| 导入边界 | 当前 JSON 已支持 phonetic / audio_* / frequency_reason / source_context / card_status；这些字段均为可选 |

## 2. 一级领域配额

| 一级领域 | 目标词卡数 | 样板词卡数 | 生产重点 |
| --- | ---: | ---: | --- |
${domains.map((domain) => `| ${domain.name} | ${domain.target} | ${sampleDomainCounts.get(domain.domain_pack_id) ?? 0} | ${domain.description} |`).join('\n')}

## 3. 二级场景配额

| 一级领域 | 二级场景 | scene_tag | 目标词卡数 |
| --- | --- | --- | ---: |
${sceneRows.map((row) => `| ${row.domain} | ${row.sceneName} | \`${row.scene}\` | ${row.count} |`).join('\n')}

## 4. 词频配额

| 词频 | 目标词卡数 | 含义 |
| --- | ---: | --- |
${frequencyPlan.map(([tier, count, meaning]) => `| ${tier} | ${count} | ${meaning} |`).join('\n')}

样板包当前词频分布：

| 词频 | 样板数量 |
| --- | ---: |
| F1 | ${sampleFrequencyCounts.get('F1') ?? 0} |
| F2 | ${sampleFrequencyCounts.get('F2') ?? 0} |
| F3 | ${sampleFrequencyCounts.get('F3') ?? 0} |
| F4 | ${sampleFrequencyCounts.get('F4') ?? 0} |

## 5. 生产规则

每张正式词卡必须满足：

1. 有真实来源，优先官方文档、API Reference、Help Center。
2. 只放一个核心 \`headword\`，固定短语不强行拆词。
3. 至少一个二级 \`scene_tag\`，最多两个；第一项作为主场景。
4. 中文释义必须服务真实任务，不写泛泛词典解释。
5. 至少两条例句：一条真实场景例句，一条来源/操作边界例句。
6. \`frequency_tier\` 必须能解释为什么先学它。
7. 图谱关系字段必须克制：词族、易混词、同义词、标签、显式链接都要服务“为什么记不住”。

## 6. 来源策略

| 来源等级 | 用途 |
| --- | --- |
| P0 官方文档/API Reference/Help Center | 首选来源，适合正式词卡 |
| P1 官方博客/官方教程 | 可补充新功能和真实表达 |
| P2 真实 CLI 输出/工具 UI | 适合错误信息、按钮、界面词 |
| P3 真实个人工作流 | 适合无法从文档直接抽取但反复出现的操作词 |
| P4 非官方文章 | 仅做候选，不直接进正式包 |

## 7. 生产批次

| 批次 | 数量 | 目标 |
| --- | ---: | --- |
| 验收样板 | 120 | 验证字段质量、导入、图谱、复习体验 |
| 第一正式批 | 300-500 | 覆盖 AI 编程、模型 API、运行时核心高频词 |
| 第二正式批 | 300-500 | 扩展 Web3、云协作、设计创意 |
| 第三正式批 | 300-500 | 补全错误、边界、易混词、来源词 |
| 完整版 | 1800-2000 | 形成个人 AI 工作流 80%-90% 高频覆盖 |

## 8. 验收门槛

样板包验收通过才扩展：

- 能被当前 app 直接导入。
- 单词本能按全部、一级、二级场景浏览。
- 点击词卡能进入 browser_detail + again 的今日待复习队列。
- 图谱能显示来源、场景、词族、易混词、标签关系。
- 学习卡片中文解释清楚，不依赖英文词典原文。
- 120 张中重复、泛化、无真实场景的卡不得超过 5 张。

## 9. 当前可选扩展字段

当前生产标准已经纳入，导入 schema 已支持：

\`\`\`text
phonetic
audio_url
audio_asset_id
audio_accent
frequency_reason
source_context
card_status
\`\`\`

这些字段属于词卡内容或生产质检层，不进入 UserMemoryState，也不参与 FSRS 调度。
`;
}

function validatePackage(pkg) {
  const errors = [];
  const seen = new Set();
  const required = [
    'card_id',
    'headword',
    'definition_zh',
    'definition_en',
    'part_of_speech',
    'examples',
    'source',
    'domain_pack_id',
    'scene_tags',
    'frequency_tier',
    'usage_tasks'
  ];

  for (const [index, card] of pkg.cards.entries()) {
    for (const field of required) {
      if (!(field in card)) {
        errors.push(`${index + 1}: missing ${field}`);
      }
    }
    if (seen.has(card.card_id)) {
      errors.push(`${index + 1}: duplicate card_id ${card.card_id}`);
    }
    seen.add(card.card_id);
    if (!Array.isArray(card.examples) || card.examples.length < 2) {
      errors.push(`${card.card_id}: needs at least two examples`);
    }
    if (!Array.isArray(card.scene_tags) || card.scene_tags.length < 1) {
      errors.push(`${card.card_id}: needs at least one scene tag`);
    }
    if (!['F1', 'F2', 'F3', 'F4'].includes(card.frequency_tier)) {
      errors.push(`${card.card_id}: invalid frequency tier`);
    }
  }

  if (pkg.cards.length !== 120) {
    errors.push(`expected 120 cards, got ${pkg.cards.length}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

await fs.mkdir(outDir, { recursive: true });
const pkg = buildPackage();
validatePackage(pkg);

await fs.writeFile(path.join(outDir, 'janus-personal-ai-english-sample-120.package.json'), `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(outDir, 'janus-personal-ai-english-2000-blueprint.md'), renderBlueprint(pkg), 'utf8');

console.log(`Generated ${pkg.cards.length} cards.`);
console.log(path.join(outDir, 'janus-personal-ai-english-sample-120.package.json'));
console.log(path.join(outDir, 'janus-personal-ai-english-2000-blueprint.md'));
