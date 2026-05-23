import { Archive, BookOpen, Brain, CheckCircle2, ChevronDown, ChevronRight, Database, Download, FileUp, ImagePlus, Info, RotateCcw, ShieldCheck, SlidersHorizontal, Upload, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildIntegrityReport } from '../integrity';
import { importPackage, parsePackage, parsePackageText } from '../importer';
import { samplePackage } from '../samplePackage';
import { buildStorageBudgetReport } from '../storageBudget';
import { DEFAULT_USER_AVATAR_SRC, DEFAULT_USER_NICKNAME, type UserProfile } from '../userProfile';
import { APP_VERSION, BACKUP_SCHEMA_VERSION } from '../version';
import type { IntegrityReport } from '../integrity';
import type { StorageBudgetReport } from '../storageBudget';
import type { AppData, ImportIssue, ImportResult } from '../types';

type PersistenceUiStatus = {
  source: 'loading' | 'indexeddb' | 'indexeddb_recovered' | 'indexeddb_corrupt' | 'legacy_localstorage' | 'localstorage_shadow' | 'empty' | 'fallback_localstorage';
  migrated_from_localstorage: boolean;
  error?: string;
};

type SettingsPanelKey = 'learning' | 'profile' | 'backup' | 'health' | 'fsrs' | 'about' | 'manual' | 'advanced';

type ImportPackageHandler = (pkg: Parameters<typeof importPackage>[1], format?: Parameters<typeof importPackage>[2], issues?: Parameters<typeof importPackage>[3]) => ImportResult;

const APP_DEVELOPER = '雅努斯（Janus）';

const persistenceLabels: Record<PersistenceUiStatus['source'], string> = {
  loading: '加载中',
  indexeddb: 'IndexedDB',
  indexeddb_recovered: '已恢复',
  indexeddb_corrupt: '需恢复',
  legacy_localstorage: '已迁移',
  localstorage_shadow: '辅助层',
  empty: '空数据',
  fallback_localstorage: '备用存储'
};

function IssueList({ title, issues }: { title: string; issues: ImportIssue[] }) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-line bg-panel p-3">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <ul className="mt-2 max-h-36 space-y-1 overflow-auto text-xs leading-5 text-muted">
        {issues.slice(0, 20).map((item, index) => (
          <li key={`${item.message}-${index}`}>
            {item.row ? `row ${item.row}: ` : ''}
            {item.card_id ? `${item.card_id}: ` : ''}
            {item.field ? `${item.field} - ` : ''}
            {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsCard({
  active,
  children,
  icon: Icon,
  onToggle,
  summary,
  title
}: {
  active: boolean;
  children: React.ReactNode;
  icon: typeof SlidersHorizontal;
  onToggle: () => void;
  summary: string;
  title: string;
}) {
  const Arrow = active ? ChevronDown : ChevronRight;

  return (
    <section className={`overflow-hidden rounded-xl border bg-white/95 shadow-sm transition ${active ? 'border-brand/60' : 'border-line'}`}>
      <button className="flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4" onClick={onToggle} type="button">
        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? 'bg-brand/10 text-brand' : 'bg-panel text-muted'}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-5 text-ink">{title}</span>
          <span className="mt-0.5 block truncate text-xs leading-5 text-muted">{summary}</span>
        </span>
        <Arrow className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {active ? <div className="border-t border-line px-3 py-3 sm:px-4">{children}</div> : null}
    </section>
  );
}

function SettingsGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="space-y-2">
      <div className="px-1 text-xs font-semibold text-muted">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function ToggleOption({ checked, description, label, onChange }: { checked: boolean; description: string; label: string; onChange: (value: boolean) => void }) {
  return (
    <button className={`rounded-xl border p-3 text-left transition ${checked ? 'border-brand bg-brand/5' : 'border-line bg-white'}`} onClick={() => onChange(!checked)} type="button">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className={`relative h-6 w-10 rounded-full transition ${checked ? 'bg-brand' : 'bg-slate-200'}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-1'}`} />
        </span>
      </span>
      <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
    </button>
  );
}

function CompactInfoList({ items }: { items: Array<{ label: string; description: string }> }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div className="rounded-xl bg-panel px-3 py-2.5 text-sm leading-6" key={item.label}>
          <div className="font-semibold text-ink">{item.label}</div>
          <div className="mt-0.5 text-muted">{item.description}</div>
        </div>
      ))}
    </div>
  );
}

function ProfilePanel({ profile, onUpdate }: { profile: UserProfile; onUpdate: (profile: UserProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function saveProfile(next: UserProfile) {
    const normalized = {
      nickname: next.nickname.trim() || DEFAULT_USER_NICKNAME,
      avatar_src: next.avatar_src || DEFAULT_USER_AVATAR_SRC
    };
    setDraft(normalized);
    onUpdate(normalized);
    setMessage('个人资料已保存。');
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setMessage('请选择图片文件。');
      return;
    }

    if (file.size > 512 * 1024) {
      setMessage('头像文件建议小于 512KB。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        saveProfile({ ...draft, avatar_src: reader.result });
      }
    };
    reader.onerror = () => setMessage('头像读取失败，请换一张图片。');
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-panel px-3 py-3">
        <img alt="用户头像预览" className="h-14 w-14 shrink-0 rounded-full border border-white bg-white object-cover shadow-sm" src={draft.avatar_src} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-ink">{draft.nickname.trim() || DEFAULT_USER_NICKNAME}</div>
          <div className="mt-0.5 text-xs text-muted">本地显示资料，不影响词卡和记忆数据。</div>
        </div>
        <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-muted shadow-sm" onClick={() => avatarInputRef.current?.click()} type="button" aria-label="上传头像">
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handleAvatarFile(file);
            }
            event.currentTarget.value = '';
          }}
          ref={avatarInputRef}
          type="file"
        />
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">昵称</span>
        <input
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          maxLength={24}
          onChange={(event) => {
            setDraft({ ...draft, nickname: event.target.value });
            setMessage('');
          }}
          placeholder={DEFAULT_USER_NICKNAME}
          value={draft.nickname}
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <button className="rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-white" onClick={() => saveProfile(draft)} type="button">
          保存个人资料
        </button>
        <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink" onClick={() => saveProfile({ nickname: DEFAULT_USER_NICKNAME, avatar_src: DEFAULT_USER_AVATAR_SRC })} type="button">
          恢复默认
        </button>
      </div>
      {message ? <div className="rounded-xl bg-brand/5 px-3 py-2 text-sm text-brand">{message}</div> : null}
    </div>
  );
}

function statusLabel(report: IntegrityReport, storageReport: StorageBudgetReport) {
  if (report.status === 'error' || storageReport.status === 'risk') {
    return '需要处理';
  }
  if (report.status === 'warning' || storageReport.status === 'watch') {
    return '需要关注';
  }
  return '正常';
}

function ImportControls({ onImportPackage }: { onImportPackage: ImportPackageHandler }) {
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function finish(result: ImportResult) {
    setLastResult(result);
    setMessage(`${result.format.toUpperCase()} 导入完成：新增 ${result.imported_cards} 张，跳过重复 ${result.skipped_duplicates} 张，错误 ${result.errors.length} 条。`);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parsePackageText(text, file.name);

    if (!parsed.pkg) {
      setLastResult({
        package_id: file.name,
        format: parsed.format,
        imported_cards: 0,
        skipped_duplicates: 0,
        imported_domain_packs: 0,
        errors: parsed.errors,
        warnings: parsed.warnings
      });
      setMessage('导入失败：文件格式或字段不符合标准词卡包要求。');
      return;
    }

    if (parsed.pkg.cards.length === 0 && parsed.errors.length > 0) {
      setLastResult({
        package_id: parsed.pkg.package_id,
        format: parsed.format,
        imported_cards: 0,
        skipped_duplicates: 0,
        imported_domain_packs: 0,
        errors: parsed.errors,
        warnings: parsed.warnings
      });
      setMessage('导入失败：没有可用词卡，当前学习数据未被修改。');
      return;
    }

    finish(onImportPackage(parsed.pkg, parsed.format, { errors: parsed.errors, warnings: parsed.warnings }));
  }

  function handleSampleImport() {
    const parsed = parsePackage(samplePackage);
    if (!parsed.pkg) {
      setLastResult({
        package_id: samplePackage.package_id,
        format: 'json',
        imported_cards: 0,
        skipped_duplicates: 0,
        imported_domain_packs: 0,
        errors: parsed.errors,
        warnings: parsed.warnings
      });
      setMessage('示例包校验失败。');
      return;
    }

    finish(onImportPackage(parsed.pkg, 'json', parsed));
  }

  async function handleSceneDemoImport() {
    try {
      const response = await fetch('scene-classification-demo-450.json', { cache: 'no-store' });
      if (!response.ok) {
        setMessage(`演示包导入失败：HTTP ${response.status}`);
        return;
      }

      const text = await response.text();
      const parsed = parsePackageText(text, 'scene-classification-demo-450.json');
      if (!parsed.pkg) {
        setLastResult({
          package_id: 'scene-classification-demo-450.json',
          format: parsed.format,
          imported_cards: 0,
          skipped_duplicates: 0,
          imported_domain_packs: 0,
          errors: parsed.errors,
          warnings: parsed.warnings
        });
        setMessage('演示包导入失败：词卡包校验未通过。');
        return;
      }

      finish(onImportPackage(parsed.pkg, parsed.format, { errors: parsed.errors, warnings: parsed.warnings }));
    } catch (error) {
      setMessage(`演示包导入失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handlePersonalAcceptanceImport() {
    try {
      const fileName = 'janus-wordscape-core-acceptance-60.json';
      const response = await fetch(fileName, { cache: 'no-store' });
      if (!response.ok) {
        setMessage(`核心验收包导入失败：HTTP ${response.status}`);
        return;
      }

      const text = await response.text();
      const parsed = parsePackageText(text, fileName);
      if (!parsed.pkg) {
        setLastResult({
          package_id: fileName,
          format: parsed.format,
          imported_cards: 0,
          skipped_duplicates: 0,
          imported_domain_packs: 0,
          errors: parsed.errors,
          warnings: parsed.warnings
        });
        setMessage('核心验收包导入失败：词卡包校验未通过。');
        return;
      }

      finish(onImportPackage(parsed.pkg, parsed.format, { errors: parsed.errors, warnings: parsed.warnings }));
    } catch (error) {
      setMessage(`核心验收包导入失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-white" onClick={() => fileInputRef.current?.click()} type="button">
          <FileUp className="h-4 w-4" />
          选择文件
        </button>
        <input
          accept="application/json,.json,text/csv,.csv,.tsv"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
            event.currentTarget.value = '';
          }}
          ref={fileInputRef}
          type="file"
        />
        <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink" onClick={() => void handlePersonalAcceptanceImport()} type="button">
          导入核心验收包
        </button>
        <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink" onClick={() => void handleSceneDemoImport()} type="button">
          导入演示包
        </button>
        <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink" onClick={handleSampleImport} type="button">
          导入小样例
        </button>
      </div>
      {message ? <div className="rounded-xl bg-panel px-3 py-2 text-sm text-ink">{message}</div> : null}
      {lastResult ? (
        <>
          <IssueList issues={lastResult.errors} title="错误报告" />
          <IssueList issues={lastResult.warnings} title="导入提醒" />
        </>
      ) : null}
    </div>
  );
}

export default function SettingsView({
  data,
  persistenceStatus,
  userProfile,
  hasImportRollback,
  onImportPackage,
  onUpdatePlan,
  onUpdateUserProfile,
  onReset,
  onExport,
  onRestore,
  onRollbackLastImport
}: {
  data: AppData;
  persistenceStatus: PersistenceUiStatus;
  userProfile: UserProfile;
  hasImportRollback: boolean;
  onImportPackage: ImportPackageHandler;
  onUpdatePlan: (data: AppData['learning_plan']) => void;
  onUpdateUserProfile: (profile: UserProfile) => void;
  onReset: () => void;
  onExport: () => void;
  onRestore: (file: File) => void;
  onRollbackLastImport: () => void;
}) {
  const [plan, setPlan] = useState(data.learning_plan);
  const [openPanel, setOpenPanel] = useState<SettingsPanelKey | null>(null);
  const integrityReport = useMemo(() => buildIntegrityReport(data), [data]);
  const storageBudgetReport = useMemo(() => buildStorageBudgetReport(data), [data]);
  const healthText = statusLabel(integrityReport, storageBudgetReport);
  const latestImport = data.import_reports[0];

  useEffect(() => {
    setPlan(data.learning_plan);
  }, [data.learning_plan]);

  function togglePanel(panel: SettingsPanelKey) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <SettingsGroup title="常用">
      <SettingsCard
        active={openPanel === 'learning'}
        icon={SlidersHorizontal}
        onToggle={() => togglePanel('learning')}
        summary={`新学 ${plan.daily_new_limit} · 复习 ${plan.daily_review_limit} · 保持 ${Math.round(plan.target_retention * 100)}%`}
        title="学习规则"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="每天新学数量" min={0} onChange={(value) => setPlan({ ...plan, daily_new_limit: value })} value={plan.daily_new_limit} />
          <NumberField label="每天复习上限" min={0} onChange={(value) => setPlan({ ...plan, daily_review_limit: value })} value={plan.daily_review_limit} />
          <NumberField label="每天弱项巩固上限" min={0} onChange={(value) => setPlan({ ...plan, daily_weak_limit: value })} value={plan.daily_weak_limit} />
          <NumberField label="目标保持率" max={0.98} min={0.7} onChange={(value) => setPlan({ ...plan, target_retention: value })} step={0.01} value={plan.target_retention} />
          <NumberField label="最大复习间隔（天）" min={1} onChange={(value) => setPlan({ ...plan, maximum_interval_days: value })} value={plan.maximum_interval_days} />
          <NumberField label="遗忘后重学间隔（分钟）" min={1} onChange={(value) => setPlan({ ...plan, relearning_interval_minutes: value })} value={plan.relearning_interval_minutes} />
          <NumberField label="记忆难点阈值（Again 次数）" min={1} onChange={(value) => setPlan({ ...plan, leech_lapse_threshold: value })} value={plan.leech_lapse_threshold} />
          <label className="block">
            <span className="text-sm font-medium text-ink">复习排序</span>
            <select
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              onChange={(event) => setPlan({ ...plan, review_sort_order: event.target.value as AppData['learning_plan']['review_sort_order'] })}
              value={plan.review_sort_order}
            >
              <option value="low_retrievability">低可回忆率优先</option>
              <option value="due_date">到期时间优先</option>
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ToggleOption checked={plan.pause_new_cards} description="只复习到期卡，不加入新卡。" label="暂停新卡" onChange={(value) => setPlan({ ...plan, pause_new_cards: value })} />
          <ToggleOption checked={plan.review_weak_items} description="优先处理需要加强的词卡。" label="弱项巩固" onChange={(value) => setPlan({ ...plan, review_weak_items: value })} />
          <ToggleOption checked={plan.prioritize_overdue} description="优先处理已经逾期的复习。" label="逾期优先" onChange={(value) => setPlan({ ...plan, prioritize_overdue: value })} />
        </div>

        <button className="mt-4 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white" onClick={() => onUpdatePlan(plan)} type="button">
          保存学习规则
        </button>
      </SettingsCard>

      <SettingsCard active={openPanel === 'profile'} icon={UserRound} onToggle={() => togglePanel('profile')} summary={`${userProfile.nickname || DEFAULT_USER_NICKNAME} · 本地显示`} title="个人资料">
        <ProfilePanel profile={userProfile} onUpdate={onUpdateUserProfile} />
      </SettingsCard>

      <SettingsCard
        active={openPanel === 'backup'}
        icon={Database}
        onToggle={() => togglePanel('backup')}
        summary={`${data.cards.length} 张词卡 · ${data.packages.length} 个词卡包`}
        title="词卡与备份"
      >
        <ImportControls onImportPackage={onImportPackage} />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink" onClick={onExport} type="button">
            <Download className="h-4 w-4" />
            导出备份
          </button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink">
            <Upload className="h-4 w-4" />
            恢复备份
            <input
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onRestore(file);
                }
                event.currentTarget.value = '';
              }}
              type="file"
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!hasImportRollback}
            onClick={onRollbackLastImport}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            导入前快照
          </button>
        </div>
        <div className="mt-3 rounded-xl bg-panel p-3 text-sm leading-6 text-muted">
          最近导入：{latestImport ? `${latestImport.imported_cards} 张 · ${latestImport.format.toUpperCase()}` : '暂无导入记录'}
        </div>
      </SettingsCard>

      <SettingsCard active={openPanel === 'health'} icon={ShieldCheck} onToggle={() => togglePanel('health')} summary={`${healthText} · ${storageBudgetReport.estimated_mb} MB`} title="数据健康">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-panel p-3">
            <div className="text-xs text-muted">完整性</div>
            <div className="mt-1 text-lg font-semibold text-ink">{integrityReport.status === 'pass' ? '正常' : healthText}</div>
          </div>
          <div className="rounded-xl bg-panel p-3">
            <div className="text-xs text-muted">存储</div>
            <div className="mt-1 text-lg font-semibold text-ink">{storageBudgetReport.estimated_mb} MB</div>
          </div>
          <div className="rounded-xl bg-panel p-3">
            <div className="text-xs text-muted">错误 / 提醒</div>
            <div className="mt-1 text-lg font-semibold text-ink">
              {integrityReport.summary.errors} / {integrityReport.summary.warnings}
            </div>
          </div>
        </div>
        {integrityReport.issues.length > 0 ? (
          <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-line">
            {integrityReport.issues.slice(0, 30).map((issue, index) => (
              <div className="border-b border-line px-3 py-2 text-sm last:border-b-0" key={`${issue.code}-${issue.card_id ?? 'global'}-${index}`}>
                <div className="font-mono text-xs text-muted">{issue.code}</div>
                <p className="mt-1 text-muted">{issue.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand/5 px-3 py-2 text-sm text-brand">
            <CheckCircle2 className="h-4 w-4" />
            未发现完整性问题。
          </div>
        )}
      </SettingsCard>
      </SettingsGroup>

      <SettingsGroup title="说明">
      <SettingsCard active={openPanel === 'fsrs'} icon={Brain} onToggle={() => togglePanel('fsrs')} summary="ts-fsrs 5.4.0 · MIT" title="FSRS 记忆算法">
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted">本应用的记忆系统分两层：FSRS 负责正式复习调度；浏览触发式遗忘标记负责捕捉你在浏览中点开的陌生词。两者协同，但审计记录保持区分。</p>
          <CompactInfoList
            items={[
              {
                label: 'FSRS 正式评分',
                description: '记忆卡显示答案后，忘记、困难、良好、简单四个按钮是 FSRS 的核心输入。'
              },
              {
                label: '浏览触发式遗忘标记',
                description: '点击词卡列表表示不认识，系统写入 browser_detail + again，并把词卡加入今日待复习。'
              },
              {
                label: '协同关系',
                description: '你的规则负责发现陌生词；FSRS 负责正式复习后的下次间隔。browser_detail 不计入正式已复习。'
              },
              {
                label: '审计记录',
                description: "正式复习记录 scheduler='ts-fsrs'、scheduler_version='5.4.0'，便于以后追溯算法版本。"
              },
              {
                label: '版权声明',
                description: 'ts-fsrs 使用 MIT License；Copyright (c) 2026 Open Spaced Repetition。'
              }
            ]}
          />
        </div>
      </SettingsCard>

      <SettingsCard active={openPanel === 'about'} icon={Info} onToggle={() => togglePanel('about')} summary="本地优先 · 单词记忆 · 关系图谱" title="关于应用">
        <div className="space-y-3">
          <CompactInfoList
            items={[
              {
                label: '定位',
                description: '雅努斯词境 OS 是面向 AI 编程英语的个人词境记忆系统。'
              },
              {
                label: '核心路径',
                description: '按真实技术场景整理词卡，用 FSRS 安排复习，用图谱诊断为什么记不住。'
              },
              {
                label: '数据方式',
                description: '词卡、记忆状态和复习记录优先保存在本机 IndexedDB，并支持导出和恢复备份。'
              }
            ]}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-panel px-3 py-2 text-sm">
              <div className="text-xs text-muted">开发者</div>
              <div className="mt-0.5 font-semibold text-ink">{APP_DEVELOPER}</div>
            </div>
            <div className="rounded-xl bg-panel px-3 py-2 text-sm">
              <div className="text-xs text-muted">版本</div>
              <div className="mt-0.5 font-semibold text-ink">
                v{APP_VERSION} · 备份 v{BACKUP_SCHEMA_VERSION}
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard active={openPanel === 'manual'} icon={BookOpen} onToggle={() => togglePanel('manual')} summary="导入 · 学习 · 复习 · 图谱" title="操作手册">
        <CompactInfoList
          items={[
            {
              label: '1. 导入词卡',
              description: '在词卡与备份中选择 JSON、CSV 或 TSV 词卡包；导入前会校验字段并保留快照。'
            },
            {
              label: '2. 学习与浏览',
              description: '在单词本按场景进入子页；点击开始学习进入记忆卡，不点击则直接浏览词卡列表。'
            },
            {
              label: '3. 今日复习',
              description: '今日页只处理到期词卡；点击列表词卡标记不会后，也会进入今日待复习队列。'
            },
            {
              label: '4. 统计与图谱',
              description: '统计页看执行和薄弱场景；图谱页从场景、来源和关系重新理解难记词。'
            }
          ]}
        />
      </SettingsCard>
      </SettingsGroup>

      <SettingsGroup title="系统">
      <SettingsCard active={openPanel === 'advanced'} icon={Archive} onToggle={() => togglePanel('advanced')} summary={`本地存储：${persistenceLabels[persistenceStatus.source]}`} title="高级操作">
        <div className="rounded-xl bg-panel p-3 text-sm leading-6 text-muted">
          当前存储：{persistenceLabels[persistenceStatus.source]}。{persistenceStatus.error ? `错误：${persistenceStatus.error}` : '本地数据会优先保存到 IndexedDB。'}
        </div>
        <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand" onClick={onReset} type="button">
          <Archive className="h-4 w-4" />
          清空本地数据
        </button>
      </SettingsCard>
      </SettingsGroup>
    </div>
  );
}
