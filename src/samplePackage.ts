import type { StandardWordCardPackage } from './types';

export const samplePackage: StandardWordCardPackage = {
  package_id: 'techlex-os-phase3-sample',
  package_version: '0.3.0',
  generated_by: 'codex-card-factory',
  generated_at: '2026-05-20T00:00:00+08:00',
  default_language: 'zh-CN',
  domain_packs: [],
  cards: [
    {
      card_id: 'ai-programming-english-extension-001',
      headword: 'extension',
      phonetic: '/ik-STEN-shen/',
      audio_asset_id: 'audio/ai-programming-english/extension-us.mp3',
      audio_accent: 'US',
      definition_zh: '扩展；用于增强软件功能的插件式模块。',
      definition_en: "A software add-on that extends an application's capabilities.",
      part_of_speech: 'noun',
      examples: [
        {
          example_en: 'Install the Cursor extension to add AI coding features to the editor.',
          example_zh: '安装 Cursor 扩展，为编辑器增加 AI 编程功能。',
          context: 'IDE setup'
        },
        {
          example_en: 'Disable the extension if it conflicts with your workspace settings.',
          example_zh: '如果该扩展与工作区设置冲突，就禁用它。',
          context: 'IDE troubleshooting'
        }
      ],
      source: {
        source_id: 'cursor-official',
        source_name: 'Cursor Official Website',
        source_url: 'https://cursor.com/cn',
        source_type: 'official_website',
        source_priority: 'P0'
      },
      domain_pack_id: 'ai-programming-english',
      scene_tags: ['ide_editor', 'ai_code_assistant'],
      frequency_tier: 'F1',
      usage_tasks: ['Understand Cursor website and IDE extension terminology.'],
      synonyms: ['add-on', 'plugin'],
      confusing_words: ['plugin', 'integration'],
      word_family: ['extend', 'extended', 'extensible'],
      notes: 'Prepared outside the client and imported as reusable learning content.',
      frequency_reason: 'F1 because extension appears repeatedly in IDE setup, editor capability, install, and troubleshooting flows.',
      source_context: 'Cursor official pages use extension for installable editor capabilities and integrations.',
      card_status: 'approved'
    },
    {
      card_id: 'ai-programming-english-agent-002',
      headword: 'agent',
      definition_zh: '智能体；能根据目标执行多步任务的软件实体。',
      definition_en: 'A software entity that can take actions toward a goal, often across multiple steps.',
      part_of_speech: 'noun',
      examples: [
        {
          example_en: 'The coding agent inspected the repository before editing the files.',
          example_zh: '编程智能体在编辑文件前检查了代码仓库。',
          context: 'Agentic coding'
        },
        {
          example_en: 'Grant the agent permission only for the workspace it needs to modify.',
          example_zh: '只给智能体授予它需要修改的工作区权限。',
          context: 'Tool permission'
        }
      ],
      source: {
        source_id: 'openai-codex-docs',
        source_name: 'OpenAI Codex Docs',
        source_url: 'https://developers.openai.com/codex',
        source_type: 'official_docs',
        source_priority: 'P1'
      },
      domain_pack_id: 'ai-programming-english',
      scene_tags: ['agentic_coding', 'ai_code_assistant'],
      frequency_tier: 'F1',
      usage_tasks: ['Understand AI agent workflows and permission prompts.'],
      synonyms: ['assistant', 'coding agent'],
      confusing_words: ['bot', 'assistant'],
      word_family: ['agentic', 'agency']
    },
    {
      card_id: 'web3-developer-english-wallet-001',
      headword: 'wallet',
      definition_zh: '钱包；用于管理链上账户、签名交易和查看资产的工具。',
      definition_en: 'A tool for managing blockchain accounts, signing transactions, and viewing assets.',
      part_of_speech: 'noun',
      examples: [
        {
          example_en: 'Connect your wallet before interacting with the DeFi protocol.',
          example_zh: '在与 DeFi 协议交互前，先连接你的钱包。',
          context: 'DeFi app'
        },
        {
          example_en: 'The wallet asks you to review the transaction before signing.',
          example_zh: '钱包会要求你在签名前检查这笔交易。',
          context: 'Transaction signing'
        }
      ],
      source: {
        source_id: 'metamask-developer-docs',
        source_name: 'MetaMask Developer Docs',
        source_url: 'https://docs.metamask.io/',
        source_type: 'official_docs',
        source_priority: 'P1'
      },
      domain_pack_id: 'web3-developer-english',
      scene_tags: ['wallet', 'transaction_signing'],
      frequency_tier: 'F1',
      usage_tasks: ['Understand wallet connection and signing prompts.'],
      synonyms: ['crypto wallet'],
      confusing_words: ['account', 'address'],
      word_family: ['wallets']
    },
    {
      card_id: 'programming-language-runtime-english-syntax-001',
      headword: 'syntax',
      definition_zh: '语法；代码在某种语言中必须遵守的书写规则。',
      definition_en: 'The formal writing rules that code must follow in a language.',
      part_of_speech: 'noun',
      examples: [
        {
          example_en: 'The build failed because the generated code used invalid JavaScript syntax.',
          example_zh: '构建失败，因为生成的代码使用了无效的 JavaScript 语法。',
          context: 'Build error'
        },
        {
          example_en: 'The syntax highlighter made it easier to notice the missing closing bracket.',
          example_zh: '语法高亮让缺失的右括号更容易被发现。',
          context: 'IDE editor'
        }
      ],
      source: {
        source_id: 'mdn-javascript-docs',
        source_name: 'MDN JavaScript Docs',
        source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        source_type: 'official_docs',
        source_priority: 'P1'
      },
      domain_pack_id: 'programming-language-runtime-english',
      scene_tags: ['typescript_javascript', 'build_tools'],
      frequency_tier: 'F2',
      usage_tasks: ['Understand programming-language errors and documentation.'],
      synonyms: ['grammar'],
      confusing_words: ['semantics', 'formatting'],
      word_family: ['syntactic']
    }
  ]
};
