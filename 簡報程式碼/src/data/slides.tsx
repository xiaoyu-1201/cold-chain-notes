import {
  Ban,
  Boxes,
  Building2,
  Calculator,
  Camera,
  CircleCheck,
  ClipboardList,
  Clock,
  Cog,
  CookingPot,
  Cpu,
  Cylinder,
  DoorOpen,
  Droplets,
  Factory,
  Fan,
  Fish,
  Flame,
  Gauge,
  GraduationCap,
  Handshake,
  HardHat,
  History,
  Layers,
  Lightbulb,
  MessagesSquare,
  Package,
  Plug,
  PowerOff,
  RefreshCw,
  Route,
  Ruler,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Ship,
  ShoppingCart,
  SlidersHorizontal,
  Snowflake,
  Stethoscope,
  Store,
  Syringe,
  Target,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
  Warehouse,
  Waypoints,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'
import handoutImg from '../assets/1001-handout.jpg'
import refrigerantTableImg from '../assets/refrigerant-table.jpg'
import { Danger, Em, Exp, Frac, Hl, Sub, Warn } from '../components/ui/rich'
import { CLASS_AUDIO, CLASS_AUDIO_2, CLASS_AUDIO_3, CLASS_AUDIO_4, CLASS_AUDIO_5 } from './media'
import type { SlideData } from './types'

/** 各頁定義（定義順序不等於顯示順序，顯示順序見檔案最後的 ORDER） */
const slideList: SlideData[] = [
  /* ───────────────────────── 01 封面 ───────────────────────── */
  {
    id: 'cover',
    part: 'intro',
    layout: 'cover',
    title: '氣冷式冷凍冷藏系統',
    cover: {
      kicker: 'Air-Cooled Refrigeration · Engineering Training',
      titleLead: '氣冷式',
      titleAccent: '冷凍冷藏系統',
      subtitle: '技術核心解析與新人培訓實務手冊',
      audience: '冷凍材料行新人全方位培訓：產業 × 產品 × 原理 × 門市實戰',
      source: '依據一丞工程手冊架構提煉',
      tags: [
        { label: '工程培訓', icon: GraduationCap },
        { label: '冷凍循環', icon: RefreshCw },
        { label: '系統調校', icon: SlidersHorizontal },
        { label: '故障診斷', icon: Stethoscope },
        { label: '門市實戰', icon: Store },
      ],
    },
    blocks: [],
    conclusion: {
      label: '引言',
      text: (
        <>
          建立<Hl>熱力動態平衡思維</Hl>，掌握冷鏈工程底層邏輯。
        </>
      ),
    },
  },

  /* ───────────────────────── 02 老闆開場 ───────────────────────── */
  {
    id: 'owner',
    source: 'extra',
    part: 'intro',
    mark: 'WELCOME',
    title: '老闆開場：新人要懂的三件事',
    en: "Owner's Briefing",
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[auto_minmax(0,1fr)_auto]',
        children: [
          {
            type: 'quote',
            text: (
              <>
                我們賣的不是零件，是讓客戶的冷庫<Hl>「不停機」</Hl>。
              </>
            ),
            author: '冷凍材料行老闆的第一堂課',
          },
          {
            type: 'grid',
            className: 'grid-cols-3',
            children: [
              {
                type: 'info',
                icon: Boxes,
                tone: 'violet',
                title: '懂產品｜材料專家',
                en: 'Product Know-how',
                body: '熟悉品項、規格與替代料號，客人一開口就知道要拿什麼、缺貨時能給替代方案。',
              },
              {
                type: 'info',
                icon: Handshake,
                tone: 'emerald',
                title: '懂客戶｜技術夥伴',
                en: 'Customer Partner',
                body: '聽得懂技師的語言，先問對問題、再給對零件，減少退換貨與技師白跑一趟。',
              },
              {
                type: 'info',
                icon: Lightbulb,
                tone: 'ice',
                title: '懂原理｜冷鏈顧問',
                en: 'System Thinking',
                body: '看懂熱力循環，才能判斷「真正的問題」在哪，而不只是把東西賣出去。',
              },
            ],
          },
          {
            type: 'timeline',
            icon: GraduationCap,
            tone: 'violet',
            title: '新人成長路線',
            en: 'Growth Path',
            items: [
              { gen: '第 1 週', example: '認識品項與庫位', note: '貨架、料號、常用規格', tone: 'slate' },
              { gen: '第 1 個月', example: '會接單問診', note: '接單六問、開單不出錯', tone: 'teal' },
              { gen: '第 3 個月', example: '看懂系統', note: '冷媒一圈、單位、故障判讀', tone: 'ice' },
              { gen: '半年', example: '協助選型報價', note: '新建庫房整套配料', tone: 'emerald' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '老闆叮嚀',
      text: (
        <>
          客戶信任我們，是因為我們<Hl>問對問題、給對零件</Hl>——技術，就是材料行最好的服務。
        </>
      ),
    },
  },

  /* ───────────────────────── 03 簡報架構 ───────────────────────── */
  {
    id: 'overview',
    part: 'intro',
    mark: 'PATH',
    title: '學習地圖：照這個順序學',
    en: 'Learning Path',
    blocks: [
      {
        type: 'parts',
        items: [
          {
            part: 'basics',
            no: '01',
            range: '先懂一圈',
            icon: RefreshCw,
            summary: '先看全貌，再補名詞與冷媒',
            chapters: [
              { code: '圖解', title: '冷凍循環一圈', slide: 'cycle-lesson' },
              { code: '行程', title: '四大行程', slide: 'strokes' },
            ],
          },
          {
            part: 'units',
            no: '02',
            range: '管徑・溫壓',
            icon: Ruler,
            summary: '管徑「分」換算、溫度與壓力',
            chapters: [
              { code: '單位', title: '分、溫度壓力', slide: 'units' },
              { code: 'App', title: 'Ref Tools 網頁版', slide: 'reftools' },
              { code: '速查', title: '常用冷媒速查表', slide: 'reftable' },
              { code: '冷媒', title: '冷媒演進與冷凍油', slide: 'refrigerants' },
            ],
          },
          {
            part: 'industry',
            no: '03',
            range: '客人用在哪',
            icon: Store,
            summary: '產業鏈位置與應用場所',
            chapters: [{ code: '產業', title: '產業鏈與客人的裝置', slide: 'industry' }],
          },
          {
            part: 'components',
            no: '04',
            range: '壓縮機 → 零件',
            icon: Cog,
            summary: '從貨架地圖出發，逐一認識元件',
            chapters: [
              { code: '地圖', title: '店內產品地圖', slide: 'products' },
              { code: 'CH.02', title: '壓縮機', slide: 'ch2' },
              { code: 'CH.03', title: '冷凝器', slide: 'ch3' },
              { code: 'CH.04', title: '蒸發器', slide: 'ch4' },
              { code: 'CH.05', title: '控制與保護', slide: 'ch5' },
              { code: '講義', title: '零件總覽圖', slide: 'handout' },
            ],
          },
          {
            part: 'practice',
            no: '05',
            range: '問診・故障',
            icon: Stethoscope,
            summary: '接單問診與常見故障',
            chapters: [
              { code: 'CH.09', title: '四大故障診斷', slide: 'ch9' },
              { code: '實戰', title: '接單問診 SOP', slide: 'sop' },
            ],
          },
        ],
        finale: {
          label: '學完之後',
          links: [
            { title: '聽原音複習', slide: 'recording' },
            { title: '自我檢測', slide: 'quiz' },
            { title: '課後 Insight', slide: 'lesson-insights' },
            { title: '第二階段：進階', slide: 'ch6' },
          ],
          note: (
            <>
              數值依據一丞工程手冊；標
              <Exp />
              者為手冊未列的業界常用參考值
            </>
          ),
        },
      },
    ],
    conclusion: {
      label: '學習順序',
      text: (
        <>
          照老闆說的順序：<Hl>原理 → 單位 → 裝置 → 壓縮機 → 零配件</Hl>，每一步都踩在前一步上；計算與調校是第二階段（進階），基礎熟了再學。
        </>
      ),
    },
  },

  /* ───────────────────────── 04 產業全景 ───────────────────────── */
  {
    id: 'industry',
    source: 'extra',
    part: 'industry',
    chapter: '產業全景',
    mark: 'INDUSTRY',
    title: '冷鏈產業鏈與我們的位置',
    en: 'Cold-Chain Industry Map',
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[auto_minmax(0,1fr)]',
        children: [
          {
            type: 'flow',
            direction: 'row',
            icon: Workflow,
            tone: 'violet',
            title: '冷鏈產業鏈',
            en: 'Supply Chain',
            steps: [
              { icon: Factory, title: '原廠製造', desc: '壓縮機、閥件、冷媒、銅管', tone: 'slate' },
              { icon: Ship, title: '代理 / 進口商', desc: '品牌代理、大宗進口', tone: 'slate' },
              {
                icon: Store,
                title: '冷凍材料行',
                tag: '我們',
                desc: '備貨庫存・技術諮詢・急件調貨・規格替代',
                tone: 'emerald',
              },
              { icon: Wrench, title: '工程行 / 技師', desc: '安裝、維修、定期保養', tone: 'ice' },
              { icon: Building2, title: '終端用戶', desc: '餐飲、超市、冷鏈、工廠', tone: 'indigo' },
            ],
          },
          {
            type: 'grid',
            className: 'grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'tiles',
                icon: Building2,
                tone: 'indigo',
                title: '終端應用市場',
                en: 'End Markets',
                cols: 3,
                items: [
                  { icon: UtensilsCrossed, title: '餐飲廚房', desc: '冷凍冷藏櫃、製冰機、小型冷庫' },
                  { icon: ShoppingCart, title: '超市便利店', desc: '開放式展示櫃、冷凍島櫃' },
                  { icon: Truck, title: '冷鏈物流', desc: '低溫倉儲、冷凍配送車' },
                  { icon: Fish, title: '農漁產業', desc: '預冷庫、漁船冷凍艙' },
                  { icon: CookingPot, title: '食品加工', desc: '急速冷凍、加工冷藏' },
                  { icon: Syringe, title: '醫療生技', desc: '藥品與疫苗冷藏' },
                ],
              },
              {
                type: 'list',
                icon: Users,
                tone: 'emerald',
                title: '三類來店客戶',
                en: 'Who Walks In',
                items: [
                  {
                    icon: HardHat,
                    title: '工程行 / 技師',
                    desc: '他們要「快、準、齊」：急件要快、規格要對、品項要齊；多半是月結客戶',
                    badge: { label: '主力', tone: 'emerald' },
                  },
                  {
                    icon: UserRound,
                    title: '設備業主 / 店家',
                    desc: '自己來買零件或報修；要耐心引導，必要時介紹技師',
                  },
                  {
                    icon: ClipboardList,
                    title: '新建 / 改造專案',
                    desc: '要整套選型、報價和交期規劃，交給業務接手',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          產業鏈裡我們<Hl>最貼近技師</Hl>：技師的時間就是金錢，備對貨、答對問題，就是材料行的核心競爭力。
        </>
      ),
    },
  },

  /* ───────────────────────── 05 產品地圖 ───────────────────────── */
  {
    id: 'products',
    source: 'extra',
    part: 'components',
    chapter: '產品地圖',
    mark: 'PRODUCTS',
    title: '店內產品地圖：貨架對應冷凍循環',
    en: 'Store Product Map',
    blocks: [
      {
        type: 'products',
        items: [
          {
            icon: Cog,
            tone: 'red',
            title: '壓縮機',
            en: 'Compressor',
            items: '全密閉 / 半密閉；往復式、渦卷式、迴轉式',
            side: '高低壓分界',
            chapter: '第 2 章',
            slide: 'ch2',
          },
          {
            icon: Fan,
            tone: 'amber',
            title: '冷凝器 / 冷凝機組',
            en: 'Condensing Unit',
            items: '氣冷冷凝器、室外機組、散熱風扇馬達',
            side: '高壓側',
            chapter: '第 3 章',
            slide: 'ch3',
          },
          {
            icon: Snowflake,
            tone: 'ice',
            title: '蒸發器 / 冷風機',
            en: 'Unit Cooler',
            items: '吊頂冷風機、除霜電熱管、蒸發器風扇',
            side: '低壓側',
            chapter: '第 4 章',
            slide: 'ch4',
          },
          {
            icon: SlidersHorizontal,
            tone: 'teal',
            title: '膨脹閥與控制閥',
            en: 'Control Valves',
            items: '感溫膨脹閥 / 閥芯、電磁閥、壓力調節閥',
            side: '高低壓分界',
            chapter: '第 5 章',
            slide: 'ch5',
          },
          {
            icon: ShieldCheck,
            tone: 'teal',
            title: '保護配件',
            en: 'Accessories',
            items: '乾燥過濾器、視液鏡、液氣分離器、儲液器、油分離器',
            side: '全系統',
            chapter: '第 5 章',
            slide: 'ch5',
          },
          {
            icon: Droplets,
            tone: 'indigo',
            title: '冷媒與冷凍油',
            en: 'Refrigerant & Oil',
            items: 'R404A、R134a、R448A、R22（維修）；POE / 礦物油',
            side: '循環工質',
            chapter: '冷媒',
            slide: 'refrigerants',
          },
          {
            icon: Waypoints,
            tone: 'amber',
            title: '銅管與保溫',
            en: 'Piping & Insulation',
            items: '英制銅管、銅配件、橡塑保溫管',
            side: '全系統',
            chapter: '第 2 章',
            slide: 'ch2',
          },
          {
            icon: Cpu,
            tone: 'violet',
            title: '電控與溫控',
            en: 'Controls',
            items: '微電腦溫控器、高低壓開關、除霜定時器、接觸器',
            side: '控制迴路',
            chapter: '第 5 章',
            slide: 'ch5',
          },
          {
            icon: Wrench,
            tone: 'slate',
            title: '工具與耗材',
            en: 'Tools',
            items: '雙錶組、真空泵、回收機、擴管器、銀焊條、氮氣',
            side: '施工維修',
            chapter: '第 9 章',
            slide: 'ch9',
          },
          {
            icon: Warehouse,
            tone: 'emerald',
            title: '庫房工程材料',
            en: 'Cold Room',
            items: 'PU 庫板、冷庫門、門簾、照明、溫度記錄器',
            side: '庫體',
            chapter: '第 7–8 章',
            slide: 'ch7-8',
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          每一個料號都對應循環中的一個位置——<Hl>懂原理</Hl>，才知道客人真正需要的是哪一顆零件。
        </>
      ),
    },
  },

  /* ───────────────────────── 08 第 2 章 ───────────────────────── */
  {
    id: 'ch2',
    source: 'handbook',
    part: 'components',
    chapter: '第 2 章',
    title: '系統心臟——壓縮機',
    en: 'Compressor',
    store: {
      products: ['全密閉壓縮機', '半密閉壓縮機', '冷凍油', '乾燥過濾器'],
      tip: (
        <>
          客人要換壓縮機，一定要問：冷媒、電源（單相或三相）、<Em>低溫機或高溫機</Em>、馬力，最好看原機銘牌；壓縮機燒毀的案子，要一起換乾燥過濾器。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1.3fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'concept',
                icon: Gauge,
                tone: 'ice',
                title: (
                  <>
                    容積效率 η<Sub>v</Sub> 與壓比 R<Sub>c</Sub>
                  </>
                ),
                en: 'Volumetric Efficiency & Compression Ratio',
                formula: {
                  lhs: (
                    <>
                      R<Sub>c</Sub>
                    </>
                  ),
                  rhs: '排氣絕對壓力 ÷ 吸氣絕對壓力',
                },
                points: [
                  <>
                    汽缸裡殘留的高壓氣體（<Hl>餘隙容積</Hl>）要先膨脹回低壓，吸氣閥才會打開。
                  </>,
                  <>
                    壓比越高，這段膨脹占掉的行程越多，能吸進的新氣體越少，效率<Warn>急劇下降</Warn>。
                  </>,
                ],
                chain: [
                  <>
                    壓比 R<Sub>c</Sub> ↑
                  </>,
                  '餘隙再膨脹佔比 ↑',
                  '有效吸氣行程 ↓',
                  <>
                    η<Sub>v</Sub> 急劇下降
                  </>,
                ],
              },
              {
                type: 'metrics',
                icon: Droplets,
                tone: 'teal',
                title: '回油速度規範',
                en: 'Oil Return Velocity',
                cols: 2,
                items: [
                  { label: '水平管', value: '> 4', unit: 'm/s', tone: 'teal', note: '冷凍油隨氣流帶回' },
                  { label: '垂直上升立管', value: '> 8', unit: 'm/s', tone: 'ice', note: '克服重力把油往上推' },
                ],
                footnote: (
                  <>
                    管內氣體流速要夠快，才能把冷凍油帶回壓縮機的曲軸箱。
                    <Exp />
                  </>
                ),
              },
            ],
          },
          {
            type: 'alert',
            title: '兩大運轉紅線',
            en: 'Operating Red Lines',
            items: [
              {
                icon: ThermometerSun,
                title: '排氣溫度極限',
                value: '≤ 107°C',
                desc: (
                  <>
                    在排氣管離壓縮機 <Em>約 15 cm（6 吋）處</Em>量，不可超過 107°C；冷凍油超過 148°C
                    即碳化。
                  </>
                ),
              },
              {
                icon: Ban,
                title: '嚴禁液壓縮',
                value: '只吃氣',
                desc: (
                  <>
                    壓縮機只能壓氣體；液體進去會<Em>直接打壞閥片和連桿</Em>。
                  </>
                ),
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          壓縮機<Hl>只吃氣不吃液</Hl>。壓比越大，效率越差；現場維護要守住<Hl>排氣溫度</Hl>和<Hl>吸氣過熱度</Hl>。
        </>
      ),
    },
  },

  /* ───────────────────────── 09 第 3 章 ───────────────────────── */
  {
    id: 'ch3',
    source: 'handbook',
    part: 'components',
    chapter: '第 3 章',
    title: '散熱之肺——氣冷式冷凝器',
    en: 'Air-Cooled Condenser',
    store: {
      products: ['冷凝機組', '風扇馬達', '風扇調速器', '鰭片清洗劑'],
      tip: (
        <>
          夏天高壓跳機：先建議客人清洗鰭片、檢查風扇；冬天低壓跳機：推薦風扇壓力開關、調速器或<Em>冷凝壓力調整閥</Em>。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[minmax(0,1.2fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'equation',
                icon: Flame,
                tone: 'amber',
                title: '總排熱量 THR',
                en: 'Total Heat of Rejection',
                result: { symbol: 'THR', label: '冷凝器總排熱量', tone: 'amber' },
                terms: [
                  {
                    symbol: (
                      <>
                        Q<Sub>o</Sub>
                      </>
                    ),
                    label: '蒸發器吸熱量',
                    tone: 'ice',
                  },
                  {
                    symbol: (
                      <>
                        W<Sub>e</Sub>
                      </>
                    ),
                    label: '壓縮機輸入功率熱當量',
                    tone: 'violet',
                  },
                ],
                highlight: '≈ × 1.3',
                note: (
                  <>
                    手冊例題裡，冷凝器要排的熱約是冷凍能力的 <Hl>1.3 倍</Hl>（多了壓縮機做功的熱）；選冷凝器不能只看庫內吸熱量。
                  </>
                ),
              },
              {
                type: 'metrics',
                icon: Thermometer,
                tone: 'teal',
                title: '設計溫差 TD',
                en: 'Condenser Design TD',
                cols: 1,
                formula: { lhs: 'TD', rhs: '冷凝溫度 − 環境進風溫度' },
                items: [
                  {
                    label: '氣冷式一般取值',
                    value: '7 ~ 12',
                    unit: '°C',
                    tone: 'teal',
                    note: '例：外氣 35°C + TD 12°C → 冷凝溫度 47°C',
                  },
                ],
              },
            ],
          },
          {
            type: 'trap',
            icon: ThermometerSnowflake,
            title: '冬季低冷凝壓力陷阱',
            en: 'Winter Low Head-Pressure Trap',
            chain: ['冬季外溫過低', '高壓驟降', '膨脹閥前後壓差不足', '供液不足', '低壓過低跳脫'],
            fixes: ['冷凝風扇壓力開關', '變頻調速器', '冷凝壓力調整閥'],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          選冷凝器要看 <Hl>THR（總排熱量）</Hl>。氣冷機組「<Warn>夏天怕散熱不良、高壓跳機</Warn>，<Hl>冬天怕散熱太好、低壓供液不足</Hl>」。
        </>
      ),
    },
  },

  /* ───────────────────────── 10 第 4 章 ───────────────────────── */
  {
    id: 'ch4',
    source: 'handbook',
    part: 'components',
    chapter: '第 4 章',
    title: '吸熱核心——蒸發器與除霜',
    en: 'Evaporator & Defrost',
    store: {
      products: ['冷風機', '除霜電熱管', '溫度感測器', '風扇馬達'],
      tip: (
        <>
          客人說「蒸發器結冰很厚」：先問除霜設定，常見是<Em>電熱管燒斷或感測器失效</Em>，不一定要換整台蒸發器。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[minmax(0,1.4fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'compare',
                icon: Droplets,
                tone: 'ice',
                title: '溫差 TD 與庫內濕度 RH 連動',
                en: 'TD ↔ Relative Humidity',
                axis: ['TD ↑', '除濕 ↑', 'RH ↓'],
                left: {
                  badge: '小 TD',
                  value: '≈ 5°C',
                  tone: 'teal',
                  rows: [
                    { k: '盤管表面', v: '結霜少、除濕弱' },
                    { k: '庫內濕度', v: <Hl>約 90% RH</Hl> },
                    { k: '80% RH 時', v: 'TD 取 5 ~ 7°C（水果、蛋、肉、魚）' },
                  ],
                  use: '適合蔬菜、鮮花：不容易乾掉、失重',
                },
                right: {
                  badge: '大 TD',
                  value: '8 ~ 10°C',
                  tone: 'indigo',
                  rows: [
                    { k: '盤管表面', v: '熱交換快、除濕強' },
                    { k: '庫內濕度', v: <Hl>65 ~ 70% RH</Hl> },
                  ],
                  use: '適合鮮奶、飲料、包裝好的冷凍食品',
                },
              },
              {
                type: 'metrics',
                icon: Layers,
                tone: 'ice',
                title: '鰭片間距',
                en: 'Fin Pitch',
                cols: 1,
                items: [
                  { label: '冷藏庫', value: '4 ~ 6', unit: 'mm', tone: 'teal' },
                  { label: '低溫庫', value: '6 ~ 9', unit: 'mm 以上', tone: 'indigo' },
                ],
                footnote: (
                  <>
                    低溫庫間距大，是為了預留結霜的風道空間。手冊只說明蒸發器鰭片距離較大，並無具體數值。
                    <Exp />
                  </>
                ),
              },
            ],
          },
          {
            type: 'flow',
            direction: 'row',
            icon: ShieldCheck,
            tone: 'emerald',
            title: '除霜三大安全防線',
            en: 'Defrost Safety Lines',
            steps: [
              {
                icon: Timer,
                title: '定時啟動',
                desc: (
                  <>
                    定時器啟動除霜（如每 6 小時一次）
                    <Exp />
                  </>
                ),
              },
              {
                icon: ThermometerSnowflake,
                title: '溫度強制終止',
                desc: (
                  <>
                    蒸發器回溫到設定值（如 8～10°C），感溫器就切斷電熱管；感溫器要裝在結霜最厚、離電熱管遠的地方
                    <Exp />
                  </>
                ),
              },
              {
                icon: Fan,
                title: '風扇延遲 Fan Delay',
                desc: (
                  <>
                    除霜後風扇延遲啟動（如 2 ~ 3 分鐘），防止蒸發器的熱被吹進庫內
                    <Exp />
                  </>
                ),
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          選蒸發器要看庫內需要的<Hl>濕度</Hl>和<Hl>結霜快慢</Hl>。除霜控制要做到三件事：<Hl>定時啟動、到溫停止、風扇延遲</Hl>。
        </>
      ),
    },
  },

  /* ───────────────────────── 11 第 5 章 ───────────────────────── */
  {
    id: 'ch5',
    source: 'handbook',
    part: 'components',
    chapter: '第 5 章',
    title: '神經與防護——控制與保護閥件',
    en: 'Controls & Protection',
    store: {
      products: ['膨脹閥 / 閥芯', '電磁閥', '視液鏡', '高低壓開關'],
      tip: (
        <>
          客人要買膨脹閥，先問：冷媒、蒸發溫度、冷凍能力、<Em>閥前後壓差（要扣掉管路壓損）</Em>。閥芯選太大會忽開忽關、運轉不穩；選太小則供液不夠、庫溫降不下來。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[minmax(0,1fr)_auto]',
        children: [
          {
            type: 'grid',
            className: 'grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]',
            children: [
              {
                type: 'txv',
                icon: SlidersHorizontal,
                tone: 'ice',
                title: '感溫膨脹閥 TXV',
                en: 'Thermostatic Expansion Valve',
                rules: [
                  {
                    icon: Workflow,
                    tone: 'ice',
                    title: '一律使用外部均壓型',
                    desc: '蒸發器有分液頭，或管路壓降大時，一律用外部均壓型膨脹閥。',
                  },
                  {
                    icon: CircleCheck,
                    tone: 'emerald',
                    title: '依管徑決定方位',
                    desc: '感溫包綁在吸氣管的位置看管徑：1/2～5/8″ 綁 1 點鐘、3/4～7/8″ 綁 2 點鐘、1～1¼″ 綁 3 點鐘。',
                  },
                  {
                    icon: Ban,
                    tone: 'red',
                    title: '避開 6 點鐘正下方',
                    desc: (
                      <>
                        管子底部積有冷凍油，綁在 6 點鐘感溫會遲鈍；感溫包要緊貼管子並包保溫。
                        <Exp />
                      </>
                    ),
                  },
                ],
              },
              {
                type: 'grid',
                className: 'grid-rows-2 gap-4',
                children: [
                  {
                    type: 'info',
                    icon: Gauge,
                    tone: 'teal',
                    title: '曲軸箱壓力調節閥（CPR）',
                    body: '剛開機降溫或除霜完時，吸氣壓力偏高；CPR 限制吸氣壓力，避免壓縮機馬達超載燒毀。',
                    meta: '裝在吸氣管、壓縮機入口前',
                  },
                  {
                    type: 'info',
                    icon: ShieldCheck,
                    tone: 'ice',
                    title: '其他保護零件',
                    body: '液氣分離器、儲液器、油分離器、壓力開關：到「① 原理」的核心圖解點零件，就能看說明、聽錄音、看 3D 構造。',
                  },
                ],
              },
            ],
          },
          {
            type: 'flow',
            direction: 'row',
            compact: true,
            icon: PowerOff,
            tone: 'indigo',
            title: '抽空停機',
            en: 'Pump Down',
            steps: [
              { title: '溫控到溫' },
              { title: '關閉供液電磁閥' },
              { title: '壓縮機抽空低壓' },
              { title: '低壓開關停機' },
            ],
            result: { label: '目的', text: '停機前先把低壓側的冷媒抽走，避免冷媒跑進壓縮機、稀釋冷凍油' },
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          控制件是系統的神經。沒有<Hl>抽空停機（Pump Down）</Hl>和<Hl>液氣分離器</Hl>，壓縮機隨時可能被<Warn>液態冷媒打壞</Warn>。
        </>
      ),
    },
  },

  /* ───────────────────────── 1001 課堂錄音（本堂課主軸） ───────────────────────── */
  {
    id: 'recording',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO',
    title: '錄音01｜冷凍循環與基本零件',
    en: 'Recording 01',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO,
        title: '錄音01',
        en: 'Class Recording',
        duration: '27:15',
        chapters: [
          { at: 0, title: '散熱器＝冷凝器＝熱排', summary: '散熱器把熱排掉、讓氣體凝結成液體，吹出的風四、五十度；國語、台語叫法都要會' },
          { at: 1 * 60 + 57, title: '液管與乾燥過濾器', summary: '講義上的黃色線是液管；系統裡只能有冷媒、不能有水，水會結冰堵住管路' },
          { at: 3 * 60 + 49, title: '冷凍油、油分離器與視液鏡', summary: '壓縮機像引擎，要用冷凍油潤滑；冷媒含水越少越好；從視液鏡看冷媒量' },
          { at: 5 * 60 + 47, title: '膨脹閥：降壓節流', summary: '像洗車時壓住水管口：液體被擠成細小液滴，噴得又快又遠' },
          { at: 6 * 60 + 27, title: '蒸發就是吸熱：蒸發器＝冷排', summary: '液體變氣體會吸熱：會覺得涼，是因為身上的熱被吸走' },
          { at: 9 * 60 + 3, title: '為什麼要讓冷媒快速蒸發', summary: '密閉管路裡，靠膨脹閥把液體變成液氣混合才蒸發得快' },
          { at: 11 * 60 + 57, title: '四大金剛與完整循環', summary: '四大金剛是壓縮機、冷凝器、蒸發器、膨脹閥；冷凍和冷氣原理相同' },
          { at: 14 * 60 + 46, title: '溫控與溫差 4°C', summary: '溫控器到溫就讓壓縮機停：-20°C 停、-16°C 再啟動，避免頻繁開關縮短壽命' },
          { at: 17 * 60 + 17, title: '冷媒往冷的地方跑 → 電磁閥', summary: '停機後冷媒會跑去冷的蒸發器；電磁閥常閉、通電才開，停機時關住液管，下次才好啟動' },
          { at: 21 * 60 + 28, title: '散熱外移一定要裝電磁閥', summary: '便利商店把散熱器裝在外牆：管路越長、冷媒越多，一定要裝電磁閥' },
          { at: 22 * 60 + 23, title: '看實例照片與散熱器保養', summary: '冰箱也是同樣原理；散熱器會吸灰塵，要定期清洗' },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          四大金剛：<Hl>壓縮機、冷凝器（熱排）、蒸發器（冷排）、膨脹閥</Hl>；再加上乾燥過濾器和電磁閥，就是門市最常賣的零件。
        </>
      ),
    },
  },

  /* ───────────────────────── 1001 課堂錄音 Part 2 ───────────────────────── */
  {
    id: 'recording-2',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 2',
    title: '錄音02｜循環修正、元件搭配與儲液器',
    en: 'Recording 02',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_2,
        title: '錄音02',
        en: 'Class Recording',
        duration: '21:08',
        chapters: [
          { at: 0, title: '循環圖先不標過冷、過熱', summary: '過冷、過熱比較深，放到進階再學；一開始寫上去反而會搞混' },
          { at: 40, title: '真正的低壓在哪裡', summary: '膨脹閥出來是液氣混合；完全蒸發後才是低溫低壓氣態' },
          { at: 186, title: '循環圖怎麼標', summary: '高溫高壓氣態 → 中溫中壓液態 → 液氣混合 → 低溫低壓氣態' },
          { at: 224, title: '室外與庫內', summary: '散熱器放室外；庫房要密閉，庫板保溫隔熱' },
          { at: 286, title: '四大元件要相輔相成', summary: '壓縮機 1 馬配散熱器 2 馬；膨脹閥、冷排跟著壓縮機選' },
          { at: 367, title: '門市怎麼估一套冷凍庫', summary: '幾坪、冰什麼 → 選馬力 → 散熱器（有外箱／裸露型，台語叫「無穿衫」）→ 冷排 → 配件，整套報價' },
          { at: 575, title: '機組長什麼樣子', summary: '機組＝壓縮機、油分離器、乾燥過濾器、視液鏡裝在同一個底座上' },
          { at: 617, title: '儲液器：源源不絕的液態', summary: '儲液器確保送出去的是液態：膨脹閥系統一定要裝，用毛細管的冰箱不用' },
          { at: 953, title: '液氣分離器：回壓縮機一定是氣態', summary: '液氣分離器讓液體沉在下面、只從上面取氣體，保護壓縮機' },
          { at: 1077, title: '一對一系統與壓力開關', summary: '一般做一對一：一台壓縮機配一台散熱器、一組冷排；壓力開關一定要裝' },
          { at: 1118, title: '先懂物理現象，再講控制', summary: '控制零件包括溫控器、壓力開關、電磁閥；從視液鏡看冷媒夠不夠' },
          { at: 1202, title: '接下來先學什麼', summary: '先把原理學熟、認識店裡賣的零件；計算放到後面' },
        ],
      },
    ],
    conclusion: {
      label: '學習順序',
      text: (
        <>
          先熟<Hl>物理現象（系統原理）</Hl>→ 再學<Hl>控制</Hl>→ 再認識<Hl>我們賣的零件</Hl>；計算放到後面，「又不是要考工程師」。
        </>
      ),
    },
  },
  /* ───────────────────────── 1001 課堂錄音 Part 3–5 ───────────────────────── */
  {
    id: 'recording-3',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 3',
    title: '錄音03–05｜系統配置、擺放位置與單位',
    en: 'Recording 03–05',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_3,
        title: '錄音03–05',
        en: 'Class Recording',
        duration: '06:48',
        tracks: [
          { label: '03', src: CLASS_AUDIO_3, duration: '06:48' },
          { label: '04', src: CLASS_AUDIO_4, duration: '01:53' },
          { label: '05', src: CLASS_AUDIO_5, duration: '04:31' },
        ],
        chapters: [
          { track: 0, at: 0, title: '檢查筆記：先記住每個零件做什麼', summary: '先搞懂壓縮機、油分離器這些零件各做什麼；筆記內容大致都對' },
          { track: 0, at: 105, title: '散熱器、儲液器、乾燥過濾器', summary: '散熱器會吸灰塵；講義右下角的小圓是儲液器（沒標名稱）；乾燥過濾器一定要裝' },
          { track: 0, at: 156, title: '視液鏡會變色、電磁閥常閉', summary: '視液鏡的含水指示環會變色：綠＝乾燥、變淡＝快超標、黃＝含水，很多人不知道' },
          { track: 0, at: 208, title: '冷藏＋冷凍一對二很難做', summary: '一台壓縮機同時帶冷藏和冷凍很難控制，KVP 這類閥一年賣不到兩顆；一般一對一，兩庫同溫才一對二' },
          { track: 0, at: 259, title: '下一步：學單位，再看實品', summary: '冷藏、冷凍主要差在溫控：冷凍要除霜' },
          { track: 1, at: 51, title: '散熱器擺哪裡很重要', summary: '裸露型（台語「無穿衫」）便宜，但放在鐵皮屋上，夏天環境溫度會到 50 度' },
          { track: 2, at: 0, title: '先把單位搞好', summary: '很多客戶也不懂溫度和壓力的關係；用 Ref Tools App 查' },
          { track: 2, at: 110, title: '先認識裝置，才會跟客人溝通', summary: '學習順序：原理 → 單位 → 裝置 → 壓縮機 → 零配件' },
          { track: 2, at: 161, title: '管徑單位「分」', summary: '1 吋＝25.4 mm＝8 分；1 分＝3.175 mm，用游標卡尺量' },
          { track: 2, at: 211, title: '壓縮機是龍頭', summary: '壓縮機規格會寫接管大小：高壓幾分、低壓幾分' },
        ],
      },
    ],
    conclusion: {
      label: '學習順序',
      text: (
        <>
          <Hl>原理 → 單位 → 裝置 → 壓縮機 → 零配件</Hl>；先記住每個零件做什麼用，再去看實品。
        </>
      ),
    },
  },
  /* ───────────────────────── 核心圖解：冷凍循環（可持續擴充） ───────────────────────── */
  {
    id: 'cycle-lesson',
    part: 'basics',
    chapter: '核心圖解',
    mark: 'CYCLE',
    title: '核心圖解：冷凍循環一圈',
    en: 'Key Diagram · Refrigeration Cycle',
    blocks: [{ type: 'cycleLesson' }],
    conclusion: {
      text: (
        <>
          冷媒一圈有四個狀態：<Hl>高溫高壓氣 → 液 → 液氣混合 → 低溫低壓氣</Hl>；冷媒在冷排吸走庫內的熱，在熱排把熱排到室外。
        </>
      ),
    },
  },

  /* ───────────────────────── 1001 課堂講義 ───────────────────────── */
  {
    id: 'handout',
    part: 'components',
    chapter: '講義',
    title: '講義：系統零件總覽圖',
    en: 'Class Handout · Danfoss',
    store: {
      products: ['EVR 電磁閥', 'TE 膨脹閥', 'DML 乾燥過濾器', 'SGI 視液鏡'],
      tip: (
        <>
          圖上每顆零件店裡都有賣。客人直接報型號（EVR、KVL…）時，要能<Em>立刻對應到品名和位置</Em>。
        </>
      ),
    },
    blocks: [
      {
        type: 'hotspots',
        image: handoutImg,
        alt: 'Danfoss 商業冷凍・冷藏・空調系統控制零件圖（北宜通商）',
        ratio: 2446 / 1714,
        audioSrc: CLASS_AUDIO,
        audioSrc2: CLASS_AUDIO_2,
        note: '儲液器有畫但沒標名稱：右下角那顆小圓（Danfoss 沒賣儲液器）；液氣分離器講義沒畫，但店裡有賣。',
        defaultId: 'te',
        groups: {
          liquid: { label: '液管（高壓液體・黃色線）', tone: 'amber' },
          suction: { label: '蒸發器與吸氣管（低壓・藍色線）', tone: 'ice' },
          discharge: { label: '壓縮機與排氣管（高壓氣體・紅色線）', tone: 'red' },
          control: { label: '電控與保護', tone: 'violet' },
        },
        items: [
          {
            id: 'receiver',
            code: '小圓',
            name: '儲液器（沒標名稱）',
            en: 'Liquid Receiver',
            group: 'liquid',
            points: [{ x: 77.5, y: 67.9 }],
            func: '講義右下角這顆小圓就是儲液器，有畫但沒寫名稱（Danfoss 沒賣儲液器）。散熱器太小或太髒時，冷媒可能沒完全液化；儲液器讓液態沉在底部、從底部取液，確保送到膨脹閥的是液態。膨脹閥系統一定要裝。',
            slide: 'cycle-lesson',
            chapter: '核心圖解',
            audioAt2: 11 * 60 + 2,
          },
          {
            id: 'acc',
            code: '講義沒畫',
            name: '液氣分離器（低壓儲液器）',
            en: 'Suction Accumulator',
            group: 'suction',
            points: [],
            func: '液氣分離器裝在冷排和壓縮機中間：液體沉在下面、只從上面取氣體回壓縮機，保護壓縮機不被液體打壞。講義沒畫，但店裡有賣。',
            slide: 'cycle-lesson',
            chapter: '核心圖解',
            audioAt2: 15 * 60 + 53,
          },
          {
            id: 'gbc',
            code: 'GBC',
            name: '球閥（手閥）',
            en: 'Ball Valve',
            group: 'liquid',
            points: [
              { x: 43.5, y: 79.8 },
              { x: 59.25, y: 79.8 },
            ],
            func: '球閥就像水龍頭，用手開關冷媒。大一點的系統在乾燥過濾器前後各裝一顆：換乾燥過濾器時關起來，就不用把整個系統的冷媒放掉。',
            audioAt: 18 * 60 + 47,
          },
          {
            id: 'dml',
            code: 'DML',
            name: '乾燥過濾器',
            en: 'Filter Drier',
            group: 'liquid',
            points: [{ x: 51.5, y: 79.4 }],
            func: '冷凍系統裡只能有冷媒、不能有水：水會結冰堵住管路。乾燥過濾器裡的分子篩會吸水、濾雜質，一定要裝；系統打開維修過就要換新。',
            slide: 'ch9',
            chapter: '第 9 章',
            audioAt: 2 * 60 + 33,
            audioAt2: 19 * 60 + 5,
          },
          {
            id: 'sgi',
            code: 'SGI',
            name: '視液鏡（視窗）',
            en: 'Sight Glass',
            group: 'liquid',
            points: [{ x: 35.75, y: 79.8 }],
            func: '視液鏡是液管上的玻璃窗，用來看冷媒夠不夠。中間的含水指示環會變色：綠色＝乾燥，綠色變淡＝快超標，黃色＝含水過多、要換乾燥過濾器。',
            audioAt: 5 * 60 + 27,
            audioAt2: 19 * 60 + 5,
          },
          {
            id: 'evr',
            code: 'EVR',
            name: '電磁閥',
            en: 'Solenoid Valve',
            group: 'liquid',
            points: [
              { x: 20, y: 40.3 },
              { x: 19.9, y: 68.9 },
            ],
            func: '電磁閥平常是關的（常閉），通電才打開。庫溫到了，它和壓縮機一起斷電關閉，把冷媒關在液管，避免冷媒跑進蒸發器、讓下次難啟動。',
            slide: 'ch5',
            chapter: '第 5 章',
            audioAt: 14 * 60 + 46,
            audioAt2: 19 * 60 + 5,
          },
          {
            id: 'te',
            code: 'TE',
            name: '感溫式膨脹閥',
            en: 'Thermostatic Expansion Valve',
            group: 'liquid',
            points: [
              { x: 26, y: 36.8 },
              { x: 26, y: 64.6 },
            ],
            func: '膨脹閥負責降壓節流：像洗車時壓住水管口，把液態冷媒噴成細小的液氣混合，進蒸發器後才能快速蒸發吸熱。',
            slide: 'ch5',
            chapter: '第 5 章',
            audioAt: 5 * 60 + 47,
            audioAt2: 4 * 60 + 46,
          },
          {
            id: 'evap',
            code: '蒸發器',
            name: '蒸發器（冷排）：上冷藏、下冷凍',
            en: 'Evaporator',
            group: 'suction',
            points: [
              { x: 34.5, y: 31.4 },
              { x: 34.5, y: 59.2 },
            ],
            func: '冷媒在蒸發器裡蒸發，把庫內的熱吸走，所以吹出冷風。講義上面那組是冷藏庫、下面那組是冷凍庫（有電熱除霜），一台壓縮機帶兩種庫溫。',
            slide: 'ch4',
            chapter: '第 4 章',
            audioAt: 6 * 60 + 27,
          },
          {
            id: 'kvp',
            code: 'KVP',
            name: '蒸發壓力調節閥',
            en: 'Evaporating Pressure Regulator',
            group: 'suction',
            points: [{ x: 55, y: 26.6 }],
            func: 'KVP 裝在冷藏庫蒸發器出口，讓蒸發壓力不低於設定值，冷藏庫才不會被拉得跟冷凍庫一樣冷。很少用（一年賣不到兩顆）。',
            slide: 'ch5',
            chapter: '第 5 章',
          },
          {
            id: 'nrv',
            code: 'NRV',
            name: '逆止閥',
            en: 'Check Valve',
            group: 'suction',
            points: [{ x: 50, y: 54.6 }],
            func: '逆止閥裝在冷凍庫的吸氣管，只讓冷媒單向流動，停機時防止冷媒倒流進冰冷的冷凍庫蒸發器。很少用（一年賣不到兩顆）。',
            slide: 'ch5',
            chapter: '第 5 章',
          },
          {
            id: 'kvl',
            code: 'KVL',
            name: '曲軸箱壓力調整閥',
            en: 'Crankcase Pressure Regulator',
            group: 'suction',
            points: [{ x: 58.4, y: 54.2 }],
            func: 'KVL 裝在壓縮機吸氣口前：剛開機降溫或除霜完時吸氣壓力偏高，它限制吸氣壓力，避免壓縮機馬達過載燒毀。很少用（一年賣不到兩顆）。',
            slide: 'ch5',
            chapter: '第 5 章',
          },
          {
            id: 'comp',
            code: '壓縮機',
            name: '壓縮機',
            en: 'Compressor',
            group: 'discharge',
            points: [{ x: 67.25, y: 68.2 }],
            func: '壓縮機是四大金剛之首：把低溫低壓的冷媒氣體壓成高溫高壓，送到冷凝器散熱。只能壓氣體，不能壓液體。',
            slide: 'ch2',
            chapter: '第 2 章',
            audioAt: 11 * 60 + 57,
            audioAt2: 4 * 60 + 46,
          },
          {
            id: 'oub',
            code: 'OUB',
            name: '油分離器',
            en: 'Oil Separator',
            group: 'discharge',
            points: [{ x: 62.75, y: 27.1 }],
            func: '壓縮機像汽車引擎，需要冷凍油潤滑；油會跟著冷媒跑出去，油分離器在排氣端把油分出來送回壓縮機。',
            slide: 'ch5',
            chapter: '第 5 章',
            audioAt: 3 * 60 + 52,
            audioAt2: 9 * 60 + 35,
          },
          {
            id: 'nrd',
            code: 'NRD',
            name: '差壓閥',
            en: 'Differential Pressure Valve',
            group: 'discharge',
            points: [{ x: 72.4, y: 42.1 }],
            func: 'NRD 搭配 KVR 使用：冬天高壓偏低時，讓一部分壓縮機排氣直接補進儲液器，保持液管壓力，把冷媒推向膨脹閥。',
            slide: 'ch3',
            chapter: '第 3 章',
          },
          {
            id: 'cond',
            code: '冷凝器',
            name: '冷凝器（散熱器・熱排）',
            en: 'Condenser',
            group: 'discharge',
            points: [{ x: 80, y: 46.8 }],
            func: '冷凝器把高溫高壓氣體的熱排掉、凝結成液體，吹出的風有四、五十度。鰭片會吸灰塵，一定要定期清洗。',
            slide: 'ch3',
            chapter: '第 3 章',
            audioAt: 0,
            audioAt2: 11 * 60 + 41,
          },
          {
            id: 'kvr',
            code: 'KVR',
            name: '冷凝壓力調整閥',
            en: 'Condensing Pressure Regulator',
            group: 'discharge',
            points: [{ x: 77.75, y: 58.9 }],
            func: 'KVR 在冬天外溫低時維持冷凝壓力，避免膨脹閥前後壓差不足、供液不夠。',
            slide: 'ch3',
            chapter: '第 3 章',
          },
          {
            id: 'kp15',
            code: 'KP 15',
            name: '高低壓開關',
            en: 'Dual Pressure Switch',
            group: 'control',
            points: [{ x: 65.25, y: 41.4 }],
            func: '高低壓開關在低壓太低或高壓太高時切斷電源、讓壓縮機停機，保護壓縮機；每套系統都一定要裝。',
            audioAt2: 18 * 60 + 36,
            slide: 'ch5',
            chapter: '第 5 章',
          },
          {
            id: 'ekc-temp',
            code: 'EKC 101 / 201',
            name: '溫度控制器（201 含除霜控制）',
            en: 'Temperature Controller',
            group: 'control',
            points: [
              { x: 44, y: 33.2 },
              { x: 44, y: 61 },
            ],
            func: '溫度控制器用來設定庫溫，到溫就讓壓縮機停。溫差一般抓 4°C：例如設 -20°C 停、回升到 -16°C 再啟動，避免壓縮機開關太頻繁；EKC 201 還會控制除霜。',
            slide: 'ch4',
            chapter: '第 4 章',
            audioAt: 16 * 60 + 15,
          },
          {
            id: 'sensor',
            code: 'EKS / AKS 12',
            name: '溫度感測器（感溫棒）',
            en: 'Temperature Sensor',
            group: 'control',
            points: [
              { x: 34.5, y: 38.9 },
              { x: 34, y: 70 },
            ],
            func: '感溫棒量庫內溫度和除霜結束的溫度，把訊號送給溫度控制器。',
            audioAt: 15 * 60 + 15,
          },
          {
            id: 'ekc331',
            code: 'EKC 331',
            name: '能力控制器',
            en: 'Capacity Controller',
            group: 'control',
            points: [
              { x: 80, y: 30 },
              { x: 72.75, y: 69.6 },
            ],
            func: 'EKC 331 讀取壓力傳送器的訊號，分段控制壓縮機或冷凝器風扇。',
          },
          {
            id: 'aks3000',
            code: 'AKS 3000',
            name: '壓力傳送器',
            en: 'Pressure Transmitter',
            group: 'control',
            points: [
              { x: 61.5, y: 72.4 },
              { x: 87.2, y: 35.5 },
            ],
            func: 'AKS 3000 把吸氣壓力或冷凝壓力轉成電子訊號，交給 EKC 331 判斷。',
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          一台壓縮機帶<Hl>冷藏＋冷凍</Hl>很難做；實務上一般<Hl>一對一</Hl>，兩庫同溫（都冷藏或都冷凍）才可一對二。
        </>
      ),
    },
  },

  /* ───────────────────────── 1001 單位與工具 ───────────────────────── */
  {
    id: 'units',
    part: 'units',
    chapter: '單位',
    mark: 'UNITS',
    title: '管徑：聽懂「幾分」，對得上單子',
    en: 'Units & Tools',
    blocks: [{ type: 'fen' }],
    conclusion: {
      text: (
        <>
          <Hl>1 分＝3.175 mm</Hl>：英吋分母換成 8，分子就是幾分；卡尺量外徑 ÷ 3.175 就是幾分。溫度和壓力怎麼換算，下一頁用 Ref Tools 練習。
        </>
      ),
    },
  },
  /* ───────────────────────── 1001 課後 Insight ───────────────────────── */
  {
    id: 'lesson-insights',
    part: 'summary',
    chapter: '課後 Insight',
    mark: 'TAKEAWAY',
    title: '學到現在，真正要學會的事',
    en: 'Key Takeaways',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-3',
        children: [
          {
            type: 'insight',
            no: '01',
            icon: Route,
            tone: 'ice',
            title: '追著冷媒走',
            subtitle: '一圈四個狀態',
            en: 'Follow the Refrigerant',
            body: (
              <>
                冷媒一定要從<Hl>液態變成氣態</Hl>才吸得到熱。儲液器保證送出去的是液態，液氣分離器保證回壓縮機的是氣態。
              </>
            ),
            children: [
              {
                type: 'flow',
                direction: 'col',
                compact: true,
                bare: true,
                tone: 'ice',
                steps: [
                  { title: '壓縮機 → 高溫高壓氣態' },
                  { title: '熱排 → 中溫中壓液態' },
                  { title: '膨脹閥 → 液氣混合' },
                  { title: '冷排 → 低溫低壓氣態' },
                ],
              },
            ],
          },
          {
            type: 'insight',
            no: '02',
            icon: Boxes,
            tone: 'emerald',
            title: '四大元件要相輔相成',
            subtitle: '像車子配輪胎，比例要對',
            en: 'Match the System',
            body: (
              <>
                門市的主要生意是<Hl>整套估價</Hl>：先問清楚客人要冰什麼，再把壓縮機、散熱器、膨脹閥、冷排和配件一起配好。
              </>
            ),
            children: [
              {
                type: 'flow',
                direction: 'col',
                compact: true,
                bare: true,
                tone: 'emerald',
                steps: [
                  { title: '客人說幾坪 → 先問冰什麼' },
                  { title: '選壓縮機馬力（1 馬配散熱器 2 馬）' },
                  { title: '膨脹閥閥芯、冷排跟著壓縮機選' },
                  { title: '一般做一對一，系統單純' },
                ],
              },
            ],
          },
          {
            type: 'insight',
            no: '03',
            icon: GraduationCap,
            tone: 'amber',
            title: '學習順序',
            subtitle: '先基礎、後進階，懂了才賣得出去',
            en: 'What to Learn First',
            body: (
              <>
                「我們不是要考工程師」：先把基礎學熟，<Hl>計算、過冷過熱度放到第二階段</Hl>。
              </>
            ),
            children: [
              {
                type: 'flow',
                direction: 'col',
                compact: true,
                bare: true,
                tone: 'amber',
                steps: [
                  { title: '① 原理：系統一圈要很熟' },
                  { title: '② 單位：管徑幾分、溫度壓力' },
                  { title: '③ 裝置：客人用在哪裡' },
                  { title: '④ 壓縮機 → 零配件、控制' },
                  { title: '第二階段（進階）：計算、過冷過熱度', tone: 'slate' },
                ],
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '課後一句話',
      text: (
        <>
          冷凍就是搬熱：<Hl>追著冷媒走、四大元件相輔相成、先原理後控制再零件</Hl>；基礎熟了再進階，懂了才有辦法賣。
        </>
      ),
    },
  },
  /* ───────────────────────── 12 第 6 章 ───────────────────────── */
  {
    id: 'ch6',
    source: 'handbook',
    part: 'advanced',
    advanced: true,
    chapter: '第 6 章',
    title: '熱力平衡與過冷 / 過熱度調校',
    en: 'Superheat & Subcooling',
    store: {
      products: ['數位雙錶組', '夾式溫度計', '真空錶'],
      tip: (
        <>
          技師說「冷媒補很多還是不冷」：提醒他<Em>先量過熱度與過冷度</Em>再判斷；數位錶組可直接顯示，是好推薦。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[minmax(0,0.82fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-cols-3',
            children: [
              {
                type: 'info',
                icon: Snowflake,
                tone: 'indigo',
                title: '低溫機 LBP',
                en: 'Low Back Pressure',
                tag: '冷凍用',
                body: (
                  <>
                    低溫機的壓縮結構和高溫機相同，但<Hl>馬達馬力設計較小</Hl>。
                  </>
                ),
                warn: '低溫機拿去做冷藏：馬達會超載、降溫慢，久了容易燒毀。',
              },
              {
                type: 'info',
                icon: ThermometerSun,
                tone: 'violet',
                title: '高溫機 HBP',
                en: 'High Back Pressure',
                tag: '冷藏用',
                body: (
                  <>
                    高溫機的<Hl>馬達馬力較大</Hl>；同時要急凍又要保溫的冷凍庫，建議選高溫機。
                  </>
                ),
                warn: '高溫機拿去做冷凍：馬達發熱、冷媒流量下降，效率差、降溫慢。',
              },
              {
                type: 'stat',
                icon: TrendingUp,
                tone: 'emerald',
                title: '過冷度經濟效益',
                en: 'Subcooling Pays Off',
                from: { value: '+1°C', label: '每增加過冷度' },
                to: { value: '≈ +1%', label: '冷凍能力提升' },
                desc: (
                  <>
                    過冷度夠，液管裡就不會冒出氣泡，膨脹閥供液更穩定。
                    <Exp />
                  </>
                ),
              },
            ],
          },
          {
            type: 'metrics',
            icon: Target,
            tone: 'ice',
            title: '現場量測黃金指標',
            en: 'Field Commissioning Targets',
            cols: 3,
            size: 'lg',
            items: [
              {
                label: '蒸發器出口過熱度',
                tag: 'SH',
                value: '5 ~ 7',
                unit: '°C',
                tone: 'ice',
                note: '過熱度＝吸氣溫度－飽和蒸發溫度；一般取 5°C，負載變化大可到 7°C',
              },
              {
                label: '壓縮機吸氣口總過熱度',
                tag: 'SH',
                value: '10 ~ 15',
                unit: '°C',
                tone: 'teal',
                note: (
                  <>
                    吸氣溫度保持在 0°C 以上，防結霜
                    <Exp />
                  </>
                ),
              },
              { label: '液管過冷度', tag: 'SC', value: '≈ 5', unit: '°C', tone: 'indigo', note: '過冷度＝飽和冷凝溫度－液管溫度；約 5°C 最好，太小液管容易冒氣泡' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          冷凍系統一直在動態找平衡。現場調整以「<Hl>過熱度 5 ~ 7°C</Hl>」與「<Hl>過冷度約 5°C</Hl>」為準。
        </>
      ),
    },
  },

  /* ───────────────────────── 13 第 7–8 章 ───────────────────────── */
  {
    id: 'ch7-8',
    source: 'handbook',
    part: 'advanced',
    advanced: true,
    chapter: '第 7 – 8 章',
    title: '熱負荷計算與選型原則',
    en: 'Heat Load & Selection',
    store: {
      products: ['冷凝機組', '冷風機', 'PU 庫板', '冷庫門'],
      tip: (
        <>
          新建庫房詢價先記下：庫內尺寸、目標庫溫、貨品與<Em>每日進貨量</Em>、開門頻率、環境溫度，再交業務選型報價。
        </>
      ),
    },
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
        children: [
          {
            type: 'list',
            icon: Calculator,
            tone: 'indigo',
            title: '五大熱負荷來源',
            en: 'Five Heat Load Sources',
            items: [
              { icon: Layers, title: '大氣傳導熱', desc: '取決於庫板 PU 隔熱厚度和內外溫差' },
              {
                icon: Package,
                title: '貨物熱負荷',
                desc: '降溫顯熱 + 水分凍結潛熱 80 kcal/kg + 蔬果呼吸熱',
                badge: { label: '浮動大', tone: 'amber' },
              },
              {
                icon: DoorOpen,
                title: '外氣滲漏熱',
                desc: '開門時湧入的濕熱空氣',
                badge: { label: '浮動大', tone: 'amber' },
              },
              { icon: Zap, title: '庫內設備電熱', desc: '風扇、照明、除霜電熱' },
              { icon: Users, title: '人員作業熱', desc: '人在庫內工作散出的熱' },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1fr)_auto]',
            children: [
              {
                type: 'sizing',
                icon: Clock,
                title: '選型關鍵陷阱：日運轉時數',
                en: 'Daily Run-Time Trap',
                badge: '選型底線',
                points: [
                  <>
                    選型<Danger>絕不能用 24 小時運轉計算</Danger>！機器要留時間除霜、讓庫溫回穩。
                  </>,
                  <>
                    冷凍庫以 <Hl>16 ~ 18 小時 / 天</Hl>、冷藏庫以 <Hl>18 ~ 20 小時 / 天</Hl> 為計算基準。
                  </>,
                ],
                formula: (
                  <>
                    Q<Sub>h</Sub> ={' '}
                    <Frac
                      num={
                        <>
                          Q<Sub>total</Sub> <span className="text-[0.7em] text-amber-200/80">(kcal/24h)</span>
                        </>
                      }
                      den={
                        <>
                          運轉時數 <span className="text-[0.7em] text-amber-200/80">(冷凍 16~18 / 冷藏 18~20 h)</span>
                        </>
                      }
                    />{' '}
                    × 1.15 <span className="font-sans text-[0.68em] text-amber-200/80">（安全裕度）</span>
                  </>
                ),
                example: {
                  caption: '試算：Q_total = 240,000 kcal/24h',
                  rows: [
                    { label: '÷ 24 h（錯誤）', value: '11,500 kcal/h', note: '低估約 33%，庫溫拉不下來', tone: 'red' },
                    { label: '÷ 16 h（正確）', value: '17,250 kcal/h', note: '保留化霜與回溫時間', tone: 'emerald' },
                  ],
                },
              },
              {
                type: 'flow',
                direction: 'row',
                icon: Workflow,
                tone: 'indigo',
                title: '標準四步選型流程',
                en: 'Selection Sequence',
                steps: [
                  { title: '熱負荷計算', desc: '五大來源加總' },
                  { title: '決定蒸發器', desc: '依溫差 TD 選' },
                  { title: '決定壓縮機', desc: '依每小時負荷 Qh 和蒸發溫度選' },
                  { title: '決定冷凝器', desc: '依總排熱量 THR 選' },
                ],
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          進貨太多和頻繁開門是<Warn>變動最大的熱負荷</Warn>（手冊例題約占三分之一）；計算時要除以<Hl>實際運轉時數</Hl>，不能除以 24 小時。
        </>
      ),
    },
  },

  /* ───────────────────────── 14 第 9 章 ───────────────────────── */
  {
    id: 'ch9',
    source: 'handbook',
    part: 'practice',
    chapter: '第 9 章',
    title: '現場四大高頻故障診斷矩陣',
    en: 'Troubleshooting Matrix',
    store: {
      products: ['電子檢漏器', '真空泵', '冷媒回收機', '銀焊條'],
      tip: (
        <>
          客人一進門就要買冷媒？先問「漏在哪、補過幾次」。反覆補冷媒代表有漏點，該推<Em>檢漏與修漏</Em>。
        </>
      ),
    },
    blocks: [
      {
        type: 'matrix',
        groups: {
          physical: { label: '先查：物理機械', hint: '風機・髒堵・結霜・安裝保溫' },
          thermal: { label: '後查：熱力冷媒', hint: '閥件・冷媒壓力・機械內損' },
        },
        categories: [
          { id: 'fan', label: '風機', group: 'physical' },
          { id: 'dirt', label: '髒堵', group: 'physical' },
          { id: 'frost', label: '結霜', group: 'physical' },
          { id: 'install', label: '安裝保溫', group: 'physical' },
          { id: 'valve', label: '閥件', group: 'thermal' },
          { id: 'refrigerant', label: '冷媒壓力', group: 'thermal' },
          { id: 'internal', label: '機械內損', group: 'thermal' },
        ],
        columns: [
          {
            title: '高壓過高',
            en: 'High Head Pressure',
            icon: TrendingUp,
            tone: 'amber',
            firstCheck: '摸冷凝器出風溫度，看鰭片髒污與風扇轉向',
            causes: [
              { text: '冷凝器鰭片油污積塵', cat: 'dirt', top: true },
              { text: '風扇反轉 / 故障、風道短路', cat: 'fan' },
              { text: '系統有空氣（未抽真空）', cat: 'refrigerant' },
              { text: '冷媒過量充填', cat: 'refrigerant' },
            ],
          },
          {
            title: '低壓過低',
            en: 'Low Suction Pressure',
            icon: TrendingDown,
            tone: 'ice',
            firstCheck: '看蒸發器結霜與風扇，再看視液鏡有無氣泡',
            causes: [
              { text: '蒸發器結厚霜、堵住風道', cat: 'frost' },
              { text: '膨脹閥濾網堵塞 / 感溫包漏氣', cat: 'valve' },
              { text: '冷媒洩漏（視液鏡一直冒氣泡）', cat: 'refrigerant' },
              { text: '乾燥過濾器堵塞（進出口摸起來有溫差）', cat: 'dirt' },
            ],
          },
          {
            title: '排氣溫度飆高',
            en: 'High Discharge Temp.',
            flag: '> 107°C',
            icon: Flame,
            tone: 'red',
            firstCheck: '量吸氣過熱度、檢查吸氣管保溫，再算壓比',
            causes: [
              { text: '吸氣過熱度過大 / 吸氣管未保溫', cat: 'install' },
              { text: '壓比過大（低壓太低或高壓太高）', cat: 'refrigerant' },
              { text: '壓縮機內部閥片損壞、高低壓串氣', cat: 'internal' },
            ],
          },
          {
            title: '回液敲缸',
            en: 'Liquid Floodback',
            flag: '壓縮機結霜',
            icon: Snowflake,
            tone: 'violet',
            firstCheck: '確認蒸發器風扇運轉，檢查感溫包是否綁緊',
            causes: [
              { text: '蒸發器風扇停轉', cat: 'fan' },
              { text: '感溫包鬆脫未貼緊管壁', cat: 'install' },
              { text: '膨脹閥開度過大 / 過熱度調整太小', cat: 'valve' },
              { text: '冷媒充填過量', cat: 'refrigerant' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          現場經驗：「<Hl>八成是風機、髒堵、結霜問題</Hl>」<Exp />，切忌一上來就<Danger>盲目加冷媒</Danger>。
        </>
      ),
    },
  },

  /* ───────────────────────── 15 門市接單 SOP ───────────────────────── */
  {
    id: 'sop',
    source: 'extra',
    part: 'practice',
    chapter: '門市實戰',
    mark: 'COUNTER',
    title: '門市接單問診 SOP',
    en: 'Counter Service Playbook',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)]',
        children: [
          {
            type: 'list',
            icon: ClipboardList,
            tone: 'emerald',
            title: '接單六問',
            en: 'Six Questions Before Billing',
            items: [
              { icon: Droplets, title: '冷媒種類？', desc: 'R404A / R134a / R22 / R448A…' },
              { icon: Plug, title: '電源規格？', desc: '單相 110V / 220V、三相 220V / 380V' },
              { icon: Thermometer, title: '使用溫度？', desc: '冷凍（低溫機）或冷藏（高溫機）' },
              { icon: Gauge, title: '能力規格？', desc: '馬力 HP、冷凍能力 kcal/h 或 kW' },
              { icon: Camera, title: '原機型號？', desc: '請客人拍銘牌照片最準確' },
              { icon: Ruler, title: '接管尺寸與方式？', desc: '英制管徑；焊接或喇叭口' },
            ],
          },
          {
            type: 'grid',
            className: 'grid-cols-2 grid-rows-2 gap-5',
            children: [
              {
                type: 'scenario',
                label: '情境 A',
                tone: 'red',
                customer: '「老闆，給我兩瓶冷媒！」',
                ask: (
                  <>
                    先問<Em>「漏在哪？補過幾次？」</Em>反覆補充代表有漏點，應先檢漏、修漏。
                  </>
                ),
                recommend: ['檢漏劑 / 電子檢漏器', '銀焊條', '乾燥過濾器'],
                slide: 'ch9',
                chapter: '第 9 章',
              },
              {
                type: 'scenario',
                label: '情境 B',
                tone: 'amber',
                customer: '「冷凍庫壓縮機燒了，換一台一樣的。」',
                ask: (
                  <>
                    先確認是<Em>低溫機還是高溫機</Em>，再問壓縮機為什麼燒：回液、缺油還是電源問題？不找出原因，換新的一樣會燒。
                  </>
                ),
                recommend: ['同規格壓縮機', '乾燥過濾器', '酸性測試劑'],
                slide: 'ch2',
                chapter: '第 2 章',
              },
              {
                type: 'scenario',
                label: '情境 C',
                tone: 'ice',
                customer: '「冷藏庫一直結冰、越來越不冷。」',
                ask: (
                  <>
                    先問<Em>除霜有沒有動、風扇轉不轉</Em>、門有沒有關緊——多半不是缺冷媒。
                  </>
                ),
                recommend: ['除霜電熱管', '溫度感測器', '風扇馬達', '門封條'],
                slide: 'ch4',
                chapter: '第 4 章',
              },
              {
                type: 'info',
                icon: ShieldAlert,
                tone: 'amber',
                title: '門市安全守則',
                en: 'Store Safety',
                body: '冷媒鋼瓶直立固定、遠離熱源與日曬；R290 等可燃冷媒獨立分區、嚴禁明火；氮氣保壓務必經減壓錶。',
                warn: '回收冷媒不可與新冷媒混裝。',
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          <Hl>先問診、再開單</Hl>：問對問題才能給對零件，減少退換貨，也不讓技師白跑一趟。
        </>
      ),
    },
  },

  /* ───────────────────────── 四大行程（冷媒一圈的四件事） ───────────────────────── */
  {
    id: 'strokes',
    part: 'basics',
    chapter: '四大行程',
    mark: 'CYCLE',
    title: '四大行程：冷媒一圈的四件事',
    en: 'Four Processes',
    blocks: [
      {
        type: 'grid',
        className: 'grid-rows-[auto_minmax(0,1fr)]',
        children: [
          {
            type: 'info',
            icon: Flame,
            tone: 'amber',
            title: '冷凍靠的是「潛熱」',
            body: (
              <>
                冷媒<Hl>變相</Hl>（氣↔液）時吸收或放出的熱叫潛熱：溫度不變、相態改變，量比單純升降溫的顯熱大得多。冷凝器（氣→液）放熱、蒸發器（液→氣）吸熱，靠的都是潛熱。
              </>
            ),
          },
          {
            type: 'grid',
            className: 'grid-cols-4',
            children: [
          {
            type: 'concept',
            icon: Cylinder,
            tone: 'red',
            title: '壓縮行程',
            badge: { label: '① 壓縮機', tone: 'red' },
            body: '低溫低壓的氣體被吸進壓縮機，壓縮成高溫高壓的氣體——壓力升高，溫度也跟著升高。',
            chain: ['低溫低壓氣態', '高溫高壓氣態'],
            points: ['術語：等熵升壓升溫', '只能壓氣體，不能壓液體'],
          },
          {
            type: 'concept',
            icon: Fan,
            tone: 'amber',
            title: '冷凝行程',
            badge: { label: '② 冷凝器', tone: 'amber' },
            body: '冷媒在高壓下把熱放掉，從氣體凝結成液體；放出的熱（潛熱）由風扇吹到室外。',
            chain: ['高溫高壓氣態', '中溫中壓液態'],
            points: ['術語：高壓等壓放熱液化', '散熱不好，冷媒就液化不完全'],
          },
          {
            type: 'concept',
            icon: Droplets,
            tone: 'teal',
            title: '節流膨脹',
            badge: { label: '③ 膨脹閥', tone: 'teal' },
            body: '高壓常溫的液體通過窄小的閥口，壓力一下子降下來，變成低壓、很容易蒸發的液氣混合。',
            chain: ['中溫中壓液態', '液氣混合（濕蒸汽）'],
            points: ['術語：等焓降壓節流', '像洗車時壓住水管口'],
          },
          {
            type: 'concept',
            icon: Snowflake,
            tone: 'ice',
            title: '蒸發吸熱',
            badge: { label: '④ 蒸發器', tone: 'ice' },
            body: '液態冷媒在低壓下吸熱、蒸發成氣體，把庫房和貨物的熱吸走——這就是我們要的「冷」。',
            chain: ['液氣混合', '低溫低壓氣態'],
            points: ['術語：等壓等溫吸熱汽化', '要完全蒸發才回壓縮機'],
          },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          四大金剛各做一件事：壓縮機<Hl>升壓</Hl>、冷凝器<Hl>放熱</Hl>、膨脹閥<Hl>降壓</Hl>、蒸發器<Hl>吸熱</Hl>；吸熱就是我們要的「冷」。
        </>
      ),
    },
  },

  /* ───────────────────────── Ref Tools 網頁版（錄音05：溫度壓力用 App 查） ───────────────────────── */
  {
    id: 'reftools',
    part: 'units',
    chapter: 'Ref Tools',
    mark: 'P-T',
    title: 'Ref Tools 網頁版：冷媒溫度 ↔ 壓力',
    en: 'Refrigerant Slider',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'section',
            icon: Gauge,
            tone: 'ice',
            title: '在這裡直接試：錶壓 → 管內溫度',
            className: 'grid-rows-1',
            children: [{ type: 'refslider' }],
          },
          {
            type: 'flow',
            direction: 'col',
            tone: 'teal',
            icon: Plug,
            title: '真的 App 怎麼用（Danfoss Ref Tools，免費）',
            steps: [
              { title: '下載並打開 Ref Tools', desc: 'App Store／Google Play 搜尋「Ref Tools」，開啟後選「Refrigerant Slider」（冷媒滑尺）' },
              { title: '選冷媒', desc: '看機器銘牌或冷媒鋼瓶上寫的型號，例如 R134a、R404A' },
              { title: '輸入或拖動壓力', desc: '把壓力錶讀數（錶壓）輸入，就會跳出對應的飽和溫度' },
              { title: '對照看看', desc: '例：R22 高壓 210 psig ＝ 管內 40.42°C，跟老闆的手寫表一樣（按左邊藍色按鈕試試）' },
              { title: '其他功能之後再學', desc: '故障排除（Troubleshooter）、膨脹閥過熱度調整、產品查詢', tone: 'slate' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          <Hl>冷媒種類＋錶壓＝管內溫度</Hl>：溫度和壓力綁在一起，這就是 Ref Tools 最常用的功能；客人拿錶來問，先問冷媒再查。
        </>
      ),
    },
  },

  /* ───────────────────────── 常用冷媒速查表（老闆用 Ref Tools 整理的手寫表） ───────────────────────── */
  {
    id: 'reftable',
    part: 'units',
    chapter: '冷媒速查',
    mark: 'R22',
    title: '常用冷媒速查表：同一個溫度，高壓都不一樣',
    en: 'Common Refrigerants at a Glance',
    blocks: [
      {
        type: 'table',
        tone: 'emerald',
        head: ['R22', 'R417A', 'R438A', 'R408A', 'R404A', 'R507'],
        highlight: [
          { col: 0, label: '基準' },
          { col: 2, label: '最接近 R22' },
        ],
        standard: { label: '比較條件', value: '冷凝溫度都是 40.42°C', note: '溫度固定，只比高壓' },
        bars: { label: '高壓（psig）', unit: 'psig', values: [210, 183.2, 201.7, 233, 251.2, 259], baseCol: 0 },
        rows: [
          { label: '冷凍油', cells: ['POE、礦物油', 'POE、礦物油', 'POE、礦物油', 'POE、礦物油', '只能 POE', '只能 POE'] },
          { label: '用途', cells: ['冷凍、冷藏、空調', '空調、冷藏（稍差）', '冷凍、冷藏', '冷凍、冷藏', '冷凍、冷藏', '冷凍、冷藏'] },
        ],
        notes: [
          <>
            40.42°C 的由來：在 Ref Tools 把 <Hl>R22 設在 210 psig</Hl>（資深師傅的標竿），飽和溫度就是 40.42°C；再查其他冷媒在這個溫度的高壓。
          </>,
          <>
            高壓比 R22 高的冷媒（R408A、R404A、R507），<Hl>散熱器要選大一點</Hl>；6 種都能用 POE 油的壓縮機。
          </>,
          <>
            舊的 R22 壓縮機換成用 <Em>POE 油</Em>的壓縮機，要先清洗系統，避免兩種冷凍油混在一起。
          </>,
        ],
        image: { src: refrigerantTableImg, label: '看老闆手寫原稿' },
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          <Hl>同樣 40.42°C 冷凝，R22 是 210 psig</Hl>；R438A 最接近 R22，R404A、R507 高約 2 成，散熱器要配大一點。
        </>
      ),
    },
  },

  /* ───────────────────────── 冷媒演進與冷凍油（原第 1 章的冷媒內容） ───────────────────────── */
  {
    id: 'refrigerants',
    source: 'handbook',
    part: 'units',
    chapter: '冷媒',
    mark: 'GWP',
    title: '冷媒的演進與冷凍油搭配',
    en: 'Refrigerants & Oils',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)] gap-6',
            children: [
              {
                type: 'timeline',
                icon: History,
                tone: 'emerald',
                title: '冷媒演進：越來越環保',
                items: [
                  { gen: 'CFCs', example: 'R12', note: '破壞臭氧層，已禁用', tone: 'slate' },
                  { gen: 'HCFCs', example: 'R22', note: '過渡冷媒，逐步淘汰；老機器還很多', tone: 'slate' },
                  { gen: 'HFCs', example: 'R404A／R134a／R507', note: '不破壞臭氧層（ODP＝0），但溫室效應（GWP）高', tone: 'indigo' },
                  { gen: '低 GWP', example: 'R448A・R290・R744', note: '新一代冷媒；R290 會燃燒，要特別注意安全', tone: 'emerald' },
                ],
              },
              {
                type: 'list',
                icon: Snowflake,
                tone: 'ice',
                title: '店裡常見冷媒用在哪',
                items: [
                  { icon: Snowflake, title: 'R404A、R507', desc: '冷凍庫、低溫冷藏' },
                  { icon: Thermometer, title: 'R134a', desc: '冷藏、冰箱、汽車冷氣' },
                  { icon: Fan, title: 'R410A、R32', desc: '冷氣（壓力比較高）' },
                  { icon: History, title: 'R22', desc: '舊機器維修；資深師傅的比較基準' },
                ],
              },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)] gap-6',
            children: [
              {
                type: 'info',
                icon: Droplets,
                tone: 'amber',
                title: '冷凍油要跟冷媒配對',
                body: (
                  <>
                    HFC 冷媒（R404A、R134a、R507）要用 <Hl>POE 油</Hl>；R22 老機器多用礦物油。不同冷媒<Em>絕對不能混灌</Em>，開單前先確認原機的冷媒。
                  </>
                ),
                warn: '舊的 R22 壓縮機改用 POE 油時，要先清洗系統，避免兩種油混在一起。',
              },
              {
                type: 'list',
                icon: Droplets,
                tone: 'amber',
                title: '哪種冷媒配哪種油（老闆的手寫表）',
                items: [
                  { icon: Ban, title: '只能用 POE 油', desc: 'R404A、R507' },
                  { icon: CircleCheck, title: 'POE、礦物油都可以', desc: 'R22、R417A、R438A、R408A' },
                  { icon: Snowflake, title: '6 種都能用 POE 油的壓縮機', desc: '但高壓不同，散熱器大小要跟著冷媒選' },
                ],
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          <Hl>冷媒和冷凍油要成對</Hl>：HFC 配 POE、R22 舊機配礦物油；不同冷媒不能混灌，換冷媒、換油要先清洗系統。
        </>
      ),
    },
  },

  /* ───────────────────────── 估價練習（只用錄音講過的規則） ───────────────────────── */
  {
    id: 'estimate',
    part: 'practice',
    chapter: '估價練習',
    mark: 'QUOTE',
    title: '估價練習：幫客人配一整套',
    en: 'Quoting Practice',
    blocks: [
      {
        type: 'estimate',
        scenarios: [
          {
            title: '便利商店冷藏',
            story: '便利商店要做冷藏櫃，散熱器要掛在外牆、管子拉很長；用膨脹閥系統，壓縮機選 2 馬。',
            questions: [
              { q: '散熱器要配幾馬？', options: ['2 馬', '4 馬', '6 馬'], answer: 1, why: '一般 1 馬壓縮機配 2 馬散熱器，2 馬就配 4 馬。〔錄音02 04:46〕', slide: 'recording-2' },
              { q: '散熱器選哪一種？', options: ['有外箱的', '無穿衫（裸露型）'], answer: 0, why: '掛外牆要耐風吹雨淋，像 7-11 都用有外箱的。〔錄音02 06:07〕', slide: 'recording-2' },
              { q: '電磁閥要不要裝？', options: ['要', '不用'], answer: 0, why: '散熱器裝在外牆、管子拉長，系統裡的冷媒就多；停機時要用電磁閥把冷媒關在液管。〔錄音01 21:28〕', slide: 'cycle-lesson' },
              { q: '儲液器要不要裝？', options: ['要', '不用'], answer: 0, why: '膨脹閥系統一定要裝，確保送到膨脹閥的是源源不絕的液態。〔錄音02 10:17〕', slide: 'handout' },
              { q: '乾燥過濾器、壓力開關呢？', options: ['兩個都要', '看情況'], answer: 0, why: '乾燥過濾器一定要（系統不能有水）；壓力開關一定要（保護壓縮機）。〔錄音01 03:12〕〔錄音02 17:57〕', slide: 'handout' },
            ],
          },
          {
            title: '餐廳冷凍庫',
            story: '餐廳要做一間冷凍庫，機器想放在鐵皮屋頂上，老闆想省錢。',
            questions: [
              { q: '第一個要先問什麼？', options: ['要幾馬', '冰什麼', '預算多少'], answer: 1, why: '先問冰什麼，才知道要多大的壓縮機。〔錄音02 06:07〕', slide: 'recording-2' },
              { q: '想省錢用「無穿衫」散熱器，要提醒什麼？', options: ['沒差，直接裝', '鐵皮屋上夏天會到 50°C，散熱很差'], answer: 1, why: '裸露型比較便宜，但擺放位置很重要。〔錄音04 00:51〕', slide: 'recording-3' },
              { q: '溫控器的溫差一般抓幾度？', options: ['1°C', '4°C', '10°C'], answer: 1, why: '溫差太小，壓縮機開關太頻繁、影響壽命。〔錄音01 14:46〕', slide: 'recording' },
              { q: '冷凍庫的溫控跟冷藏有什麼不同？', options: ['冷凍要除霜', '沒有差別'], answer: 0, why: '冷藏和冷凍主要差在溫控：冷凍要除霜，冷藏不用。〔錄音03 03:28〕', slide: 'recording-3' },
              { q: '客人想用同一台壓縮機，順便帶隔壁的冷藏庫？', options: ['可以，比較省', '建議一對一'], answer: 1, why: '一藏一凍很難控制，還可能把壓縮機搞壞；一般一對一。〔錄音03 03:28〕', slide: 'recording-3' },
            ],
          },
          {
            title: '小冰箱維修',
            story: '客人拿小冰箱來修，系統用毛細管、沒有膨脹閥。',
            questions: [
              { q: '要不要加儲液器？', options: ['要', '不用'], answer: 1, why: '毛細管的小系統可以不裝；用膨脹閥的系統才一定要。〔錄音02 10:17〕', slide: 'handout' },
              { q: '電磁閥呢？', options: ['一定要', '小冰箱可以不裝'], answer: 1, why: '散熱外移、管路長才一定要；小冰箱可以不裝。〔錄音01 21:28〕', slide: 'cycle-lesson' },
              { q: '乾燥過濾器呢？', options: ['一定要', '可以省'], answer: 0, why: '系統只能有冷媒、不能有水，乾燥過濾器一定要。〔錄音01 03:12〕', slide: 'cycle-lesson' },
              { q: '只賣維修零件，對門市來說？', options: ['是主要生意', '利潤低，整套輸出才是主要生意'], answer: 1, why: '每天的工作是估冷凍庫；整套輸出金額才大。〔錄音02 06:53〕', slide: 'recording-2' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '估價心法',
      text: (
        <>
          先問<Hl>冰什麼</Hl>，壓縮機決定一切；散熱器配 2 倍，<Hl>乾燥過濾器、壓力開關一定要</Hl>，膨脹閥系統加儲液器，散熱外移加電磁閥。
        </>
      ),
    },
  },

  /* ───────────────────────── 名詞翻卡（間隔重複） ───────────────────────── */
  {
    id: 'glossary',
    part: 'review',
    chapter: '名詞翻卡',
    mark: 'WORDS',
    title: '名詞翻卡：國語・台語・英文・型號',
    en: 'Flashcards',
    blocks: [
      {
        type: 'flashcards',
        cards: [
          { group: '四大元件', term: '壓縮機', alias: '系統心臟', en: 'Compressor', tip: '不能壓縮液體；其他元件都跟著它配', part: 'comp' },
          { group: '四大元件', term: '冷凝器', alias: '散熱器、熱排（台語）', en: 'Condenser', tip: '把熱排到室外，氣態冷凝成液態', part: 'cond', tw: { rec: 1, from: 109.4, to: 113, say: '換這個台語叫做熱排' } },
          { group: '四大元件', term: '裸露型散熱器', alias: '無穿衫（台語：沒穿衣服）', en: 'Open-type Condenser', tip: '馬達外露、便宜；別放鐵皮屋上', part: 'cond', tw: { rec: 2, from: 408.2, to: 410.4, say: '人說無穿衫，就是這個' } },
          { group: '四大元件', term: '蒸發器', alias: '冷排（台語）', en: 'Evaporator', tip: '在庫內吸熱，液態蒸發成氣態', part: 'evap', tw: { rec: 1, from: 513.9, to: 518.5, say: '吸熱、冷排……因為這些是台語' } },
          { group: '四大元件', term: '膨脹閥', alias: '降壓節流', en: 'Expansion Valve（TE）', tip: '閥芯大小看壓縮機配', part: 'txv' },
          { group: '四大元件', term: '毛細管', alias: '小系統用', en: 'Capillary Tube', tip: '冰箱用來代替膨脹閥：便宜、可剪長短，但不能調；冷排大、能力大的改用膨脹閥' },
          { group: '四大元件', term: '機組', alias: '壓縮機＋配件', en: 'Condensing Unit', tip: '壓縮機、油分離器等配件裝在同一個底座上' },
          { group: '小零件', term: '儲液器', alias: '高壓儲液器', en: 'Receiver', tip: '確保送出去的是液態；膨脹閥系統一定要', part: 'receiver' },
          { group: '小零件', term: '液氣分離器', alias: '低壓儲液器', en: 'Accumulator', tip: '確保回壓縮機的是氣態', part: 'acc' },
          { group: '小零件', term: '乾燥過濾器', alias: '乾燥器', en: 'Filter Drier（DML）', tip: '吸水、濾雜質，一定要裝', part: 'dml' },
          { group: '小零件', term: '視液鏡', alias: '視窗', en: 'Sight Glass（SGI）', tip: '看冷媒夠不夠；指示環變黃代表含水', part: 'sgi' },
          { group: '小零件', term: '電磁閥', alias: '水龍頭（常閉）', en: 'Solenoid Valve（EVR）', tip: '通電才開；散熱外移一定要裝', part: 'evr' },
          { group: '小零件', term: '壓力開關', alias: '高低壓開關', en: 'Pressure Switch（KP 15）', tip: '一定要裝，保護壓縮機', part: 'kp15' },
          { group: '小零件', term: '手閥', alias: '球閥', en: 'Ball Valve（GBC）', tip: '換零件時前後關起來', part: 'gbc' },
          { group: '小零件', term: '油分離器', alias: '分油器', en: 'Oil Separator（OUB）', tip: '把跟著跑出去的冷凍油拉回壓縮機', part: 'oub' },
          { group: '小零件', term: '溫控器', alias: '感溫棒（放庫內）', en: 'Thermostat', tip: '庫內到溫就停機，回溫再啟動', part: 'tc' },
          { group: '小零件', term: '除霜電熱管', alias: '除霜', en: 'Defrost Heater', tip: '冷凍庫的冷排會結霜，要定時除霜' },
          { group: '管路', term: '液管', alias: '講義上的黃色線', en: 'Liquid Line', tip: '中溫中壓液態' },
          { group: '管路', term: '高壓氣管', alias: '講義上的紅色線', en: 'Discharge Line', tip: '高溫高壓氣態' },
          { group: '管路', term: '吸氣管', alias: '講義上的藍色線', en: 'Suction Line', tip: '低溫低壓氣態回到壓縮機' },
          { group: '管路', term: '高壓幾分、低壓幾分', alias: '接管規格', en: 'Discharge／Suction Size', tip: '壓縮機和零件都會寫：高壓（排氣）、低壓（吸氣）接管各幾分' },
          { group: '單位與冷媒', term: '馬', alias: '馬力（口語）', en: 'HP（正確單位是 BTU）', tip: '客人都講幾馬', tw: { rec: 2, from: 304.2, to: 306.3, say: '口語的話就講幾馬' } },
          { group: '單位與冷媒', term: '分', alias: '管徑單位', en: '1/8 inch', tip: '1 吋＝8 分＝25.4 mm，1 分＝3.175 mm' },
          { group: '單位與冷媒', term: '游標卡尺', alias: '卡尺', en: 'Vernier Caliper', tip: '量銅管外徑，÷ 3.175 就是幾分' },
          { group: '單位與冷媒', term: '喇叭口', alias: '擴管接頭', en: 'Flare（SAE）', tip: 'Danfoss 型號尾巴沒有 S＝喇叭口；有 S＝焊接' },
          { group: '單位與冷媒', term: '錶壓', alias: '公斤（kg/cm²）', en: 'psig（Gauge Pressure）', tip: '壓力錶讀到的數字；絕對壓力＝錶壓＋1 大氣壓' },
          { group: '單位與冷媒', term: '飽和溫度', alias: '管內溫度', en: 'Saturation Temperature', tip: '知道冷媒和錶壓，就能用 Ref Tools 查出來' },
          { group: '單位與冷媒', term: 'R22 210 psig', alias: '資深師傅的標竿', en: '≈ 40.42°C 冷凝', tip: '同一個溫度，拿來比其他冷媒的高壓' },
          { group: '單位與冷媒', term: '冷凍油', alias: 'POE、礦物油', en: 'Refrigeration Oil', tip: 'HFC 冷媒用 POE；不同的油不能混' },
          { group: '單位與冷媒', term: '混合冷媒', alias: 'R404A、R410A、R417A', en: 'Blend Refrigerant', tip: '有露點、泡點兩個溫度；Ref Tools 預設看露點' },
        ],
      },
    ],
    conclusion: {
      label: '為什麼要翻卡',
      text: (
        <>
          門市裡國語、台語、英文、型號混著講；<Hl>先自己說出來再翻面</Hl>，還不熟的會一直回來，直到記住。
        </>
      ),
    },
  },

  /* ───────────────────────── 各步小測驗（每一步結尾，提取練習） ───────────────────────── */
  ...(
    [
      {
        id: 'check-1',
        part: 'basics',
        step: '① 原理',
        items: [
          { q: '冷凍是在「製造冷」嗎？那為什麼會涼？', a: '不是；是熱被吸走了——液體蒸發成氣體時要吸熱。', slide: 'cycle-lesson' },
          { q: '四大金剛是哪四個？', a: '壓縮機、冷凝器（熱排）、膨脹閥、蒸發器（冷排）。', slide: 'cycle-lesson' },
          { q: '壓縮機能壓縮液體嗎？哪個零件在保護它？', a: '不能；液氣分離器讓液態沉下去，只讓氣態回壓縮機。', slide: 'cycle-lesson' },
        ],
      },
      {
        id: 'check-2',
        part: 'units',
        step: '② 單位',
        items: [
          { q: '1 吋等於幾分？幾 mm？', a: '1 吋＝8 分＝25.4 mm，所以 1 分＝3.175 mm。', slide: 'units' },
          { q: '銅管量起來 9.52 mm，是幾分？', a: '3 分（3 × 3.175 mm）。', slide: 'units' },
          { q: '溫度和壓力的關係，要用什麼查？', a: '冷媒工具 App（Ref Tools），查資料就能幫客人排除故障。', slide: 'units' },
        ],
      },
      {
        id: 'check-3',
        part: 'industry',
        step: '③ 裝置',
        items: [
          { q: '我們在冷鏈產業鏈的哪個位置？做什麼？', a: '在代理商和工程行之間：備貨庫存、技術諮詢、急件調貨、規格替代。', slide: 'industry' },
          { q: '客人說「我要幾坪的冷藏庫」，第一個要問什麼？', a: '冰什麼——才知道要多大的壓縮機。', slide: 'recording-2' },
          { q: '為什麼要知道客人的裝置用在哪裡？', a: '才知道怎麼跟客人溝通、需要多大的壓縮機。', slide: 'recording-3' },
        ],
      },
      {
        id: 'check-4',
        part: 'components',
        step: '④ 元件',
        items: [
          { q: '壓縮機 1 馬，散熱器一般配幾馬？', a: '2 馬；膨脹閥閥芯、冷排大小也都跟著壓縮機配。', slide: 'recording-2' },
          { q: '乾燥過濾器為什麼一定要裝？', a: '系統只能有冷媒、不能有水，水會結冰塞住管路；它吸水也濾雜質。', slide: 'handout' },
          { q: '視液鏡的含水指示環變黃，代表什麼？', a: '系統含水過多、乾燥過濾器吸飽了，要盡快更換；綠色才是乾燥正常。', slide: 'handout' },
        ],
      },
      {
        id: 'check-5',
        part: 'practice',
        step: '⑤ 實務',
        items: [
          { q: '高壓過高，第一步先查什麼？', a: '冷凝器：摸出風溫度、看鰭片髒不髒、風扇轉向對不對。', slide: 'ch9' },
          { q: '低壓過低，先看哪裡？', a: '蒸發器有沒有結霜、風扇有沒有轉，再看視液鏡有沒有氣泡。', slide: 'ch9' },
          { q: '客人一進門就要補冷媒，你要先問什麼？', a: '漏在哪、補過幾次；反覆補代表有漏點，要先檢漏、修漏。', slide: 'sop' },
        ],
      },
    ] as const
  ).map(
    ({ id, part, step, items }): SlideData => ({
      id,
      part,
      chapter: '小測驗',
      mark: 'CHECK',
      title: `${step}｜小測驗`,
      en: 'Checkpoint',
      blocks: [{ type: 'quiz', items: items.map((item) => ({ ...item })) }],
      conclusion: {
        label: '小測驗',
        text: (
          <>
            先自己說出答案再翻開；答不出來的點「P.xx」回去看，<Hl>全部答對再往下一步</Hl>。
          </>
        ),
      },
    }),
  ),

  /* ───────────────────────── 自我檢測（提取練習） ───────────────────────── */
  {
    id: 'quiz',
    part: 'review',
    chapter: '自我檢測',
    mark: 'QUIZ',
    title: '自我檢測：先想，再翻答案',
    en: 'Self-Check',
    blocks: [
      {
        type: 'quiz',
        items: [
          {
            q: '冷媒一圈的四個狀態，依序是什麼？',
            a: '高溫高壓氣態 → 中溫中壓液態 → 液氣混合 → 低溫低壓氣態。',
            slide: 'cycle-lesson',
          },
          {
            q: '膨脹閥出來，算不算真正的低壓？',
            a: '不算；還是半液半氣，要進蒸發器完全蒸發後，才是真正的低溫低壓。',
            slide: 'cycle-lesson',
          },
          {
            q: '為什麼膨脹閥系統一定要裝儲液器？冰箱為什麼不用？',
            a: '確保送到膨脹閥的是源源不絕的液態；冰箱用毛細管，小系統不用裝。',
            slide: 'handout',
          },
          {
            q: '液氣分離器裝在哪裡？在保護什麼？',
            a: '冷排和壓縮機中間；只讓氣態回去，保護壓縮機不被液體打壞。',
            slide: 'cycle-lesson',
          },
          {
            q: '壓縮機 1 馬，散熱器一般配幾馬？',
            a: '一般配 2 馬；膨脹閥閥芯、冷排大小也都跟著壓縮機配。',
            slide: 'recording-2',
          },
          {
            q: '溫控設 -20°C、溫差 4°C，壓縮機幾度停、幾度再啟動？',
            a: '-20°C 停、-16°C 再啟動；溫差太小，壓縮機會開關太頻繁。',
            slide: 'recording',
          },
          {
            q: '電磁閥平常是開還是關？什麼情況一定要裝？',
            a: '常閉，通電才開；散熱外移、管路很長時一定要裝。',
            slide: 'cycle-lesson',
          },
          {
            q: '2 分、4 分、6 分各是幾 mm？',
            a: '6.35、12.7、19.05 mm（1 分＝25.4 ÷ 8＝3.175 mm）。',
            slide: 'units',
          },
          {
            q: '一台壓縮機可以同時帶冷藏和冷凍嗎？',
            a: '很難，容易出問題；一般一對一，兩庫同溫（都冷藏或都冷凍）才一對二。',
            slide: 'recording-3',
          },
          {
            q: '學習順序是什麼？哪些放到第二階段（進階）？',
            a: '原理 → 單位 → 裝置 → 壓縮機 → 零配件；計算、過冷過熱度放到第二階段（進階）。',
            slide: 'overview',
          },
        ],
      },
    ],
    conclusion: {
      label: '為什麼要考自己',
      text: (
        <>
          先自己想、再看答案，比重讀一次記得更牢；<Hl>隔 1 天、3 天、1 週</Hl>各做一次，效果最好。
        </>
      ),
    },
  },

  /* ───────────────────────── 16 三大 Insight ───────────────────────── */
  {
    id: 'insights',
    source: 'handbook',
    part: 'advanced',
    advanced: true,
    chapter: '進階 Insight',
    mark: 'INSIGHT',
    title: '進階：三大核心工程 Insight',
    en: 'Three Core Insights',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-3',
        children: [
          {
            type: 'insight',
            no: '01',
            icon: Scale,
            tone: 'ice',
            title: '動態熱平衡思維',
            en: 'Energy Conservation',
            body: (
              <>
                冷凍系統就像<Hl>熱量輸送帶</Hl>：冷凝器（室外機）的熱散不掉，蒸發器就吸不走庫內的熱。
              </>
            ),
            children: [
              {
                type: 'equation',
                compact: true,
                result: { symbol: 'THR', label: '冷凝器必須吐掉的熱', tone: 'amber' },
                terms: [
                  {
                    symbol: (
                      <>
                        Q<Sub>o</Sub>
                      </>
                    ),
                    label: '蒸發器吸的熱',
                    tone: 'ice',
                  },
                  { symbol: 'W', label: '壓縮機壓縮功', tone: 'violet' },
                ],
              },
            ],
          },
          {
            type: 'insight',
            no: '02',
            icon: ShieldCheck,
            tone: 'amber',
            title: '四大安全邊界',
            subtitle: '守護機器壽命',
            en: 'Safety Boundaries',
            children: [
              {
                type: 'boundaries',
                items: [
                  { label: '排氣溫度（排氣管 6″ 處）', value: '≤ 107°C', note: '防冷凍油碳化', tone: 'red' },
                  { label: '吸氣過熱度（蒸發器出口）', value: '5 ~ 7°C', note: '防回液敲缸', tone: 'ice' },
                  { label: '液管過冷度', value: '≈ 5°C', note: '防閃發氣體', tone: 'indigo' },
                  { label: '單級壓比', value: '≤ 8 ~ 10', note: '防容積效率崩塌・業界經驗值', tone: 'amber' },
                ],
              },
            ],
          },
          {
            type: 'insight',
            no: '03',
            icon: Wrench,
            tone: 'emerald',
            title: '現場查修鐵則',
            subtitle: '先物理機械，後熱力冷媒',
            en: 'Mechanical First',
            body: (
              <>
                冷媒封閉在管路裡，<Hl>不會無緣無故增加或減少</Hl>。
              </>
            ),
            children: [
              {
                type: 'flow',
                direction: 'col',
                compact: true,
                bare: true,
                tone: 'emerald',
                steps: [
                  { title: '風扇' },
                  { title: '鰭片' },
                  { title: '結霜' },
                  { title: '保溫' },
                  { title: '感溫包' },
                  { title: '最後才動冷媒壓力錶', tone: 'amber' },
                ],
              },
            ],
          },
        ],
      },
    ],
    conclusion: {
      text: (
        <>
          熱要<Hl>搬得走</Hl>、邊界要<Hl>守得住</Hl>、查修要<Hl>先物理後冷媒</Hl>——這就是冷鏈工程的底層邏輯。
        </>
      ),
    },
  },

  /* ───────────────────────── 17 Q&A ───────────────────────── */
  {
    id: 'qa',
    part: 'summary',
    chapter: '結語',
    mark: 'Q&A',
    title: '互動問答與培訓結語',
    en: 'Q&A · Action Items',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'checklist',
            id: 'newcomer-checklist-v2',
            title: '新人實務檢核清單（照學習順序）',
            en: 'Readiness Checklist',
            items: [
              '① 不看講義，畫出冷凍循環一圈並標出四個狀態',
              '① 說得出四大金剛各在做什麼，國語、台語名稱都會',
              '② 會換算管徑「分」（1 分＝3.175 mm），會用游標卡尺量銅管',
              '③ 客人報坪數時，知道先問「冰什麼」再選馬力',
              '④ 能說出店內各類品項，以及它們在循環中的位置',
              '⑤ 會用「接單六問」完成一張規格正確的訂單',
              '⑤ 客人要補冷媒時，會先詢問漏點與補充次數',
            ],
          },
          {
            type: 'qa',
            icon: MessagesSquare,
            tone: 'ice',
            title: '互動問答',
            en: 'Questions & Answers',
            prompts: ['最近門市最常被問倒的問題是什麼？', '哪一類品項的規格最容易搞混？', '現場異常數據該如何判讀？'],
            links: [
              { label: '核心圖解：循環一圈', slide: 'cycle-lesson' },
              { label: '單位：管徑「分」', slide: 'units' },
              { label: '店內產品地圖', slide: 'products' },
              { label: '講義零件總覽', slide: 'handout' },
              { label: '四大故障診斷矩陣', slide: 'ch9' },
              { label: '門市接單問診 SOP', slide: 'sop' },
              { label: '自我檢測', slide: 'quiz' },
              { label: '聽原音複習', slide: 'recording' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '結語',
      text: (
        <>
          知其然，更知其所以然。<Hl>遵守規範，工程無難事！</Hl>
        </>
      ),
    },
  },
]

/**
 * 顯示順序：先全貌再細節（核心圖解在前）、照錄音中的學習順序
 * 原理 → 單位 → 裝置 → 壓縮機與零配件 → 門市實務，之後複習、結語；計算與調校為第二階段（進階）。
 */
const ORDER = [
  'cover',
  'owner',
  'overview',
  'cycle-lesson',
  'strokes',
  'check-1',
  'units',
  'reftools',
  'reftable',
  'refrigerants',
  'check-2',
  'industry',
  'check-3',
  'products',
  'ch2',
  'ch3',
  'ch4',
  'ch5',
  'handout',
  'check-4',
  'estimate',
  'ch9',
  'sop',
  'check-5',
  'recording',
  'recording-2',
  'recording-3',
  'glossary',
  'quiz',
  'lesson-insights',
  'qa',
  'ch6',
  'ch7-8',
  'insights',
]

export const slides: SlideData[] = ORDER.map((id) => {
  const slide = slideList.find((s) => s.id === id)
  if (!slide) throw new Error(`找不到投影片：${id}`)
  return slide
})
