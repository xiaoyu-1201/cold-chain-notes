import type { Part, PartId } from './types'

export const parts: Record<PartId, Part> = {
  intro: {
    id: 'intro',
    ordinal: '開場',
    title: '簡報導覽',
    label: '開場：簡報導覽',
    short: '導覽',
    tone: 'ice',
  },
  industry: {
    id: 'industry',
    ordinal: '第零篇',
    title: '產業認識篇',
    label: '第零篇：產業認識篇',
    short: '產業篇',
    tone: 'violet',
  },
  basics: {
    id: 'basics',
    ordinal: '第一篇',
    title: '基礎熱工篇',
    label: '第一篇：基礎熱工篇',
    short: '基礎篇',
    tone: 'teal',
  },
  components: {
    id: 'components',
    ordinal: '第二篇',
    title: '系統核心元件篇',
    label: '第二篇：系統核心元件篇',
    short: '元件篇',
    tone: 'ice',
  },
  practice: {
    id: 'practice',
    ordinal: '第三篇',
    title: '庫房工程實務篇',
    label: '第三篇：庫房工程實務篇',
    short: '庫房實務',
    tone: 'indigo',
  },
  summary: {
    id: 'summary',
    ordinal: '結語',
    title: '總結與互動',
    label: '結語：總結與互動',
    short: '總結',
    tone: 'emerald',
  },
}
