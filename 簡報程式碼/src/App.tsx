import { SlideDeck } from './components/SlideDeck'
import { useGlassJelly } from './hooks/useGlassJelly'

export default function App() {
  // 全站玻璃按鈕的果凍拖動（一組 document 事件委派）
  useGlassJelly()
  return <SlideDeck />
}
