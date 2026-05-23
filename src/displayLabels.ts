export const domainPackDisplayName: Record<string, string> = {
  'ai-programming-english': 'AI编程',
  'web3-developer-english': 'Web3',
  'programming-language-runtime-english': '语言运行时',
  'ai-platform-model-tools-english': 'AI平台',
  'developer-cloud-collaboration-english': '云与协作',
  'product-design-creative-tools-english': '设计创作'
};

export const sceneDisplayName: Record<string, string> = {
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
  account: '账户',
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
  creative_workflow: '创作流程',
  ungrouped: '未分组'
};

export function formatDomainPackLabel(domainPackId: string, fallback?: string) {
  return domainPackDisplayName[domainPackId] ?? fallback ?? domainPackId;
}

export function formatSceneLabel(scene: string) {
  return sceneDisplayName[scene] ?? scene.replace(/[_-]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}
