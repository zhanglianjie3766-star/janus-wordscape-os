import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { getPackName } from '../domainPacks';
import { formatFrequencyTier, frequencyTierOptions } from '../frequencyTiers';
import type { AppData, WordCard } from '../types';

function formatDue(value?: string) {
  if (!value) {
    return '未排程';
  }

  const now = Date.now();
  const due = new Date(value).getTime();
  const diff = due - now;
  const absMinutes = Math.max(1, Math.round(Math.abs(diff) / 60000));
  const prefix = diff < 0 ? '逾期 ' : '';

  if (absMinutes < 60) {
    return `${prefix}${absMinutes} 分钟`;
  }

  const hours = Math.round(absMinutes / 60);
  if (hours < 24) {
    return `${prefix}${hours} 小时`;
  }

  const days = Math.round(hours / 24);
  return `${prefix}${days} 天`;
}

function stageLabel(stage?: string) {
  const labels: Record<string, string> = {
    new: '新卡',
    learning: '学习中',
    reviewing: '复习中',
    reinforce: '巩固',
    downgrade: '降级',
    release: '放行',
    due: '到期',
    overdue: '逾期'
  };

  return labels[stage ?? 'new'] ?? stage ?? '新卡';
}

function stagePillClass(stage?: string) {
  const classes: Record<string, string> = {
    new: 'bg-slate-100 text-slate-600',
    learning: 'bg-amber-50 text-amber-700',
    reviewing: 'bg-brand/10 text-brand',
    reinforce: 'bg-amber-50 text-amber-700',
    downgrade: 'bg-amber-50 text-amber-700',
    release: 'bg-sky-50 text-sky-700',
    due: 'bg-brand/10 text-brand',
    overdue: 'bg-brand/10 text-brand'
  };

  return classes[stage ?? 'new'] ?? classes.new;
}

export default function BrowserView({ data, onWriteDefaultForget }: { data: AppData; onWriteDefaultForget: (card: WordCard) => void }) {
  const [query, setQuery] = useState('');
  const [domainPackId, setDomainPackId] = useState('all');
  const [frequencyTier, setFrequencyTier] = useState('all');
  const [stage, setStage] = useState('all');
  const [source, setSource] = useState('all');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [writeMessage, setWriteMessage] = useState('');
  const sources = Array.from(new Set(data.cards.map((card) => card.source.source_name))).sort();
  const filteredCards = data.cards.filter((card) => {
    const state = data.memory_states[card.card_id];
    const lowerQuery = query.toLowerCase();
    const matchesQuery =
      card.headword.toLowerCase().includes(lowerQuery) ||
      card.definition_zh.includes(query) ||
      card.scene_tags.some((scene) => scene.toLowerCase().includes(lowerQuery)) ||
      card.source.source_name.toLowerCase().includes(lowerQuery);
    const matchesPack = domainPackId === 'all' || card.domain_pack_id === domainPackId;
    const matchesFrequency = frequencyTier === 'all' || card.frequency_tier === frequencyTier;
    const matchesStage = stage === 'all' || state?.stage === stage;
    const matchesSource = source === 'all' || card.source.source_name === source;
    return matchesQuery && matchesPack && matchesFrequency && matchesStage && matchesSource;
  });
  const selectedCard = filteredCards.find((card) => card.card_id === selectedCardId) ?? filteredCards[0] ?? null;
  const selectedState = selectedCard ? data.memory_states[selectedCard.card_id] : undefined;
  const latestReview = selectedCard ? data.review_events.find((event) => event.card_id === selectedCard.card_id) : undefined;

  function writeDefaultForget() {
    if (!selectedCard) {
      return;
    }

    onWriteDefaultForget(selectedCard);
    setWriteMessage(`已按“不会”写入 ${selectedCard.headword}，并加入今日待复习。`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">单词列表</h1>
          <p className="mt-1 text-sm text-muted">独立浏览已导入词卡，检查来源、例句、关系和当前记忆状态。</p>
        </div>
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(120px,180px))]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand" placeholder="搜索词、中文、场景、来源" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={domainPackId} onChange={(event) => setDomainPackId(event.target.value)}>
            <option value="all">全部领域包</option>
            {data.domain_packs.map((pack) => (
              <option key={pack.domain_pack_id} value={pack.domain_pack_id}>
                {pack.name}
              </option>
            ))}
          </select>
          <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={frequencyTier} onChange={(event) => setFrequencyTier(event.target.value)}>
            <option value="all">全部</option>
            {frequencyTierOptions.map((tier) => (
              <option key={tier} value={tier}>
                {formatFrequencyTier(tier)}
              </option>
            ))}
          </select>
          <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="all">全部状态</option>
            {['new', 'learning', 'reviewing', 'reinforce', 'downgrade', 'release', 'due', 'overdue'].map((item) => (
              <option key={item} value={item}>
                {stageLabel(item)}
              </option>
            ))}
          </select>
          <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="all">全部来源</option>
            {sources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 text-sm text-muted">匹配 {filteredCards.length} / {data.cards.length} 张词卡</div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_1fr_90px_110px] gap-3 border-b border-line bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
            <span>Word</span>
            <span>Deck / Source</span>
            <span>Freq</span>
            <span>State</span>
          </div>
          <div className="max-h-[640px] overflow-auto">
            {filteredCards.length === 0 ? (
              <div className="p-6 text-sm text-muted">没有匹配的词卡。</div>
            ) : (
              filteredCards.map((card) => {
                const state = data.memory_states[card.card_id];
                const active = selectedCard?.card_id === card.card_id;
                return (
                  <button
                    className={`grid w-full grid-cols-[1.1fr_1fr_90px_110px] gap-3 border-b border-line px-4 py-3 text-left text-sm hover:bg-brand/5 ${active ? 'bg-brand/10' : 'bg-white'}`}
                    key={card.card_id}
                    onClick={() => {
                      setSelectedCardId(card.card_id);
                      setWriteMessage('');
                    }}
                  >
                    <span>
                      <span className="block font-semibold text-ink">{card.headword}</span>
                      {card.phonetic ? <span className="mt-0.5 block line-clamp-1 text-xs text-muted">{card.phonetic}</span> : null}
                      <span className="mt-1 block line-clamp-1 text-xs text-muted">{card.definition_zh}</span>
                    </span>
                    <span>
                      <span className="block text-ink">{getPackName(data.domain_packs, card.domain_pack_id)}</span>
                      <span className="mt-1 block line-clamp-1 text-xs text-muted">{card.source.source_name}</span>
                    </span>
                    <span className="text-blue-700">{formatFrequencyTier(card.frequency_tier)}</span>
                    <span><span className={`rounded px-2 py-1 text-xs ${stagePillClass(state?.stage)}`}>{stageLabel(state?.stage)}</span></span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-line bg-white p-4 shadow-sm">
          {selectedCard ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-brand">已选词卡</div>
                <h2 className="mt-1 text-2xl font-semibold text-ink">{selectedCard.headword}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{selectedCard.definition_zh}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-panel p-3">
                  <div className="text-xs text-muted">记忆状态</div>
                  <div className="mt-1 font-semibold text-ink">{stageLabel(selectedState?.stage)}</div>
                </div>
                <div className="rounded-md bg-panel p-3">
                  <div className="text-xs text-muted">下次复习</div>
                  <div className="mt-1 font-semibold text-ink">{formatDue(selectedState?.due_at)}</div>
                </div>
              </div>

              <div className="rounded-md border border-red-100 bg-red-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">浏览详情记忆写入</h3>
                    <p className="mt-1 text-xs leading-5 text-red-700">默认写入：不会。点击后生成 browser_detail Again 记录，并加入今日待复习。</p>
                    <p className="mt-2 text-xs text-red-700">
                      最近记录：{latestReview ? `${latestReview.rating} / ${formatDue(latestReview.state_after.due_at)}` : '无'}
                    </p>
                  </div>
                  <button className="inline-flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white" onClick={writeDefaultForget}>
                    <RotateCcw className="h-4 w-4" />
                    写入忘记
                  </button>
                </div>
                {writeMessage ? <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs text-red-700">{writeMessage}</div> : null}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">来源</h3>
                <a className="mt-2 block rounded-md bg-brand/10 px-3 py-2 text-sm font-medium text-brand" href={selectedCard.source.source_url} rel="noreferrer" target="_blank">
                  {selectedCard.source.source_name}
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">例句</h3>
                <div className="mt-2 space-y-2">
                  {selectedCard.examples.map((example, index) => (
                    <div className="rounded-md border border-line p-3 text-sm" key={`${selectedCard.card_id}-${index}`}>
                      <p className="font-medium leading-6 text-ink">{example.example_en}</p>
                      <p className="mt-1 leading-6 text-muted">{example.example_zh}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">关系标签</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {[...selectedCard.scene_tags, ...(selectedCard.synonyms ?? []), ...(selectedCard.confusing_words ?? []), ...(selectedCard.word_family ?? []), ...(selectedCard.tags ?? [])].slice(0, 24).map((item, index) => (
                    <span className="rounded-full bg-panel px-3 py-1 text-muted" key={`${selectedCard.card_id}-relation-${index}-${item}`}>{item}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">[[双向链接]]</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {(selectedCard.links ?? []).length > 0 ? (
                    (selectedCard.links ?? []).map((item, index) => (
                      <span className="rounded-full bg-pink-50 px-3 py-1 text-pink-700" key={`${selectedCard.card_id}-link-${index}-${item}`}>[[{item}]]</span>
                    ))
                  ) : (
                    <span className="text-muted">未声明显式链接，可在 notes / usage_tasks 中使用 [[...]]。</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">选择一张词卡查看内容、来源、记忆状态和关系证据。</p>
          )}
        </aside>
      </div>
    </div>
  );
}
