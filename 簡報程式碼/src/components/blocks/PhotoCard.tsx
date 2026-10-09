import { Camera, Expand } from 'lucide-react'
import { useState } from 'react'
import type { PhotoBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { Lightbox } from '../ui/Lightbox'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 上課拍的照片：填滿卡片、下方一句說明；點一下全螢幕放大 */
export function PhotoCard({ block, mobile = false }: { block: PhotoBlock; mobile?: boolean }) {
  const [zoom, setZoom] = useState(false)
  const label = typeof block.caption === 'string' ? block.caption : block.alt
  return (
    <figure className={cn('flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-line bg-card', mobile ? '' : 'h-full')}>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`放大照片：${block.alt}`}
        className={cn('group relative min-h-0 cursor-zoom-in overflow-hidden', mobile ? 'h-[52vh] max-h-[420px]' : 'flex-1', focusRing)}
      >
        <img
          src={block.src}
          alt={block.alt}
          loading="lazy"
          decoding="async"
          className={cn('size-full transition-transform duration-300 group-hover:scale-[1.02]', block.fit === 'contain' ? 'object-contain' : 'object-cover')}
          style={block.position ? { objectPosition: block.position } : undefined}
        />
        {block.tag && (
          <span className={cn('absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-card/95 px-3 py-1 font-semibold text-slate-100', mobile ? 'text-[13px]' : 'text-[16px]')}>
            <Camera className="size-4" aria-hidden />
            {block.tag}
          </span>
        )}
        <span className={cn('absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-card/95 px-3 py-1 font-semibold text-slate-100', mobile ? 'text-[13px]' : 'text-[16px]')}>
          <Expand className="size-4" aria-hidden />
          點一下放大
        </span>
      </button>
      <figcaption className={cn('shrink-0 border-t border-line px-4 py-3 leading-snug text-slate-200', mobile ? 'text-[15px]' : 'text-[19px]')}>{block.caption}</figcaption>
      {zoom && <Lightbox src={block.src} label={label} onClose={() => setZoom(false)} />}
    </figure>
  )
}
