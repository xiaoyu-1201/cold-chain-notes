import { motion } from 'framer-motion'
import type { Block, GridBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { fadeUp, staggerParent } from '../ui/motion'
import { Compare, InfoCard, ItemList, Tiles, Timeline } from './Cards'
import { Checklist } from './Checklist'
import { CyclePanel, InsightCard, SectionPanel, TxvPanel } from './Composite'
import { CycleLesson } from './CycleLesson'
import { ConceptCard } from './ConceptCard'
import { DataTable } from './DataTable'
import { DiagnosisMatrix } from './DiagnosisMatrix'
import { Equation } from './Equation'
import { FlowSteps } from './FlowSteps'
import { AudioChapters, HotspotDiagram } from './Media'
import { Boundaries, Metrics, StatCard } from './Metrics'
import { PartsOverview, ProductMap, QAPanel, QuoteCard, ScenarioCard } from './Navigational'
import { EstimatePractice } from './Estimate'
import { CoilReader } from './CoilReader'
import { FenConverter } from './FenConverter'
import { VernierCaliper } from './VernierCaliper'
import { PhotoCard } from './PhotoCard'
import { ProductShowcase } from '../three/ProductShowcase'
import { Flashcards } from './Flashcards'
import { QuizCards } from './Quiz'
import { RefSlider } from './RefSlider'
import { AlertPanel, SizingPanel, TrapPanel } from './Warnings'

const renderChild = (child: Block, index: number) => <BlockRenderer key={index} block={child} />

/** 依資料層的區塊型別渲染對應元件 */
export function BlockRenderer({ block }: { block: Block }) {
  if (block.type === 'grid') {
    return (
      <motion.div
        variants={staggerParent}
        className={cn('grid h-full min-h-0 min-w-0', !block.className.includes('gap-') && 'gap-6', block.className)}
      >
        {block.children.map(renderChild)}
      </motion.div>
    )
  }
  return (
    <motion.div variants={fadeUp} className="h-full min-h-0 min-w-0">
      <Leaf block={block} />
    </motion.div>
  )
}

function Leaf({ block }: { block: Exclude<Block, GridBlock> }) {
  switch (block.type) {
    case 'section':
      return <SectionPanel block={block} renderChild={renderChild} />
    case 'insight':
      return <InsightCard block={block} renderChild={renderChild} />
    case 'concept':
      return <ConceptCard block={block} />
    case 'flow':
      return <FlowSteps block={block} />
    case 'alert':
      return <AlertPanel block={block} />
    case 'trap':
      return <TrapPanel block={block} />
    case 'sizing':
      return <SizingPanel block={block} />
    case 'equation':
      return <Equation block={block} />
    case 'metrics':
      return <Metrics block={block} />
    case 'stat':
      return <StatCard block={block} />
    case 'boundaries':
      return <Boundaries block={block} />
    case 'compare':
      return <Compare block={block} />
    case 'timeline':
      return <Timeline block={block} />
    case 'info':
      return <InfoCard block={block} />
    case 'list':
      return <ItemList block={block} />
    case 'tiles':
      return <Tiles block={block} />
    case 'matrix':
      return <DiagnosisMatrix block={block} />
    case 'checklist':
      return <Checklist block={block} />
    case 'parts':
      return <PartsOverview block={block} />
    case 'products':
      return <ProductMap block={block} />
    case 'scenario':
      return <ScenarioCard block={block} />
    case 'quote':
      return <QuoteCard block={block} />
    case 'qa':
      return <QAPanel block={block} />
    case 'txv':
      return <TxvPanel block={block} />
    case 'cycle':
      return <CyclePanel block={block} />
    case 'hotspots':
      return <HotspotDiagram block={block} />
    case 'audio':
      return <AudioChapters block={block} />
    case 'cycleLesson':
      return <CycleLesson />
    case 'quiz':
      return <QuizCards block={block} />
    case 'fen':
      return <FenConverter />
    case 'caliper':
      return <VernierCaliper />
    case 'coilreader':
      return <CoilReader />
    case 'showcase':
      return <ProductShowcase parts={block.parts} />
    case 'estimate':
      return <EstimatePractice block={block} />
    case 'flashcards':
      return <Flashcards block={block} />
    case 'refslider':
      return <RefSlider />
    case 'table':
      return <DataTable block={block} />
    case 'photo':
      return <PhotoCard block={block} />
  }
}
