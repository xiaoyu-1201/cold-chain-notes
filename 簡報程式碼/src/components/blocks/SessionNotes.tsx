import { ChevronDown, NotebookPen } from 'lucide-react'
import { Fragment, useRef, useState, type ReactNode } from 'react'
import { SESSION_NOTES } from '../../data/sessionNotes'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'

/**
 * 上課筆記（每次上課的單獨筆記，10/17）：電腦版左邊選哪一次＋段落目錄、右邊整份筆記；手機一段一段可以收合。
 * 只認筆記用到的 Markdown：## ###、- 清單（可縮排）、| 表格 |、> 引言、---、**粗體**、`字`。
 */
type Line = { depth: number; text: string }
type Part = { k: 'h3'; text: string } | { k: 'p'; text: string } | { k: 'quote'; text: string } | { k: 'list'; items: Line[] } | { k: 'table'; head: string[]; rows: string[][] }
interface Section {
  title: string
  parts: Part[]
}

const cells = (l: string) =>
  l
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

/** 一份筆記切成段落（## 一段；# 標題和 --- 不顯示） */
export function parseNote(md: string): Section[] {
  const out: Section[] = []
  let sec: Section = { title: '', parts: [] }
  const lines = md.replace(/\r/g, '').split('\n')
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (/^#\s/.test(l) || /^-{3,}\s*$/.test(l) || !l.trim()) continue
    if (/^##\s/.test(l)) {
      if (sec.title || sec.parts.length) out.push(sec)
      sec = { title: l.replace(/^##\s+/, ''), parts: [] }
    } else if (/^#{3,}\s/.test(l)) sec.parts.push({ k: 'h3', text: l.replace(/^#{3,}\s+/, '') })
    else if (/^>\s?/.test(l)) sec.parts.push({ k: 'quote', text: l.replace(/^>\s?/, '') })
    else if (/^\s*\|/.test(l)) {
      const rows: string[][] = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) rows.push(cells(lines[i]))
        i++
      }
      i--
      sec.parts.push({ k: 'table', head: rows[0] ?? [], rows: rows.slice(1) })
    } else if (/^\s*([-*]|\d+\.)\s/.test(l)) {
      const last = sec.parts[sec.parts.length - 1]
      const item = { depth: Math.floor((l.match(/^\s*/)?.[0].length ?? 0) / 2), text: l.replace(/^\s*([-*]|\d+\.)\s+/, '') }
      if (last?.k === 'list') last.items.push(item)
      else sec.parts.push({ k: 'list', items: [item] })
    } else sec.parts.push({ k: 'p', text: l.trim() })
  }
  if (sec.title || sec.parts.length) out.push(sec)
  return out
}

/** 行內：**粗體**、`字` */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, i) =>
    t.startsWith('**') && t.endsWith('**') ? (
      <b key={i} className="font-bold text-ink">
        {t.slice(2, -2)}
      </b>
    ) : t.startsWith('`') && t.endsWith('`') ? (
      <code key={i} className="rounded bg-white/[0.07] px-1">
        {t.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{t}</Fragment>
    ),
  )
}

function Parts({ parts, mobile }: { parts: Part[]; mobile?: boolean }) {
  const body = mobile ? 'text-[15px] leading-relaxed' : 'text-[20px] leading-relaxed'
  return (
    <div className={cn('flex flex-col text-slate-200 [overflow-wrap:anywhere]', mobile ? 'gap-2.5' : 'gap-3')}>
      {parts.map((p, i) =>
        p.k === 'h3' ? (
          <h4 key={i} className={cn('font-bold text-sky-200', mobile ? 'mt-1 text-[16px]' : 'mt-2 text-[22px]')}>
            {inline(p.text)}
          </h4>
        ) : p.k === 'quote' ? (
          <p key={i} className={cn('border-l-4 border-amber-500/60 pl-3 text-slate-300', body)}>
            {inline(p.text)}
          </p>
        ) : p.k === 'p' ? (
          <p key={i} className={body}>
            {inline(p.text)}
          </p>
        ) : p.k === 'list' ? (
          <ul key={i} className={cn('flex flex-col gap-1', body)}>
            {p.items.map((it, k) => (
              <li key={k} className="flex gap-2" style={{ paddingLeft: `${it.depth * (mobile ? 14 : 22)}px` }}>
                <span aria-hidden className="shrink-0 text-slate-500">
                  {it.depth ? '◦' : '•'}
                </span>
                <span className="min-w-0">{inline(it.text)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <table key={i} className={cn('w-full table-fixed border-collapse', mobile ? 'text-[13px]' : 'text-[19px]')}>
            <thead>
              <tr>
                {p.head.map((h, k) => (
                  <th key={k} className="border border-line bg-white/[0.05] px-2 py-1.5 text-left font-bold text-ink">
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.rows.map((r, k) => (
                <tr key={k}>
                  {r.map((c, j) => (
                    <td key={j} className="border border-line px-2 py-1.5 align-top leading-snug">
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      )}
    </div>
  )
}

export function SessionNotes({ mobile = false }: { mobile?: boolean }) {
  const [id, setId] = useStickyState('notes:session', SESSION_NOTES[0]?.id ?? '')
  const note = SESSION_NOTES.find((n) => n.id === id) ?? SESSION_NOTES[0]
  const scroller = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(0)
  if (!note) return <p className="text-slate-400">還沒有上課筆記。</p>
  const secs = parseNote(note.md) // shortcut: 每次 render 都解析，筆記才幾 KB；變很多份再 useMemo

  const picker = SESSION_NOTES.length > 1 && (
    <div className={cn('flex flex-wrap', mobile ? 'gap-1.5' : 'gap-2')}>
      {SESSION_NOTES.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => {
            setId(n.id)
            setOpen(0)
            scroller.current?.scrollTo({ top: 0 })
          }}
          aria-pressed={n.id === note.id}
          className={cn('min-h-11 rounded-full border px-4 font-semibold', mobile ? 'text-[14px]' : 'text-[20px]', n.id === note.id ? 'border-sky-500 bg-sky-950 text-sky-100' : 'border-line bg-card text-slate-200')}
        >
          {n.id.replace(/\s*上課筆記$/, '')}
        </button>
      ))}
    </div>
  )

  if (mobile)
    return (
      <div className="flex flex-col gap-3">
        {picker}
        {secs.map((s, i) => (
          <section key={i} className="rounded-2xl border border-line bg-card">
            <button
              type="button"
              onClick={(e) => {
                setOpen(open === i ? -1 : i)
                // 前一段很長、收起來之後，點的這段會跑到畫面上方看不到：捲回來（10/17 QA）
                const sec = e.currentTarget.parentElement
                requestAnimationFrame(() => sec?.scrollIntoView({ block: 'nearest' }))
              }}
              aria-expanded={open === i}
              className="flex min-h-12 w-full scroll-mt-20 items-center gap-2 px-4 py-2 text-left"
            >
              <span className="min-w-0 flex-1 text-[16px] font-bold text-ink">{s.title || '總覽'}</span>
              <ChevronDown className={cn('size-5 shrink-0 text-slate-400 transition', open === i && 'rotate-180')} aria-hidden />
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <Parts parts={s.parts} mobile />
              </div>
            )}
          </section>
        ))}
      </div>
    )

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] gap-6">
      <nav aria-label="這份筆記的段落" className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-[18px] border border-line bg-card p-4" data-no-swipe>
        {picker}
        <p className="flex items-center gap-2 text-[20px] font-bold text-slate-300">
          <NotebookPen className="size-5 text-emerald-300" aria-hidden />
          段落
        </p>
        {secs.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scroller.current?.querySelector(`[data-sec="${i}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })}
            className="min-h-11 rounded-xl px-3 py-1.5 text-left text-[20px] font-semibold leading-snug text-slate-200 hover:bg-white/[0.05]"
          >
            {s.title || '總覽'}
          </button>
        ))}
      </nav>
      <div ref={scroller} className="min-h-0 overflow-y-auto overscroll-contain rounded-[18px] border border-line bg-card px-8 py-6 [scrollbar-width:thin]" data-no-swipe>
        {secs.map((s, i) => (
          <section key={i} data-sec={i} className="mb-8 scroll-mt-4">
            {s.title && <h3 className="mb-3 text-[26px] font-bold text-ink">{s.title}</h3>}
            <Parts parts={s.parts} />
          </section>
        ))}
      </div>
    </div>
  )
}
