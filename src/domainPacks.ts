import type { DomainPack } from './types';

export const defaultDomainPacks: DomainPack[] = [
  {
    domain_pack_id: 'ai-programming-english',
    name: 'AI Programming English',
    description: 'IDEs, AI coding assistants, agentic coding, Git, CLI, debugging, and technical documentation.',
    scenes: ['ide_editor', 'ai_code_assistant', 'agentic_coding', 'git_version_control', 'cli_terminal', 'debugging', 'technical_docs']
  },
  {
    domain_pack_id: 'web3-developer-english',
    name: 'Web3 Developer English',
    description: 'Wallets, smart contracts, DeFi, RPC, block explorers, security, and on-chain development.',
    scenes: ['wallet', 'smart_contract', 'defi', 'rpc', 'block_explorer', 'security', 'on_chain_development']
  },
  {
    domain_pack_id: 'programming-language-runtime-english',
    name: 'Programming Language & Runtime English',
    description: 'Python, TypeScript, JavaScript, Node.js, Shell, YAML, frameworks, dependencies, runtime, and build tooling.',
    scenes: ['python', 'typescript_javascript', 'node_runtime', 'shell', 'yaml', 'frameworks', 'dependencies', 'build_tools']
  },
  {
    domain_pack_id: 'ai-platform-model-tools-english',
    name: 'AI Platform & Model Tools English',
    description: 'Model platforms, APIs, tokens, context, billing, console settings, model docs, and account workflows.',
    scenes: ['model_api', 'console', 'tokens', 'context_window', 'billing', 'account', 'api_keys', 'model_docs']
  },
  {
    domain_pack_id: 'developer-cloud-collaboration-english',
    name: 'Developer Cloud & Collaboration Tools English',
    description: 'GitHub, Google Cloud, Gmail, Google Drive, permissions, files, deployment environments, and collaboration workflows.',
    scenes: ['github', 'cloud', 'permissions', 'files', 'collaboration', 'deployment_environment', 'workspace_admin']
  },
  {
    domain_pack_id: 'product-design-creative-tools-english',
    name: 'Product Design & Creative Tools English',
    description: 'Figma, Gamma, Lovart, prototyping, canvas, presentation, generation, and creative production tools.',
    scenes: ['figma', 'gamma', 'lovart', 'prototype', 'canvas', 'presentation', 'generative_design', 'creative_workflow']
  }
];

export function mergeDomainPacks(existing: DomainPack[], incoming: DomainPack[] = []): DomainPack[] {
  const byId = new Map<string, DomainPack>();

  for (const pack of [...defaultDomainPacks, ...existing, ...incoming]) {
    byId.set(pack.domain_pack_id, {
      ...byId.get(pack.domain_pack_id),
      ...pack,
      scenes: Array.from(new Set([...(byId.get(pack.domain_pack_id)?.scenes ?? []), ...(pack.scenes ?? [])]))
    });
  }

  return Array.from(byId.values());
}

export function getPackName(packs: DomainPack[], domainPackId: string): string {
  return packs.find((pack) => pack.domain_pack_id === domainPackId)?.name ?? domainPackId;
}
