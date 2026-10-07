import {
  ArrowLeftRight,
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
  GitFork,
  GraduationCap,
  Handshake,
  HeartHandshake,
  HardHat,
  History,
  Layers,
  Lightbulb,
  MapPin,
  MessagesSquare,
  Package,
  Plug,
  Refrigerator,
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
  Wind,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'
import handoutImg from '../assets/1001-handout.jpg'
import insulationImg from '../assets/1005-insulation-chart.jpg'
import refrigerantTableImg from '../assets/refrigerant-table.jpg'
import { Danger, Em, Exp, Frac, Hl, Sub, Warn } from '../components/ui/rich'
import { CLASS_AUDIO, CLASS_AUDIO_10, CLASS_AUDIO_11, CLASS_AUDIO_12, CLASS_AUDIO_13, CLASS_AUDIO_14, CLASS_AUDIO_2, CLASS_AUDIO_3, CLASS_AUDIO_4, CLASS_AUDIO_5, CLASS_AUDIO_6, CLASS_AUDIO_7, CLASS_AUDIO_8, CLASS_AUDIO_9 } from './media'
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
              { code: '行程', title: '四大行程', slide: 'strokes' },
              { code: '圖解', title: '冷凍循環一圈', slide: 'cycle-lesson' },
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
              { code: '卡尺', title: '游標卡尺量幾分', slide: 'caliper' },
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
            chapters: [
              { code: '產業', title: '產業鏈與客人的裝置', slide: 'industry' },
              { code: '冰箱', title: '冰箱與機上型', slide: 'fridge-types' },
            ],
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
              { code: '貨架', title: '壓縮機：牌子、電壓、拿貨', slide: 'comp-brands' },
              { code: 'CH.03', title: '冷凝器', slide: 'ch3' },
              { code: '規格', title: '散熱器排×支', slide: 'coil-spec' },
              { code: '實務', title: '冷凝器配多大', slide: 'cond-practice' },
              { code: '種類', title: '散熱器三種', slide: 'outdoor-units' },
              { code: 'CH.04', title: '蒸發器', slide: 'ch4' },
              { code: 'CH.05', title: '控制與保護', slide: 'ch5' },
              { code: '配件', title: '乾燥、接頭、保溫', slide: 'drier-sizes' },
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
              { code: '門市', title: '客人來問散熱器', slide: 'coil-store' },
              { code: '冷氣', title: '冷氣材料', slide: 'ac-materials' },
              { code: '心法', title: '材料行的服務心法', slide: 'store-mindset' },
              { code: '新人', title: '新人業務怎麼開始', slide: 'newbie-sales' },
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
        className: 'grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]',
        children: [
          { type: 'showcase', parts: [{ id: 'comp', label: '壓縮機' }] },
          {
            type: 'grid',
            className: 'grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]',
            children: [
              {
                type: 'grid',
                className: 'grid-rows-[auto_minmax(0,1fr)]',
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
                    流速夠快，冷凍油才回得了壓縮機。
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

  /* ───────────────────────── 壓縮機貨架（錄音13） ───────────────────────── */
  {
    id: 'comp-brands',
    added: '2026-10-07',
    part: 'components',
    chapter: '壓縮機貨架',
    mark: 'BRANDS',
    title: '壓縮機貨架：四個牌子怎麼認',
    en: 'Compressor Brands on the Shelf',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]',
        children: [
          {
            type: 'list',
            icon: Boxes,
            tone: 'ice',
            title: '店裡常備的四個牌子',
            en: 'Four Brands',
            items: [
              { icon: Package, title: '英博格（Embraco）', desc: '小顆的，一馬以下。家用冰箱、小冰箱用；型號後面會寫電壓，110 和 220 要分清楚', badge: { label: '小顆', tone: 'ice' } },
              { icon: Factory, title: '鐵甲（Tecumseh）', desc: '法國廠（型號 GAJ、AW 開頭）和泰國廠（KK 系列）；數字越大越大顆', badge: { label: '中小顆', tone: 'teal' } },
              { icon: Cylinder, title: 'Copeland（黑金剛）', desc: '店裡賣最多，口語叫黑金剛、孔不爛；CS、CR、CF 系列，分高溫、中溫、低溫；印度廠和墨西哥廠都有', badge: { label: '賣最多', tone: 'amber' } },
              { icon: Snowflake, title: 'Danfoss（現在叫 Secop）', desc: '壓縮機部門已改名 Secop，很多人還是叫 Danfoss。型號裡有 G 的灌 R134a（冷藏）、有 CL 的灌 R404A（冷凍）；數字越大越大顆', badge: { label: '看冷媒', tone: 'violet' } },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'table',
                tone: 'ice',
                corner: '型號怎麼讀',
                head: ['CS27K TF5', 'CS20K PFV', '12G', '12CL'],
                rows: [
                  { label: '牌子', cells: ['Copeland', 'Copeland', 'Danfoss（Secop）', 'Danfoss（Secop）'] },
                  { label: '意思', cells: ['27＝大小；TF5＝三相', 'PFV＝單相', 'G＝R134a 冷藏', 'CL＝R404A 冷凍'] },
                  { label: '客人會說', cells: ['「27 三相」', '「20 單相」', '「12 冷藏的」', '「12C」' ] },
                ],
                notes: [<>型號牌上找 <Hl>PH</Hl>（相位）：PH 1＝單相、PH 3＝三相。看不懂的字母先看這兩個：<Em>幾號（大小）</Em>、<Em>單相或三相</Em>。〔錄音13 20:47〕</>],
              },
              {
                type: 'info',
                icon: ArrowLeftRight,
                tone: 'amber',
                title: '每個牌子都有「同等級」可以互相代替',
                en: 'Equivalents',
                body: (
                  <>
                    客人要的型號缺貨，老闆會拿<Hl>同等級</Hl>的代替：要對的是 <Em>BTU（能力）</Em>和<Em>排氣量</Em>，還有電壓、單相三相。架上同一個位置貼三張標籤，就是三個互相代替的型號。〔錄音13 03:29、15:35〕
                  </>
                ),
                warn: '不批評別家的牌子：客人問評價，只說我們賣的是哪一種、為什麼。',
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
          先認<Hl>牌子</Hl>，再從型號看出<Hl>大小</Hl>和<Hl>單相三相</Hl>；缺貨時拿同等級的代替，能力和電壓都要對。
        </>
      ),
    },
  },
  {
    id: 'comp-power',
    added: '2026-10-07',
    part: 'components',
    chapter: '壓縮機貨架',
    mark: 'POWER',
    title: '電壓與相位：拿錯一個字就燒掉',
    en: 'Voltage & Phase',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'metrics',
                icon: Zap,
                tone: 'red',
                title: '先看電壓，再看相位',
                en: 'Voltage First',
                cols: 2,
                items: [
                  { label: '110V', value: '2 條線', unit: '單相', tone: 'amber', note: '只有一馬以下的小顆才有；110 和 120 不能混用' },
                  { label: '220V', value: '2 條線', unit: '單相', tone: 'ice', note: '最常見；三相（3 條線）只有大顆的才有，220 或 380' },
                ],
                footnote: <>客人要 220、你拿 110，通電就燒掉；<Hl>壓縮機焊過就不能退</Hl>，公司要自己吸收。〔錄音13 00:54、07:45〕</>,
              },
              {
                type: 'compare',
                icon: Cog,
                tone: 'teal',
                title: '往復式 vs 渦捲式',
                en: 'Reciprocating vs Scroll',
                axis: ['長相', '單相配件', '常見'],
                left: {
                  badge: '往復式',
                  value: '矮、胖',
                  tone: 'teal',
                  rows: [
                    { k: '長相', v: '比較矮、比較胖' },
                    { k: '單相配件', v: '繼電器＋啟動電容＋運轉電容（一盒）' },
                    { k: '常見', v: '小顆的幾乎都是' },
                  ],
                  use: '一馬以下到幾馬的都有',
                },
                right: {
                  badge: '渦捲式',
                  value: '高、瘦',
                  tone: 'indigo',
                  rows: [
                    { k: '長相', v: '長得比較高' },
                    { k: '單相配件', v: '只有一顆運轉電容' },
                    { k: '常見', v: '大顆的（黑金剛 ZS 系列）' },
                  ],
                  use: '回管多半是六分，保溫管用很多',
                },
              },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1fr)_auto]',
            children: [
              {
                type: 'list',
                icon: Plug,
                tone: 'ice',
                title: '出貨時要一起拿的配件',
                en: 'What Goes With It',
                items: [
                  { icon: CircleCheck, title: '三相：只要角座', desc: '四個角座固定壓縮機，中間插柱子，螺絲從底板鎖上去；220 或 380 三相都一樣', badge: { label: '簡單', tone: 'emerald' } },
                  { icon: Boxes, title: '單相：角座＋一盒配件', desc: '原廠配好的盒子：繼電器（Relay）、啟動電容、運轉電容，線都接好了', badge: { label: '三樣', tone: 'amber' } },
                  { icon: Ban, title: '配件不能拿錯盒', desc: '不同型號的配件盒內容不一樣；先對壓縮機，再對配件', badge: { label: '注意', tone: 'red' } },
                  { icon: Route, title: '兩支管、三支管', desc: '兩支＝高壓吐出、低壓吸入；第三支是充灌閥，灌冷媒、測壓力用', badge: { label: '看管子', tone: 'teal' } },
                ],
              },
              {
                type: 'info',
                icon: HardHat,
                tone: 'slate',
                title: '怎麼抱壓縮機',
                en: 'Carrying',
                body: <>不重，但<Hl>不要抓管子</Hl>：管子脆弱，脫落就沒人要了。一手扶底座、一手扶機身，稍微傾斜抱著走。〔錄音13 30:59〕</>,
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
          <Hl>電壓</Hl>和<Hl>單相三相</Hl>先對，再對配件：三相只要角座，單相還要一盒繼電器和電容。
        </>
      ),
    },
  },
  {
    id: 'comp-temp',
    added: '2026-10-07',
    part: 'components',
    chapter: '壓縮機貨架',
    mark: 'TEMP',
    title: '高溫、中溫、低溫：誰可以代替誰',
    en: 'High / Medium / Low Temp',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'flow',
            direction: 'col',
            tone: 'ice',
            icon: ThermometerSnowflake,
            title: '黑金剛的三種溫度（往復式）',
            en: 'CR / CS / CF',
            steps: [
              { title: 'CR＝高溫（冷藏）', desc: '打冷藏用；價格最低', icon: Thermometer, tone: 'amber', tag: '高溫' },
              { title: 'CS＝中溫', desc: '介於中間：打冷藏可以、打冷凍也可以', icon: ThermometerSnowflake, tone: 'teal', tag: '中溫' },
              { title: 'CF＝低溫（冷凍）', desc: '純低溫，-20°C 的冷凍庫；越低溫越貴，一馬半的低溫機比兩馬半的中溫機還貴', icon: Snowflake, tone: 'ice', tag: '低溫' },
            ],
            result: { label: '規則', text: '低溫可以往上打（打冷藏），高溫不能往下打（打冷凍）；所以缺貨時用「更低溫的」代替，不能反過來' },
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'table',
                tone: 'amber',
                corner: '同牌子的世代',
                head: ['K6', 'K7'],
                rows: [
                  { label: '產地', cells: ['墨西哥廠', '印度廠'] },
                  { label: '用途', cells: ['中溫', '冷藏（第三代 CS，代替原本的 CR）'] },
                  { label: '怎麼記', cells: ['箱子不一樣', '型號一樣叫 CS，看後面的 K7'] },
                ],
                notes: [<>同樣寫 CS20，K6 和 K7 不是同一顆；老闆在電腦裡把 K7 記成「CR」，因為它代替的是冷藏機。〔錄音13 36:06～43:00〕</>],
              },
              {
                type: 'list',
                icon: ArrowLeftRight,
                tone: 'teal',
                title: '代替的三個條件',
                en: 'Substitution Rules',
                items: [
                  { icon: Scale, title: '能力要對', desc: '對 BTU 和排氣量；大小不能差一級' },
                  { icon: Zap, title: '電壓、相位要一樣', desc: '單相換單相、三相換三相' },
                  { icon: ThermometerSnowflake, title: '溫度只能往低的換', desc: '低溫缺貨不能拿高溫代；中溫可以代高溫' },
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
          冷藏用<Hl>高溫機</Hl>、冷凍用<Hl>低溫機</Hl>，中溫兩邊都能打；代替只能拿<Em>更低溫</Em>的，能力和電壓還是要對。
        </>
      ),
    },
  },
  {
    id: 'comp-pick',
    added: '2026-10-07',
    part: 'components',
    chapter: '壓縮機貨架',
    mark: 'PICK',
    title: '拿壓縮機的 SOP：一個字都不能錯',
    en: 'Picking SOP',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'checklist',
            id: 'comp-pick-check',
            title: '出貨前對一遍',
            en: 'Before It Leaves',
            items: [
              <>型號<Hl>一個字一個字</Hl>對：客人傳的型號照著唸，最後一碼也要對〔錄音13 08:36〕</>,
              <>電壓對了嗎：110 還是 220？三相是 220 還是 380？</>,
              <>單相有沒有拿配件盒；三相有沒有拿角座</>,
              <>溫度對嗎：冷藏拿高溫機，冷凍拿低溫機</>,
              <>箱子上的字跟型號牌一樣嗎（紙箱有時候是重新包的）</>,
              <>客人要的是哪一顆，不是「長得一樣」的那一顆（2446 和 2464 長得一模一樣，能力不同）</>,
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1fr)_auto]',
            children: [
              {
                type: 'list',
                icon: Warehouse,
                tone: 'ice',
                title: '貨架為什麼這樣排',
                en: 'Why the Shelf Looks Like This',
                items: [
                  { icon: ArrowLeftRight, title: '110 和 220 故意放遠', desc: '離越遠越好，拿錯的機率就小；110 的還特別用筆標出來' },
                  { icon: MapPin, title: '一個蘿蔔一個坑', desc: '一種型號一個位置；少賣的各放一顆、常賣的放三顆，空了就知道要叫貨' },
                  { icon: Boxes, title: '同等級貼在一起', desc: '同一個位置貼三張標籤＝三個可以互相代替的型號' },
                  { icon: Droplets, title: '紙箱不放地上', desc: '下雨會滲水：紙箱一定往上擺，鐵的放下面' },
                ],
              },
              {
                type: 'info',
                icon: ShieldAlert,
                tone: 'red',
                title: '為什麼壓縮機特別嚴',
                en: 'No Returns',
                body: <>管子一焊上去就算用過，<Hl>原廠一概不負責</Hl>，每個牌子都一樣。拿錯型號或電壓，客人不會認，公司只能自己吸收。〔錄音13 07:45〕</>,
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
          壓縮機<Hl>焊過就不能退</Hl>：出貨前型號、電壓、相位、配件、溫度全部再對一次，一個字都不能錯。
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
        className: 'grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]',
        children: [
          { type: 'showcase', parts: [{ id: 'cond', label: '氣冷式冷凝器' }] },
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
        className: 'grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]',
        children: [
          { type: 'showcase', parts: [{ id: 'evap', label: '蒸發器（冷風機）' }] },
      {
        type: 'grid',
        className: 'grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)]',
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
                    回溫到 8～10°C 就停止加熱；感溫器裝在結霜最厚處
                    <Exp />
                  </>
                ),
              },
              {
                icon: Fan,
                title: '風扇延遲 Fan Delay',
                desc: (
                  <>
                    除霜後風扇晚 2～3 分鐘才轉，熱不會被吹進庫內
                    <Exp />
                  </>
                ),
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
        className: 'grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]',
        children: [
          {
            type: 'showcase',
            parts: [
              { id: 'txv', label: '膨脹閥' },
              { id: 'evr', label: '電磁閥' },
              { id: 'kp15', label: '壓力開關' },
              { id: 'sgi', label: '視液鏡' },
              { id: 'gbc', label: '手閥' },
              { id: 'dml', label: '乾燥過濾器' },
            ],
          },
      {
        type: 'grid',
        className: 'grid-rows-[auto_minmax(0,1fr)]',
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
                className: 'grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]',
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
            type: 'flow',
            direction: 'col',
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
  /* ───────────────────────── 1002 課堂錄音 Part 1（之後 10/2 的錄音加在 tracks） ───────────────────────── */
  {
    id: 'recording-4',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 4',
    title: '錄音06｜毛細管冷排與店內實物',
    en: 'Recording 06',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_6,
        title: '錄音06',
        en: 'Class Recording',
        duration: '03:11',
        chapters: [
          { at: 0, title: '毛細管：便宜、可以剪長短', summary: '毛細管是細小的銅管，剪一段才幾百塊，長短可以自己剪；冰箱的冷排上面接毛細管就好' },
          { at: 23, title: '「冷排」是籠統的說法', summary: '冷藏、冷凍的蒸發器都叫冷排；冷排、熱排的形式有百百種，這個是冰箱用的冷排' },
          { at: 49, title: '有凸出的接管＝毛細管型', summary: '冷排上有凸出來的接管，就是接毛細管的型；沒有就是膨脹閥型。冷排大、能力大的，建議用膨脹閥型' },
          { at: 92, title: '看貨架：壓縮機、冷媒、冷凍油', summary: '壓縮機看型號；冷媒鋼瓶有藍的、紅的，直接看標籤寫的型號；冷凍油一罐 4 公升，店裡叫「一加侖」，一箱 6 罐' },
          { at: 151, title: '送貨要排順序', summary: '一次送三家以上，先排好先後順序，順路就好' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          冰箱這類小系統用<Hl>毛細管</Hl>（便宜、可剪長短）；冷排大、能力大的用<Hl>膨脹閥型</Hl>。看冷排有沒有凸出的接管就分得出來。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 下午 錄音07～11 ───────────────────────── */
  {
    id: 'recording-5',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 5',
    title: '錄音07–08｜老闆看簡報、散熱器配多大與排×支',
    en: 'Recording 07–08',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_7,
        title: '錄音07–08',
        en: 'Class Recording',
        duration: '17:19',
        tracks: [
          { label: '07', src: CLASS_AUDIO_7, duration: '17:19' },
          { label: '08', src: CLASS_AUDIO_8, duration: '08:02' },
        ],
        chapters: [
          { track: 0, at: 90, title: '儲液器要「進去再出來」', summary: '老闆看簡報的 3D：冷媒要進到儲液器桶子裡，液體沉在底部再取出來，不是從旁邊經過' },
          { track: 0, at: 165, title: '膨脹閥裝在蒸發器旁', summary: '很多師傅做「內膨」，把膨脹閥鎖在蒸發器箱子裡（會結冰、滴水）；電磁閥也拉到膨脹閥附近' },
          { track: 0, at: 230, title: '冷凝器上進下出', summary: '銅管在裡面左去右回；高溫高壓氣體進去，出來變中溫中壓液體' },
          { track: 0, at: 300, title: '摸出口判斷散熱好不好', summary: '出口是溫的＝正常；還很燙＝鰭片髒或風扇壞，要清洗' },
          { track: 0, at: 363, title: '冷凝溫度 40～45°C', summary: '用摸的大概知道；最準是用錶組量壓力，R22 在 210 psig 約 40°C' },
          { track: 0, at: 628, title: '擺放環境影響散熱', summary: '太陽直射、鐵皮屋、防火巷裡冷氣熱風繞回來，都會讓散熱變差；可以裝導風罩' },
          { track: 0, at: 740, title: '水冷 vs 氣冷、散熱越好能力越大', summary: '型錄冷凝溫度水冷抓 37.8°C、氣冷抓 49°C；冷凝溫度越低，壓縮機能力越大' },
          { track: 1, at: 0, title: '散熱器＝壓縮機 ×2', summary: '1 馬壓縮機配 2 馬散熱器是標準；放在熱的廚房要加大，外移到通風好的地方可以小一點' },
          { track: 1, at: 258, title: '排怎麼數', summary: '排是一層一層的；跨到下一排的彎頭是斜的' },
          { track: 1, at: 310, title: '支怎麼數', summary: '沿著同一排畫一條線，數線上有幾個孔，例如 5 排 11 支' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          儲液器要<Hl>進去再出來</Hl>、膨脹閥裝在<Hl>蒸發器旁</Hl>；散熱器先抓<Hl>壓縮機 ×2</Hl>，摸出口溫的才正常。
        </>
      ),
    },
  },
  {
    id: 'recording-6',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 6',
    title: '錄音09｜實內、封底與散熱器測漏',
    en: 'Recording 09',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_9,
        title: '錄音09',
        en: 'Class Recording',
        duration: '20:37',
        chapters: [
          { at: 50, title: '找平的彎頭就分得出排和支', summary: '平的彎頭一定在同一排裡，順著它的方向數就是支；排沒有平的彎頭' },
          { at: 120, title: '鏡面＝實內＝有效長度', summary: '規格的第三個數字是有鰭片的長度（例如 330 mm）；老闆叫「實內」，客人比較聽得懂' },
          { at: 260, title: '散熱器沒有充灌閥', summary: '工廠灌氣泡水抓漏後就把管口壓死；冷排單價高才有充灌閥' },
          { at: 354, title: '先進先出、施工前先測', summary: '進貨寫日期、先進先出；請客人施工前先折開聽有沒有氣，有問題馬上換新' },
          { at: 470, title: '買賣說斷斷', summary: '東西沒有百分之百不漏，話要先講在前頭，保護客人也保護自己' },
          { at: 510, title: '抓漏＝站壓', summary: '師傅可以從充灌閥灌氮氣、泡水找漏點再焊起來；店裡盡量直接換新，不讓客人折騰' },
          { at: 700, title: '風斗：風只吹得到鰭片', summary: '外面包一層風斗，風車才裝得上去；只有銅管、沒有鰭片的地方幫助散熱很少' },
          { at: 886, title: '基板 vs 封底', summary: '基板是放壓縮機的板子；沒有基板就要把底封起來，風才會照路線穿過鰭片' },
          { at: 1091, title: '庫存只做兩種', summary: '附基板、封底（不附基板）兩種就好；只換散熱器的，拆掉封底板就能裝' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          鏡面就是<Hl>實內</Hl>（有鰭片的長度）；散熱器沒有充灌閥，<Hl>先進先出、施工前先折開測</Hl>，有問題馬上換。
        </>
      ),
    },
  },
  {
    id: 'recording-7',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 7',
    title: '錄音10–11｜規格對照、配對與室外機',
    en: 'Recording 10–11',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_10,
        title: '錄音10–11',
        en: 'Class Recording',
        duration: '40:51',
        tracks: [
          { label: '10', src: CLASS_AUDIO_10, duration: '40:51' },
          { label: '11', src: CLASS_AUDIO_11, duration: '12:41' },
        ],
        chapters: [
          { track: 0, at: 60, title: '換壓縮機先問熱排、冷排', summary: '四大金剛要配對；很多壓縮機燒掉，是原本就配錯、散熱不良' },
          { track: 0, at: 152, title: '機組也要配得上設備', summary: '冰箱用的機組裝到大冰箱，溫度到不了、壓縮機停不下來，很耗電' },
          { track: 0, at: 461, title: '請客人拍穿管面', summary: '拍全部都是彎頭的那一面，數得出幾排幾支；焊接面不用看' },
          { track: 0, at: 563, title: '長度：實內或含彎頭', summary: '客人怎麼量都可以；量實內最準，含兩側彎頭大約多 6 公分' },
          { track: 0, at: 974, title: '支數看高度', summary: '11 支配 10 吋風車、高約 29 公分；14 支配 12 吋、高 36.5 公分' },
          { track: 0, at: 1604, title: '屋外型（室外機）', summary: '有外殼、馬達在裡面：好看、安靜、不怕風吹雨淋；一般散熱器馬達外露' },
          { track: 0, at: 2169, title: '選室外機：安靜、重量、實際能力', summary: '吵到鄰居會被檢舉；壁掛要吊上去，太重搬不動；同樣標 10 馬，實際能力可能差一級' },
          { track: 1, at: 52, title: '機上型冰箱', summary: '散熱器放在冰箱頂上；冰箱約 2 公尺高，只能用 11 支的散熱器' },
          { track: 1, at: 255, title: '冰箱種類與保溫', summary: '70% 是上凍下藏；玻璃門保溫比 PU 發泡差，壓縮機要加大' },
          { track: 1, at: 561, title: '含壓縮機的室外機像冷氣', summary: '只拉兩支管：液管和低壓管；冷氣做外膨，冷凍做內膨' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          客人只說「四排十四支」不夠，還要<Hl>長度</Hl>；換壓縮機一定先問<Hl>熱排、冷排多大</Hl>。
        </>
      ),
    },
  },
  /* ───────────────────────── 1005 錄音12：卡尺、乾燥過濾器、喇叭頭、冷氣材料、保溫管 ───────────────────────── */
  {
    id: 'recording-8',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 8',
    title: '錄音12｜卡尺、乾燥過濾器、喇叭頭、冷氣材料、保溫管',
    en: 'Recording 12',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_12,
        title: '錄音12（10/5）',
        en: 'Class Recording',
        duration: '68:22',
        chapters: [
          { at: 123, title: '兩門白鐵冰箱', summary: '分兩尺、兩尺半、四尺、六尺（一尺約 30 公分）；全冷凍、半凍半藏、全冷藏，配的壓縮機、冷排、熱排都不一樣大' },
          { at: 242, title: '游標卡尺怎麼看', summary: '游尺的 0 對到哪就讀哪；英制 1 吋＝25.4 mm 分成 8 分，1 分＝3.175 mm' },
          { at: 468, title: '看長刻度最快', summary: '長的刻度是雙數 2、4、6 分；1吋3分＝11 × 3.175＝34.92 mm' },
          { at: 719, title: '銅管量外徑、看厚度', summary: '銅管量外徑；2～5分厚 0.8 mm，6分以上用 1.0 mm，管子越粗越要厚' },
          { at: 985, title: '接頭、彎頭量內徑', summary: '銅管插在裡面，所以量內徑；有直接頭、90 度、45 度、180 度彎頭和大小頭' },
          { at: 1265, title: 'Y 型、T 型三通', summary: 'T 型賣最多；Y 型下面大、上面小，一對二分兩支時用' },
          { at: 1365, title: '乾燥過濾器：看型號', summary: '最後一碼＝幾分；有 S（ODF）＝焊接，沒有 S（SAE）＝牙；照 IN／OUT 方向裝' },
          { at: 1654, title: '兩分有 032、052', summary: '客人說「兩分」，先問 032 還是 052、焊接還是牙；光兩分就有 4 種' },
          { at: 1918, title: '三分、四分、五分', summary: '三分 053、083；四分 164；五分 165、305；店裡一個蘿蔔一個坑' },
          { at: 2105, title: '為什麼叫「兩分牙」', summary: '兩分銅管打好喇叭嘴剛好鎖上；用牙拆得下來，不能動火的地方（例如地下街）就用牙' },
          { at: 2410, title: '冷氣：被覆銅管', summary: '兩支一組：液管小、氣管大；小台 2分＋3分，大台最多 4分＋6分' },
          { at: 2596, title: '修飾管槽、架子', summary: '管槽讓銅管好看、擋紫外線；室外機架有白鐵、鍍鋅' },
          { at: 2718, title: '牙跟銅管對不上', summary: '銅管 4分、牙 3分：用四外三內；銅管比較小：用大小喇叭頭或二外三內' },
          { at: 3282, title: '管槽配件', summary: '平面彎、牆角彎（內角、外角）；尺寸很多，店裡放 80 和 120' },
          { at: 3511, title: '保溫管：哪一段要包', summary: '回氣管比室溫冷，會倒汗、滴水，所以要包；鐵管的 4分＝銅管的 7分' },
          { at: 3558, title: '大樓的冰水系統', summary: '大樓空調很多走冰水（約 7°C），冰水管也要包；比常溫低都要包' },
          { at: 3774, title: '冷凍要包厚一點', summary: '冷凍庫 -18°C，回氣管是零下 20 幾度：一般用 6分厚；冷藏可以薄一點' },
          { at: 4035, title: '電磁閥也分幾分', summary: '從銅管、乾燥過濾器到電磁閥，都先看幾分、焊接還是牙' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          材料行天天在講「幾分」：先會用<Hl>卡尺</Hl>量出幾分，再分清楚<Hl>焊接還是牙</Hl>，客人說的零件就對得上。
        </>
      ),
    },
  },
  {
    id: 'recording-9',
    added: '2026-10-07',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 9',
    title: '錄音13｜壓縮機貨架：牌子、電壓、高中低溫、拿貨',
    en: 'Recording 13',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_13,
        title: '錄音13（10/6）',
        en: 'Class Recording',
        duration: '49:24',
        chapters: [
          { at: 1, title: '小顆壓縮機：英博格', summary: '一馬以下才有 110；型號後面寫電壓，110 和 120 不能混；兩條線叫單相' },
          { at: 158, title: '有庫存的才寫價格', summary: '冷門的不庫存；110 一年賣不到一顆就不進，客人要再調' },
          { at: 365, title: '110 和 220 要放遠', summary: '故意錯開位置，減少拿錯；老闆自己拿錯燒掉過，客戶不會認' },
          { at: 462, title: '焊過就不能退', summary: '管子一焊上去原廠一概不負責；型號、電壓都要一字不漏對清楚' },
          { at: 613, title: '鐵甲（Tecumseh）', summary: '法國廠 GAJ 系列；泰國 KK 廠是鐵甲的形式；2446 和 2464 長一樣能力不同' },
          { at: 969, title: '三相：只要角座', summary: '三條線進電鈕，不用配件；四個角座加柱子固定，螺絲從底板鎖' },
          { at: 1075, title: '單相：一盒配件', summary: '繼電器、啟動電容、運轉電容，原廠配好；渦捲的單相只有一顆運轉電容' },
          { at: 1133, title: '往復式 vs 渦捲式', summary: '小顆的都是往復式（矮胖）；渦捲式比較高，大顆的用' },
          { at: 1204, title: 'Copeland（黑金剛）型號怎麼讀', summary: 'CS27K TF5：TF5＝三相 200～230V；PFV＝單相；型號牌上看 PH' },
          { at: 1412, title: '印度廠、墨西哥廠', summary: '黑金剛賣最多；以前墨西哥做（美墨本一家），後來改印度廠，紙箱變大' },
          { at: 1763, title: '渦捲 ZS 系列', summary: '單相、三相分開放；三相只有兩個專屬角座；15K 單相賣最多' },
          { at: 1859, title: '怎麼抱、幾支管', summary: '不要抓管子；兩支管＝高壓吐出、低壓吸入，第三支是充灌閥' },
          { at: 2155, title: '高溫、中溫、低溫', summary: 'CR 高溫打冷藏、CS 中溫兩邊都能、CF 低溫打冷凍；越低溫越貴' },
          { at: 2314, title: 'K6、K7 世代', summary: 'K6 墨西哥＝中溫、K7 印度＝代替 CR 的冷藏機；同樣叫 CS 不是同一顆' },
          { at: 2407, title: '缺貨怎麼代替', summary: '中溫可以代低溫、代冷藏；對得到能力就能換，但不要反過來' },
          { at: 2630, title: 'Danfoss（現在叫 Secop）：G 和 CL', summary: 'G＝只灌 R134a（冷藏）；CL＝R404A 等（冷凍）；客人說 12C 就是 12CL' },
          { at: 2915, title: '看型號牌找相位', summary: '箱子不用看，看機器上的型號牌：PH 3 就是三相' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          壓縮機貨架先認<Hl>牌子</Hl>，再看<Hl>電壓、相位、溫度</Hl>；焊過就不能退，所以拿之前一個字一個字對。
        </>
      ),
    },
  },
  {
    id: 'recording-10',
    added: '2026-10-07',
    part: 'review',
    chapter: '課堂錄音',
    mark: 'AUDIO 10',
    title: '錄音14｜接頭標示、機組配件、保溫管的 15 種',
    en: 'Recording 14',
    blocks: [
      {
        type: 'audio',
        src: CLASS_AUDIO_14,
        title: '錄音14（10/6）',
        en: 'Class Recording',
        duration: '25:56',
        chapters: [
          { at: 1, title: '零件上的標示', summary: 'ODF＝焊接；SAE、FLARE＝牙（喇叭口）；四窗、電磁閥上都有寫' },
          { at: 80, title: '四進五出', summary: '進口四分、出口五分，看標示就知道怎麼接' },
          { at: 110, title: 'MPT、PT＝鐵管牙', summary: '鐵管是平牙、銅管是斜的要打喇叭口；鐵管 4分＝銅管 7分，看對照表' },
          { at: 377, title: '很多零件都有箭頭', summary: 'IN／OUT 不只乾燥過濾器：電磁閥、消音器都有方向' },
          { at: 414, title: '看一台配好的機組', summary: '壓縮機 → 消音器 → 乾燥過濾器 → 視液鏡 → 電磁閥 → 膨脹閥；油分離器是選配' },
          { at: 520, title: '配件清單怎麼開', summary: '老闆自己整理一張表：三分液管冷藏、冷凍、四分冷藏各要哪些配件' },
          { at: 571, title: '保溫管厚度', summary: '3、4、6 分和 1 吋四種厚度；冷藏取 3 或 4、冷凍取 6 或 1 吋；再厚就雙套管' },
          { at: 779, title: '客人來拿保溫管', summary: '先問「包什麼」：銅管還是水管、幾分、多厚；抽出來就塞不回去' },
          { at: 848, title: '黑色＝水管尺寸', summary: '客人說包四分水管，要拿「7分」洞的；黑色硬、保溫好但難包' },
          { at: 919, title: '灰色＝銅管尺寸 15 種', summary: '3、4、5、6、7 分五種洞 × 3、4、6 分三種厚度；一八一以上放倉庫' },
          { at: 1009, title: '洞×厚怎麼唸', summary: '「六四」＝6分洞、4分厚；六四、六六、六一（1 吋厚）' },
          { at: 1180, title: '客人說包水管先問溫度', summary: '冷氣排水用最薄的就好；冰水管 7°C 要包厚；聽得懂就知道你內行' },
          { at: 1369, title: '六分回管最常用', summary: '黑金剛的渦捲、往復式回管（氣管）都是六分，所以六分保溫管用最多' },
          { at: 1483, title: '配機組要問回管幾分', summary: '壓縮機、冷熱排講好之後，配件以三分為主，最後看回管幾分配保溫管' },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          零件上的字先看 <Hl>ODF／SAE／MPT</Hl>；保溫管先問<Hl>包什麼、幾分、多厚</Hl>，黑色用水管尺寸、灰色用銅管尺寸。
        </>
      ),
    },
  },
  {
    id: 'caliper',
    part: 'units',
    chapter: '游標卡尺',
    mark: 'CALIPER',
    title: '游標卡尺：量出幾分',
    en: 'Reading a Vernier Caliper',
    blocks: [{ type: 'caliper' }],
    conclusion: {
      label: '一句話',
      text: (
        <>
          卡尺先看<Hl>游尺的 0 對到哪</Hl>；1 分＝3.175 mm，找雙數的長刻度最快。銅管量<Em>外徑</Em>，接頭、彎頭量<Em>內徑</Em>。
        </>
      ),
    },
  },
  {
    id: 'drier-sizes',
    part: 'components',
    chapter: '乾燥過濾器',
    mark: 'DRIER',
    title: '乾燥過濾器：客人說「兩分」，先問清楚',
    en: 'Filter Drier Sizes',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,0.95fr)_minmax(0,0.72fr)_minmax(0,1.15fr)]',
        children: [
          { type: 'showcase', parts: [{ id: 'drier', label: '乾燥過濾器' }] },
          {
            type: 'flow',
            direction: 'col',
            tone: 'amber',
            icon: MessagesSquare,
            title: '客人說「兩分」，先問清楚',
            en: 'Ask First',
            steps: [
              { title: '幾分？看最後一碼', desc: '052 的 2＝兩分、083 的 3＝三分；頭尾一樣大' },
              { title: '焊接還是牙？看有沒有 S', desc: '有 S（ODF）＝焊接；沒有 S（SAE）＝喇叭口，用鎖的' },
              { title: '小支還是大支？', desc: '兩分有 032（小支）和 052（胖胖的）；三分有 053、083' },
            ],
            result: { label: '所以', text: '光是「兩分」就有 4 種：032／052 × 焊接／牙' },
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)] gap-4',
            children: [
              {
                type: 'table',
                tone: 'teal',
                corner: '幾分',
                head: ['2分', '3分', '4分', '5分'],
                rows: [
                  { label: '店裡的型號', cells: ['032、052', '053、083、163', '164', '165、305'] },
                  { label: '說明', cells: ['焊接、牙都有', '冰箱 053、冰庫 083', '焊接款 164S', '305 很大支'] },
                ],
              },
              {
                type: 'list',
                icon: ArrowLeftRight,
                tone: 'indigo',
                title: '怎麼裝、怎麼換',
                en: 'Install & Swap',
                items: [
                  { icon: Route, title: '照 IN → OUT 裝', desc: '有方向；貼紙可能貼反，以本體上的箭頭為準' },
                  { icon: Ruler, title: '數字越大，支越大', desc: '前兩碼是乾燥劑容量（立方吋，Danfoss 規格書）；系統越大，用大一點的' },
                  { icon: ArrowLeftRight, title: '同規格各牌可以互換', desc: '例：Danfoss DML 083＝Emerson ADK 083＝Sanhua FD-083（3分、喇叭口）；各牌長度不同，維修換一樣長的比較好裝' },
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
          乾燥過濾器看型號就懂：<Hl>最後一碼＝幾分</Hl>、<Hl>有 S＝焊接</Hl>。客人說「兩分」，再問 032 還是 052、焊接還是牙。
        </>
      ),
    },
  },
  {
    id: 'flare-fittings',
    part: 'components',
    chapter: '喇叭頭與接頭',
    mark: 'FITTING',
    title: '喇叭頭、接頭、彎頭：都是量「幾分」',
    en: 'Flare & Fittings',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)_minmax(0,0.95fr)]',
        children: [
          {
            type: 'showcase',
            parts: [
              { id: 'flare', label: '喇叭頭（牙）' },
              { id: 'fittings', label: '接頭、彎頭、三通' },
            ],
          },
          {
            type: 'list',
            icon: Wrench,
            tone: 'amber',
            title: '喇叭頭（牙）',
            en: 'Flare Connection',
            items: [
              { icon: Ruler, title: '什麼叫「兩分牙」', desc: '兩分的銅管套得進去、打好喇叭嘴剛好鎖得上，就叫兩分牙；三分、四分以此類推' },
              { icon: Wrench, title: '怎麼做', desc: '銅管先穿過螺帽，用擴管工具打出喇叭嘴（斜面），跟接頭的斜面貼緊再鎖' },
              { icon: Ban, title: '不能動火就用牙', desc: '牙拆得下來、不用燒焊；有些地方不能動火（例如台北的地下街），乾燥過濾器常更換，用牙比較方便' },
              { icon: Snowflake, title: '冷氣多用牙', desc: '冷氣機的接頭幾乎都是牙；兩分、三分最多' },
            ],
          },
          {
            type: 'list',
            icon: Waypoints,
            tone: 'teal',
            title: '接頭、彎頭、三通',
            en: 'Fittings',
            items: [
              { icon: Target, title: '量內徑', desc: '銅管插在裡面，所以量裡面；老闆看一眼就知道幾分' },
              { icon: Route, title: '彎頭賣最多', desc: '有 90 度、45 度、180 度（U 型）；直接頭把兩支一樣大的銅管接起來' },
              { icon: ArrowLeftRight, title: '大小頭', desc: '一邊大一邊小（例：5分×3分），店裡以大的那邊分類放' },
              { icon: GitFork, title: '三通：T 型、Y 型', desc: 'T 型賣比較多；Y 型下面大、上面小，一對二要分兩支時用' },
              { icon: MessagesSquare, title: '口語「一八五」', desc: '一八一、一八三、一八五＝1吋1分、1吋3分、1吋5分（1⅛″、1⅜″、1⅝″）' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          牙的「幾分」看<Hl>套得進去的銅管</Hl>；接頭、彎頭量<Hl>內徑</Hl>。不能動火的地方，就用牙。
        </>
      ),
    },
  },
  {
    id: 'insulation',
    part: 'components',
    chapter: '保溫管',
    mark: 'INSUL',
    title: '保溫管：哪一段要包、要多厚',
    en: 'Pipe Insulation',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,0.9fr)_minmax(0,0.78fr)_minmax(0,1.22fr)]',
        children: [
          { type: 'showcase', parts: [{ id: 'insul', label: '保溫管' }] },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1fr)_auto]',
            children: [
              {
                type: 'list',
                icon: Droplets,
                tone: 'ice',
                title: '為什麼要包、包哪一段',
                en: 'Why Insulate',
                items: [
                  { icon: Snowflake, title: '要包：回氣管', desc: '冷排回壓縮機的那一支，溫度很低', badge: { label: '一定要包', tone: 'ice' } },
                  { icon: Flame, title: '不用包：排氣管、液管', desc: '壓縮機出來接近 100°C；散熱器出來的液管約 40～50°C，都不會滴水' },
                  { icon: Building2, title: '比常溫低都要包', desc: '大樓空調的冰水管（約 7°C）也要包' },
                ],
              },
              {
                type: 'metrics',
                icon: ThermometerSnowflake,
                tone: 'teal',
                title: '要多厚',
                en: 'Thickness',
                cols: 2,
                items: [
                  { label: '冷凍', value: '6分', unit: '厚', tone: 'ice', note: '冷凍庫 -18°C，回氣管是零下 20 幾度；還不夠就再套一層（雙套管）' },
                  { label: '冷藏', value: '4分', unit: '厚', tone: 'teal', note: '可以薄一點：越厚越難包（要割開包上，再用強力膠黏回去）' },
                ],
              },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)] gap-4',
            children: [
              {
                type: 'table',
                tone: 'amber',
                corner: '套鐵管（水管）',
                head: ['1/2″', '3/4″', '1″', '1¼″', '1½″', '2″'],
                rows: [
                  { label: '套銅管', cells: ['7/8″', '1⅛″', '1⅜″', '1⅝″', '1⅞″', '2⅜″'] },
                  { label: '店裡說法', cells: ['7分', '1吋1分', '1吋3分', '1吋5分', '1吋7分', '2吋3分'] },
                ],
                notes: [
                  <>同一號保溫管，套鐵管的「4分（1/2″）」＝套銅管的「7分」：鐵管尺寸是標稱，1/2″ 鐵管外徑約 21 mm，跟 7/8″ 銅管（22.2 mm）差不多。更大的尺寸看牆上的對照表。</>,
                ],
                image: { src: insulationImg, label: '看店裡牆上的對照表' },
              },
              {
                type: 'list',
                icon: Ruler,
                tone: 'teal',
                title: '怎麼選保溫管',
                en: 'How to Pick',
                items: [
                  { icon: Target, title: '洞要剛好插得進去', desc: '4分銅管外徑 12.7 mm，保溫管的洞就要 13 mm' },
                  { icon: Layers, title: '店裡說「洞×厚」', desc: '「36」＝3分的洞、6分厚；「46」＝4分的洞、6分厚。小冰箱的回氣管常用 3分洞、3分厚' },
                  { icon: Package, title: '外面再包一層', desc: '大型空調包完保溫管，外面會再纏一層包布' },
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
          會<Hl>倒汗的回氣管</Hl>才要包；冷凍包 <Hl>6分厚</Hl>、冷藏可以 4分厚。鐵管的 4分＝銅管的 7分，別拿錯。
        </>
      ),
    },
  },
  {
    id: 'pipe-marks',
    added: '2026-10-07',
    part: 'components',
    chapter: '接頭標示',
    mark: 'MARKS',
    title: '零件上的字：ODF、SAE、MPT',
    en: 'Connection Markings',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'table',
                tone: 'teal',
                corner: '標示',
                head: ['ODF', 'SAE／FLARE', 'MPT／PT'],
                rows: [
                  { label: '意思', cells: ['焊接', '牙（喇叭口）', '鐵管牙'] },
                  { label: '怎麼接', cells: ['銅管插進去燒焊', '銅管打喇叭口，螺帽鎖上', '平牙直接鎖，不用打口'] },
                  { label: '哪裡看到', cells: ['乾燥過濾器尾巴有 S', '冷氣、乾燥過濾器沒 S', '鐵管、特殊用途'] },
                ],
                notes: [<>型號後面寫「四進五出」＝進口 4分、出口 5分；看標示就知道怎麼接。〔錄音14 01:41〕</>],
              },
              {
                type: 'info',
                icon: Ruler,
                tone: 'amber',
                title: '鐵管的分跟銅管不一樣',
                en: 'Iron vs Copper',
                body: <>鐵管是<Hl>標稱尺寸</Hl>，比同一個「分」的銅管大很多：<Em>鐵管 4分＝銅管 7分</Em>、鐵管 2分看起來像銅管 3分。客人說「三分」要先問是鐵管還是銅管。〔錄音14 02:32〕</>,
                warn: '鐵管是平牙、銅管是斜面（喇叭口）：兩種不能互鎖。',
              },
            ],
          },
          {
            type: 'flow',
            direction: 'col',
            tone: 'ice',
            icon: Workflow,
            title: '看一台配好的機組：零件照這個順序',
            en: 'Order on a Condensing Unit',
            compact: true,
            steps: [
              { title: '壓縮機', desc: '高壓吐出' },
              { title: '消音器', desc: '有方向箭頭' },
              { title: '油分離器', desc: '選配，不一定裝', tag: '選配' },
              { title: '散熱器（冷凝器）', desc: '放熱，變成液態' },
              { title: '乾燥過濾器', desc: 'IN → OUT 照箭頭' },
              { title: '視液鏡（四窗）', desc: '看冷媒夠不夠' },
              { title: '電磁閥', desc: '也有方向' },
              { title: '膨脹閥 → 冷排', desc: '降壓進庫內' },
              { title: '回管（氣管）回壓縮機', desc: '最冷的一支，要包保溫管' },
            ],
            result: { label: '店裡賣的', text: '就是這些零件；客人配機組時，壓縮機和冷熱排講好，配件以三分為主，最後問回管幾分' },
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          拿零件前先看上面的字：<Hl>ODF 焊接</Hl>、<Hl>SAE 牙</Hl>、<Hl>MPT 鐵管</Hl>；鐵管的 4分＝銅管的 7分。
        </>
      ),
    },
  },
  {
    id: 'insulation-sizes',
    added: '2026-10-07',
    part: 'components',
    chapter: '保溫管',
    mark: 'INSUL 2',
    title: '保溫管的 15 種：怎麼問、怎麼拿',
    en: 'Insulation Sizes',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]',
        children: [
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'table',
                tone: 'ice',
                corner: '灰色（銅管尺寸）洞×厚',
                head: ['3分洞', '4分洞', '5分洞', '6分洞', '7分洞'],
                rows: [
                  { label: '3分厚', cells: ['33', '43', '53', '63', '73'] },
                  { label: '4分厚', cells: ['34', '44', '54', '64', '74'] },
                  { label: '6分厚', cells: ['36', '46', '56', '66', '76'] },
                ],
                highlight: [{ col: 3, label: '回管最常用' }],
                notes: [<>前一碼＝<Hl>洞</Hl>（銅管幾分）、後一碼＝<Hl>厚度</Hl>：「六四」＝6分洞、4分厚。五種洞 × 三種厚＝15 種。〔錄音14 15:36〕</>],
              },
              {
                type: 'compare',
                icon: Layers,
                tone: 'slate',
                title: '黑色 vs 灰色',
                en: 'Black vs Grey',
                axis: ['尺寸怎麼標', '什麼時候拿'],
                left: {
                  badge: '黑色',
                  value: '水管尺寸',
                  tone: 'slate',
                  rows: [
                    { k: '尺寸', v: '照水管命名：4分水管＝7分銅管' },
                    { k: '拿', v: '大隻、要厚的；硬，保溫好但難包' },
                  ],
                  use: '「包四分水管、黑色的」→ 拿 4分水管那一格',
                },
                right: {
                  badge: '灰色',
                  value: '銅管尺寸',
                  tone: 'ice',
                  rows: [
                    { k: '尺寸', v: '照銅管命名：3～7 分' },
                    { k: '拿', v: '小管徑的回管；軟、好彎、好包' },
                  ],
                  use: '「包六分銅管」→ 問多厚，拿六×厚',
                },
              },
            ],
          },
          {
            type: 'flow',
            direction: 'col',
            tone: 'emerald',
            icon: MessagesSquare,
            title: '客人來拿保溫管，先問三句',
            en: 'Ask First',
            steps: [
              { title: '包什麼？', desc: '銅管還是水管？黑色還是灰色？抽出來就塞不回去，所以先問再拿', icon: MessagesSquare },
              { title: '幾分？', desc: '銅管就看洞；水管就換算（4分水管＝7分洞）', icon: Ruler },
              { title: '多厚？', desc: '冷藏 3 或 4分厚；冷凍 6分厚或 1吋；再冷就雙套管（裡面 1吋、外面再 1吋）', icon: Layers },
              { title: '水管問溫度', desc: '冷氣排水不冷，最薄就好；冰水管 7°C 要包厚；聽得懂這句，客人就知道你內行', icon: Thermometer },
            ],
            result: { label: '雙套管怎麼算', text: '外層的洞＝內層的洞＋兩個厚度：6分管套 1吋厚，外層要 2吋6分的洞；寧可大不要小，大了可以切開再包' },
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          保溫管先問<Hl>包什麼、幾分、多厚</Hl>；灰色照銅管、黑色照水管（4分水管＝7分銅管）；<Hl>六分回管</Hl>用最多。
        </>
      ),
    },
  },
  {
    id: 'ac-materials',
    part: 'practice',
    chapter: '冷氣材料',
    mark: 'A/C',
    title: '冷氣材料：配管、管槽、轉接頭',
    en: 'Air-con Materials',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-3',
        children: [
          {
            type: 'list',
            icon: Layers,
            tone: 'ice',
            title: '被覆銅管：兩支一組',
            en: 'Pre-insulated Pair',
            items: [
              { icon: Snowflake, title: '一支液管、一支氣管', desc: '室外機（壓縮機＋散熱器）出來的液管進室內機；室內機回來的氣管回壓縮機' },
              { icon: Ruler, title: '液管小、氣管大', desc: '小台冷氣 2分＋3分，再大 2分＋4分、2分＋5分；大台最多 4分＋6分' },
              { icon: Package, title: '型號怎麼看', desc: '例：2330＝2分＋3分、30 米；兩支黏在一起，外面有保溫，可以撕開' },
            ],
          },
          {
            type: 'list',
            icon: Building2,
            tone: 'teal',
            title: '修飾管槽與架子',
            en: 'Covers & Brackets',
            items: [
              { icon: ShieldCheck, title: '管槽：好看又保護', desc: '把銅管包起來；銅管外面的保溫曬到紫外線會老化' },
              { icon: Route, title: '配件', desc: '遮牆上洞口的蓋子、平面彎、牆角彎（內角、外角）' },
              { icon: Boxes, title: '店裡放 80、120', desc: '尺寸有 70～140；120 可以放兩組管（一對二）' },
              { icon: Wrench, title: '室外機架', desc: '有白鐵、鍍鋅，也有落地架、遮雨棚' },
            ],
          },
          {
            type: 'flow',
            direction: 'col',
            tone: 'amber',
            icon: ArrowLeftRight,
            title: '牙跟銅管對不上',
            en: 'Adapters',
            steps: [
              { title: '先問兩個尺寸', desc: '銅管配幾分？機器的牙是幾分？冷氣機的接頭是外牙，接上去的一定要內牙' },
              { title: '銅管比牙大', desc: '例：4分銅管、3分牙 → 用「四外三內」：一邊 3分內牙鎖機器，一邊 4分外牙接銅管' },
              { title: '銅管比牙小', desc: '例：2分銅管、3分牙 → 用大小喇叭頭（3分牙、2分洞），或「二外三內」轉接頭' },
            ],
            result: { label: '店裡', text: '牆上有畫好的對照圖，對著拿就不會錯' },
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          冷氣材料就是配管：<Hl>被覆銅管（液管＋氣管）</Hl>＋管槽＋架子。牙跟銅管對不上，先問<Hl>兩個尺寸</Hl>再拿轉接頭。
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
  /* ───────────────────────── 1002 錄音08～10：散熱器規格 排×支×鏡面 ───────────────────────── */
  {
    id: 'coil-spec',
    part: 'components',
    chapter: '散熱器規格',
    mark: 'COIL',
    title: '看懂散熱器規格：排×支×實內',
    en: 'Reading Coil Specs',
    blocks: [{ type: 'coilreader' }],
    conclusion: {
      label: '材料行的 know-how',
      text: (
        <>
          規格寫<Hl>排×支×鏡面</Hl>：排＝深度（一層一層）、支＝高度、鏡面＝有鰭片的長度（老闆叫「實內」）。找到一個<Em>平的彎頭</Em>，順著它數就是支。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 錄音07、08、11：冷凝器實務 ───────────────────────── */
  {
    id: 'cond-practice',
    part: 'components',
    chapter: '冷凝器實務',
    mark: 'COND',
    title: '冷凝器實務：配多大、好不好、擺哪裡',
    en: 'Condenser in Practice',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-3',
        children: [
          {
            type: 'list',
            icon: Scale,
            tone: 'amber',
            title: '配多大：壓縮機 ×2，再看環境',
            en: 'Sizing',
            items: [
              { icon: Calculator, title: '標準', desc: '壓縮機 1 馬配散熱器 2 馬；估價先用 ×2', badge: { label: '先記這個', tone: 'amber' } },
              { icon: TrendingUp, title: '要加大', desc: '散熱器放在廚房、室內這種很熱的地方，沒有拉到外面' },
              { icon: TrendingDown, title: '可以小一點', desc: '散熱器拉到通風好的地方、店在山上（外氣比較涼）；銅管拉長也會幫忙散熱' },
              { icon: MessagesSquare, title: '訂貨時再提醒', desc: '客人要訂的時候，再問一次要加大還是減少，讓客人自己決定' },
            ],
          },
          {
            type: 'list',
            icon: Stethoscope,
            tone: 'red',
            title: '好不好：摸出口、看壓力',
            en: 'Field Check',
            items: [
              { icon: Flame, title: '上進下出', desc: '高溫氣體從上方進去；進口接近 100°C，不能摸' },
              { icon: ThermometerSun, title: '出口是溫的＝正常', desc: '出口還很燙＝散熱不好：鰭片髒了或風扇壞了，要清洗或檢修' },
              { icon: Gauge, title: '冷凝溫度 40～45°C', desc: '用錶組量壓力最準：R22 在 210 psig 約等於 40°C（Ref Tools 查得到）' },
              { icon: Zap, title: '散熱好，壓縮機才有力', desc: '型錄上同一台壓縮機，冷凝溫度越低，冷凍能力越大' },
            ],
          },
          {
            type: 'list',
            icon: Building2,
            tone: 'teal',
            title: '擺哪裡：環境決定散熱',
            en: 'Location',
            items: [
              { icon: ThermometerSun, title: '太陽直射、鐵皮屋頂', desc: '環境本身就很熱，散熱器要加大' },
              { icon: Route, title: '防火巷', desc: '旁邊多了冷氣，熱風在巷子裡繞回來，散熱變差；可以裝導風罩把熱風導走' },
              { icon: Droplets, title: '水冷式比較穩', desc: '水不太受天氣影響：型錄冷凝溫度水冷抓 37.8°C，氣冷抓 49°C' },
              { icon: DoorOpen, title: '玻璃門、大門冰箱', desc: '玻璃保溫比 PU 發泡差、門越大開門升溫越快，壓縮機要加大' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          散熱器先抓<Hl>壓縮機 ×2</Hl>，再依擺放環境加減；摸出口<Em>溫的才正常</Em>，燙就要清洗或檢查風扇。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 錄音09～11：門市接散熱器的問題 ───────────────────────── */
  {
    id: 'coil-store',
    part: 'practice',
    chapter: '門市：散熱器',
    mark: 'STORE',
    title: '客人來問散熱器：先問對，再拿對',
    en: 'Condenser at the Counter',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'flow',
            direction: 'col',
            tone: 'emerald',
            icon: ClipboardList,
            title: '接電話、客人來問：四步問清楚',
            en: 'Ask First',
            steps: [
              { title: '有沒有散熱外移？', desc: '放冰箱頂上（機上型）一定是 11 支、高約 29 公分；14 支高 36.5 公分，放冰箱頂會太高（冰箱本身約 2 公尺）', icon: Warehouse },
              { title: '請客人拍「穿管面」', desc: '全部都是彎頭的那一面，一看就數得出幾排幾支；不要拍焊接面', icon: Camera },
              { title: '量長度', desc: '最好量實內（有鰭片的長度）；客人連兩側彎頭一起量也可以，大約多 6 公分', icon: Ruler },
              { title: '換壓縮機，先問熱排、冷排多大', desc: '四大金剛要配對；很多壓縮機燒掉，是原本就配錯、散熱不良', icon: Cog },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'list',
                icon: MessagesSquare,
                tone: 'ice',
                title: '聽懂客人的說法',
                en: 'Customer Words',
                items: [
                  { icon: Layers, title: '「底板」＝底部的板子', desc: '可能是放壓縮機的「基板」，也可能是把底封住的「封底板」；先問「要放壓縮機嗎？」' },
                  { icon: Package, title: '庫存只做兩種', desc: '附基板、封底（不附基板）；只換散熱器的，拆掉封底板就能裝' },
                  { icon: Fan, title: '「室外機散熱器」', desc: '問「馬達在外面還是裡面？」馬達外露＝一般散熱器（無穿衫，要加遮雨板）；有外殼＝屋外型' },
                ],
              },
              {
                type: 'info',
                icon: ShieldCheck,
                tone: 'amber',
                title: '出貨前、選室外機',
                en: 'Before It Leaves',
                body: '散熱器沒有充灌閥，工廠泡水抓漏後就封死：進貨寫日期、先進先出，請客人施工前先折開聽有沒有氣。屋外型看三件事：安靜、重量（壁掛要吊上去）、實際能力。',
                warn: '話先講在前頭（買賣說斷斷）：有問題馬上換新，不要讓客人到現場才發現。',
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
          先問<Hl>有沒有外移</Hl>，再請客人拍<Hl>穿管面</Hl>數排×支、量實內；聽到「底板」「室外機」先問用途，再拿貨。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 錄音10、11：冰箱與機上型 ───────────────────────── */
  {
    id: 'fridge-types',
    part: 'industry',
    chapter: '冰箱與機組',
    mark: 'FRIDGE',
    title: '客人的冰箱：先看裝置，再配機組',
    en: 'Fridges & Matching',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'list',
            icon: Refrigerator,
            tone: 'ice',
            title: '認識客人的冰箱',
            en: 'Fridge Types',
            items: [
              { icon: UtensilsCrossed, title: '工作臺冰箱', desc: '廚房切菜的檯面下面就是冰箱；餐廳幾乎都有' },
              { icon: DoorOpen, title: '兩門、四門、六門', desc: '寬度有兩尺、兩尺半、四尺、六尺（一尺約 30 公分），四尺最多；本體約 2 公尺高，最上面是放散熱器的機房' },
              { icon: Snowflake, title: '全凍、半凍半藏、全藏', desc: '大約七成是上凍下藏；三種配的壓縮機、冷排、熱排都不一樣大' },
              { icon: ThermometerSun, title: '玻璃門要加大', desc: '玻璃保溫比 PU 發泡差；門越大，一開門溫度升得越快，壓縮機都要配大一點' },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[minmax(0,1fr)_minmax(0,1fr)]',
            children: [
              {
                type: 'metrics',
                icon: Ruler,
                tone: 'teal',
                title: '機上型：散熱器放冰箱頂上',
                en: 'Top-mount',
                cols: 2,
                items: [
                  { label: '只能用', value: '11', unit: '支', tone: 'teal', note: '高約 29 公分、配 10 吋風車；14 支高 36.5 公分，放上去會太高' },
                  { label: '附基板最大到', value: '2.5', unit: '馬', tone: 'amber', note: '3 馬以上散熱器太高，要改成散熱外移' },
                ],
              },
              {
                type: 'list',
                icon: Scale,
                tone: 'amber',
                title: '機組要配得上設備',
                en: 'Match the Box',
                items: [
                  { icon: Zap, title: '小機組裝大冰箱', desc: '溫度一直到不了，壓縮機停不下來，很耗電' },
                  { icon: Thermometer, title: '溫差抓 4°C', desc: '溫度到了讓壓縮機休息，回升 4°C 再啟動' },
                  { icon: Cog, title: '換壓縮機先問熱排、冷排', desc: '原本就配錯的話，換一顆新的還是會壞' },
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
          客人說「冰箱」，先問<Hl>幾門、玻璃還是不鏽鋼、上凍下藏</Hl>；散熱器放冰箱頂上的（機上型）<Em>只能用 11 支</Em>。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 錄音10、11：散熱器三種 ───────────────────────── */
  {
    id: 'outdoor-units',
    part: 'components',
    chapter: '散熱器種類',
    mark: 'UNITS',
    title: '散熱器三種：一般、屋外型、含壓縮機的室外機',
    en: 'Condenser Types',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-3',
        children: [
          {
            type: 'list',
            icon: Fan,
            tone: 'amber',
            title: '一般散熱器',
            en: 'Open Type',
            items: [
              { icon: Fan, title: '馬達外露', desc: '台語叫「無穿衫」；便宜，店裡最常賣', badge: { label: '最常見', tone: 'amber' } },
              { icon: Refrigerator, title: '兩種用法都行', desc: '放冰箱頂上（機上型），或拉到外面（散熱外移）' },
              { icon: ShieldAlert, title: '放室外要加遮雨板', desc: '不然馬達會淋到雨；聲音也比屋外型大' },
            ],
          },
          {
            type: 'list',
            icon: Building2,
            tone: 'teal',
            title: '屋外型（室外機）',
            en: 'Outdoor Unit',
            items: [
              { icon: ShieldCheck, title: '有外殼、馬達在裡面', desc: '好看、安靜、不怕風吹雨淋' },
              { icon: Building2, title: '常吊在牆上', desc: '用 N 字形的壁掛架；太重的話搬不上去' },
              { icon: Scale, title: '選購看三件事', desc: '安靜（吵到鄰居會被檢舉）、重量、實際能力（同樣標 10 馬，實際可能差一級）' },
            ],
          },
          {
            type: 'list',
            icon: Package,
            tone: 'indigo',
            title: '含壓縮機的室外機',
            en: 'Condensing Unit',
            items: [
              { icon: Package, title: '像冷氣的室外機', desc: '壓縮機、散熱器、乾燥器都裝在裡面' },
              { icon: Waypoints, title: '只拉兩支管', desc: '液管和低壓管接到冷排；冷氣做外膨，冷凍做內膨（膨脹閥在冷排旁）' },
              { icon: Wind, title: '大台的上吹', desc: '小台多半側吹；大台的上吹式放在大樓屋頂' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          分辨的關鍵是<Hl>馬達在外面還是裡面</Hl>：外面＝一般散熱器，包在外殼裡＝屋外型；連壓縮機都裝在裡面的，就是像冷氣的室外機。
        </>
      ),
    },
  },
  /* ───────────────────────── 1002 錄音06、09、10：材料行的服務心法 ───────────────────────── */
  {
    id: 'store-mindset',
    part: 'practice',
    chapter: '服務心法',
    mark: 'MINDSET',
    title: '材料行的服務心法：多問一句，客人就會回來',
    en: 'How We Serve',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
        children: [
          {
            type: 'flow',
            direction: 'col',
            tone: 'emerald',
            icon: HeartHandshake,
            title: '老闆怎麼對客人',
            en: 'With Customers',
            steps: [
              { title: '多關心一點', desc: '客人只問壓縮機多少錢，我們還會問熱排、冷排、裝在什麼設備；讓客人拿材料去賺錢，不是再賠一顆', icon: HeartHandshake },
              { title: '話先講在前頭', desc: '東西沒有百分之百不會漏；請客人施工前先測，有問題馬上換（買賣說斷斷）', icon: ShieldCheck },
              { title: '講結論，不要繞彎', desc: '客人不是來上課的；講他聽得懂的結論就好', icon: MessagesSquare },
              { title: '先懂客人在說什麼', desc: '客人說的「底板」「室外機」不一定是我們想的；先問用途，再拿貨', icon: Lightbulb },
            ],
          },
          {
            type: 'list',
            icon: Store,
            tone: 'ice',
            title: '店裡每天要做到',
            en: 'In the Store',
            items: [
              { icon: MapPin, title: '一個蘿蔔一個坑', desc: '每樣東西都有固定位置；用完、整理完放回原位' },
              { icon: Package, title: '進貨寫日期、先進先出', desc: '散熱器出貨前先確認；請客人施工前先折開聽有沒有氣' },
              { icon: Truck, title: '送貨排順序', desc: '一次送三家以上，先排好先後，順路就好' },
              { icon: Cylinder, title: '認得貨架', desc: '壓縮機看型號；冷媒鋼瓶看標籤；冷凍油一罐 4 公升，店裡叫「一加侖」' },
            ],
          },
        ],
      },
    ],
    conclusion: {
      label: '一句話',
      text: (
        <>
          客人跟我們買，是因為我們<Hl>比別人多關心他</Hl>：多問一句配對、把話講在前頭，客人就不會賠錢，也會再回來。
        </>
      ),
    },
  },
  /* ───────────────────────── 新人業務怎麼開始 ───────────────────────── */
  {
    id: 'newbie-sales',
    added: '2026-10-07',
    source: 'extra',
    part: 'practice',
    chapter: '新人業務',
    mark: 'START',
    title: '新人業務怎麼開始：先不出錯，再把產品串起來',
    en: 'Starting as a New Salesperson',
    blocks: [
      {
        type: 'grid',
        className: 'grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]',
        children: [
          {
            type: 'flow',
            direction: 'col',
            tone: 'emerald',
            icon: Handshake,
            title: '好業務先做到的四件事',
            en: 'Four Habits',
            steps: [
              { title: '把產品認熟', desc: '業務不是靠口才，是客人問什麼都答得出來；客人只問壓縮機，我們多問熱排、冷排、裝什麼設備〔錄音09、10〕', icon: Boxes },
              { title: '從來不拿錯貨', desc: '壓縮機焊過就不能退：型號一個字一個字對、電壓對、出門前再對一次。新人最快建立信任的方法是不出錯〔錄音13〕', icon: ShieldCheck },
              { title: '話先講在前頭、講結論', desc: '買賣說斷斷：請客人施工前先測，有問題馬上換；客人不是來上課的，講他聽得懂的結論〔錄音09、14〕', icon: MessagesSquare },
              { title: '不懂就問，每天記', desc: '問老闆、問客人「這裝在哪？」沒人會看輕你，拿錯才會；被問倒的問題記下來，一個月後會發現就那幾十種', icon: Lightbulb },
            ],
          },
          {
            type: 'grid',
            className: 'grid-rows-[auto_minmax(0,1fr)]',
            children: [
              {
                type: 'tiles',
                icon: Route,
                tone: 'ice',
                title: '產品要「融會貫通」：每一種都掛在三個鉤子上',
                en: 'Three Hooks',
                cols: 3,
                items: [
                  { icon: RefreshCw, title: '在循環的哪裡', desc: '冷媒走到這裡時，這個零件做什麼：乾燥過濾器在液管、電磁閥在膨脹閥前、保溫管包回管' },
                  { icon: Store, title: '客人為什麼要它', desc: '冷凍庫、冰箱、冷氣各要哪一套：冷凍庫＝低溫壓縮機＋冷熱排＋膨脹閥＋配件＋6分厚保溫管' },
                  { icon: Warehouse, title: '貨架哪裡、跟誰像', desc: '放哪一排、誰可以代替誰、拿錯會怎樣：2446 和 2464 長一樣能力不同' },
                ],
              },
              {
                type: 'checklist',
                id: 'newbie-30-days',
                title: '一天 20 分鐘，一個月後會不一樣',
                en: '30-Day Plan',
                items: [
                  <>每天一排貨架：拿 App 的產品總表對著看，每一種在心裡走一次三個鉤子；答不出來的，明天問老闆</>,
                  <>每週一套：拿一張真的出貨單，自己配出整套（「估價練習」頁），再跟實際出的貨對</>,
                  <>聽錄音對貨架：錄音13 邊播、邊站在壓縮機貨架前看，老闆講到哪就看到哪</>,
                  <>每天記一題：被客人問倒的，晚上查或隔天問；寫進自己的筆記</>,
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
          先當一個<Hl>從來不拿錯貨、話講在前頭</Hl>的人；產品用<Hl>循環、客人、貨架</Hl>三個鉤子掛起來，業績自然會來。
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
            title: '冷媒尺：拖曳、點刻度直接跳，或按下方微調鍵',
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
              { title: '打開「冷媒尺」', desc: 'App Store／Google Play 搜尋「Ref Tools」，開啟後點下方第一個「冷媒尺」' },
              { title: '換冷媒', desc: '點右上的冷媒名稱（例如 R404A）；看機器銘牌或鋼瓶上的型號' },
              { title: '滑動左邊的尺', desc: '中間那條線對到的：左邊紅字＝壓力、右邊藍字＝溫度；也可以點右邊的數字直接輸入' },
              { title: '「絕對壓力」要關掉', desc: '壓力錶讀的是錶壓，關掉才對得上錶；混合冷媒開著「露點溫度」' },
              { title: '對照看看', desc: 'R22 210 psig＝40.42°C，跟老闆的手寫表一樣（按左邊「預設」）' },
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
          { group: '散熱器', term: '排×支×鏡面', alias: '散熱器規格', en: 'Rows × Tubes × Fin Length', tip: '例 4×11×330：4 排、每排 11 支、鏡面 330 mm' },
          { group: '散熱器', term: '鏡面', alias: '實內（老闆的叫法）', en: 'Fin Length', tip: '有鰭片、風吹得到的有效長度；含兩側彎頭大約多 6 公分', tw: { rec: 9, from: 130.7, to: 138.7, say: '他們都講鏡面，那我習慣講實內，實際的內部，就是有效的' } },
          { group: '散熱器', term: '穿管面', alias: '全部都是彎頭的那一面', en: 'Return-bend Side', tip: '請客人拍這一面，數得出幾排幾支；找平的彎頭，順著數就是支', tw: { rec: 9, from: 51.9, to: 60.1, say: '你看到有一個彎頭是平的……只要有平的地方，就一定是支' } },
          { group: '散熱器', term: '封底', alias: '封底板', en: 'Bottom Cover', tip: '把底封住，風才會穿過鰭片；跟放壓縮機的基板不一樣', tw: { rec: 10, from: 805.0, to: 813.1, say: '這叫封底……這不是基板，這叫封底板' } },
          { group: '散熱器', term: '底板', alias: '底部的板子', en: 'Bottom Plate', tip: '客人說要「底板」，先問清楚：是放壓縮機的基板，還是把底封住的封底板', tw: { rec: 10, from: 672.4, to: 679.5, say: '客戶會跟你講說「我要底板啦」，但是他說的底板不是這個底板' } },
          { group: '散熱器', term: '風扇馬達', alias: '馬達', en: 'Fan Motor', tip: '馬達外露＝一般散熱器（無穿衫）；馬達包在外殼裡＝屋外型', tw: { rec: 10, from: 1765.9, to: 1769.1, say: '那種就是馬達外露出來的，無穿衫的' } },
          { group: '散熱器', term: '基板', alias: '附基板', en: 'Base Plate', tip: '放壓縮機的板子；機上型冰箱用，最大到 2 馬半' },
          { group: '散熱器', term: '機上型', alias: '散熱器放冰箱頂上', en: 'Top-mount', tip: '冰箱約 2 公尺高，只能用 11 支（高約 29 公分）' },
          { group: '散熱器', term: '屋外型', alias: '室外機（有外殼）', en: 'Outdoor Unit', tip: '馬達在裡面：好看、安靜、防風雨；一般散熱器馬達外露', tw: { rec: 10, from: 1642.4, to: 1646.8, say: '有人說這有穿衣服的，散熱器就沒有穿衣服' } },
          { group: '管路配件', term: '外徑／內徑', alias: '量外面／量裡面', en: 'OD / ID', tip: '銅管量外徑；接頭、彎頭量內徑（銅管插在裡面）', tw: { rec: 12, from: 718.7, to: 730.3, say: '銅管是要量外徑……這個是量外徑，這個是量內徑' } },
          { group: '管路配件', term: 'ODF', alias: '焊接（型號尾巴有 S）', en: 'Solder Connection', tip: '乾燥過濾器型號尾巴有 S＝焊接；沒有 S＝喇叭口（牙）', tw: { rec: 12, from: 1688.5, to: 1694.7, say: '所以看 S 就知道了，S 代表焊接' } },
          { group: '管路配件', term: 'SAE', alias: '喇叭口（牙）', en: 'Flare Connection', tip: '用鎖的，拆得下來、不用動火；地下街這種不能動火的地方就用牙', tw: { rec: 12, from: 2363.5, to: 2372.5, say: '你就把它拆下來就好了，就不用動火……譬如說台北市地下街，不能動火' } },
          { group: '管路配件', term: '032／052', alias: '兩分的小支／大支', en: 'Drier Size', tip: '客人說兩分，先問 032 還是 052、焊接還是牙；光兩分就有 4 種', tw: { rec: 12, from: 1710.4, to: 1712.8, say: '我會問他說，你那 032 還是 052' } },
          { group: '管路配件', term: '喇叭頭', alias: '喇叭嘴、喇叭牙', en: 'Flare Fitting', tip: '銅管打成斜面（喇叭嘴），套上喇叭螺帽鎖緊就不漏' },
          { group: '管路配件', term: '大小頭', alias: '一邊大一邊小', en: 'Reducer', tip: '例：5分×3分；店裡以大的那邊分類放', tw: { rec: 12, from: 1123.9, to: 1130.9, say: '所以我自己歸類是 185 乘以小尺寸……大小頭，就只要以大的為主' } },
          { group: '管路配件', term: '三通', alias: 'T 型、Y 型', en: 'Tee / Wye', tip: 'T 型賣比較多；Y 型下面大、上面小，一對二分兩支時用' },
          { group: '管路配件', term: '一八五', alias: '1吋5分（1⅝″）', en: '1-5/8 inch', tip: '店裡口語：一八一、一八三、一八五＝1吋1分、1吋3分、1吋5分', tw: { rec: 12, from: 1182.7, to: 1184.7, say: '一八一、一八三、一八五' } },
          { group: '管路配件', term: '被覆銅管', alias: '冷氣的兩支一組銅管', en: 'Pre-insulated Copper Pair', tip: '一支液管（小）、一支氣管（大）；例 2330＝2分＋3分、30 米', tw: { rec: 12, from: 2622.1, to: 2628.9, say: '所以被覆是什麼，被覆就是兩支管，就是一個液管、一個氣管的意思' } },
          { group: '管路配件', term: '修飾管槽', alias: '管槽', en: 'Line-set Cover', tip: '把冷氣管包起來：好看、擋紫外線；店裡放 80、120' },
          { group: '管路配件', term: '四外三內', alias: '轉接頭', en: 'Flare Adapter', tip: '銅管 4分、機器 3分牙：一邊 3分內牙鎖機器，一邊 4分外牙接銅管', tw: { rec: 12, from: 2856.3, to: 2862.0, say: '但是你三分外牙……四外三內' } },
          { group: '管路配件', term: '保溫管', alias: '包回氣管', en: 'Pipe Insulation', tip: '回氣管會倒汗要包；冷凍 6分厚、冷藏 4分厚' },
          { group: '管路配件', term: '倒汗', alias: '結露、滴水', en: 'Sweating', tip: '管子比室溫冷，外面結露滴水；所以回氣管要包保溫管', tw: { rec: 12, from: 3746.6, to: 3756.7, say: '冷排要回壓縮機這個氣管要包，它會倒汗，我都說倒汗' } },
          { group: '管路配件', term: 'MPT', added: '2026-10-07', alias: '鐵管牙（平牙）', en: 'Male Pipe Thread', tip: '鐵管是平牙直接鎖；銅管是斜面要打喇叭口。鐵管 4分＝銅管 7分', tw: { rec: 14, from: 137.8, to: 144.1, say: '八分之一 MPT，MPT 就是鐵管，鐵管牙' } },
          { group: '管路配件', term: '四進五出', added: '2026-10-07', alias: '進 4分、出 5分', en: '4-in 5-out', tip: '零件上寫的進出口尺寸；看標示就知道怎麼接', tw: { rec: 14, from: 82.3, to: 88.3, say: '四進五出，這個就是四進五出，這一看就知道' } },
          { group: '管路配件', term: '回管', added: '2026-10-07', alias: '氣管、回氣管', en: 'Suction Line', tip: '冷排回壓縮機那一支，最冷、會倒汗；黑金剛的回管都是六分，所以六分保溫管用最多', tw: { rec: 14, from: 1372.7, to: 1379.7, say: '黑金剛那些渦捲式跟往復式，回管就是氣管，全部都六分的' } },
          { group: '管路配件', term: '黑色保溫管', added: '2026-10-07', alias: '照水管尺寸', en: 'Black (IPS-sized) Insulation', tip: '客人說包 4分水管、黑色的，要拿 7分洞的；密度高、硬，保溫好但難包', tw: { rec: 14, from: 848.1, to: 851.1, say: '4分鐵管給 7分銅管，所以他要拿' } },
          { group: '管路配件', term: '雙套管', added: '2026-10-07', alias: '再套一層', en: 'Double Insulation', tip: '冷凍還不夠厚就裡面 1吋、外面再 1吋；外層的洞＝內層洞＋兩個厚度', tw: { rec: 14, from: 693.9, to: 699.2, say: '再厚就是要雙套管，譬如說裡面 1 英寸、外面再 1 英寸' } },
          { group: '壓縮機', term: '往復式／渦捲式', added: '2026-10-07', alias: '矮胖／高瘦', en: 'Reciprocating / Scroll', tip: '小顆的都是往復式；渦捲式比較高，大顆的用；渦捲的單相只有一顆運轉電容', part: 'comp', tw: { rec: 13, from: 1133.3, to: 1141.3, say: '這種叫渦捲式，這個叫往復式；剛才看到那些小顆的全部都是往復式' } },
          { group: '壓縮機', term: '角座', added: '2026-10-07', alias: '固定壓縮機的腳', en: 'Mounting Feet', tip: '三相的只要角座：四個角座加中間的柱子，螺絲從底板鎖上去', tw: { rec: 13, from: 990.8, to: 998.0, say: '它不用配件，它只要角座，角座這四個角座' } },
          { group: '壓縮機', term: '單相配件盒', added: '2026-10-07', alias: '繼電器＋兩顆電容', en: 'Start Kit', tip: '單相壓縮機要配：繼電器（Relay）、啟動電容、運轉電容，原廠配好一盒；不同型號內容不一樣', tw: { rec: 13, from: 1101.8, to: 1112.7, say: 'RELAY，然後一個啟動電容，一個運轉電容……然後有一個 RELAY 在裡面' } },
          { group: '壓縮機', term: '充灌閥', added: '2026-10-07', alias: '第三支管', en: 'Service Valve', tip: '壓縮機的第三支管：灌冷媒、測壓力用；兩支管的壓縮機沒有，師傅自己接', tw: { rec: 13, from: 1935.1, to: 1945.8, say: '它這個接一個充灌閥……充灌冷媒就是要關跟開，然後測試壓力' } },
          { group: '壓縮機', term: '高溫機／低溫機', added: '2026-10-07', alias: 'CR／CS／CF', en: 'High / Medium / Low Temp', tip: '黑金剛：CR 高溫打冷藏、CS 中溫兩邊都能、CF 低溫打冷凍；越低溫越貴；缺貨只能拿更低溫的代替', part: 'comp', tw: { rec: 13, from: 2155.6, to: 2164.9, say: '有分高溫中溫低溫；CR 是屬於高溫，中溫是 CS，低溫是 CF' } },
          { group: '壓縮機', term: 'TF5／PFV', added: '2026-10-07', alias: '三相／單相', en: 'Three-phase / Single-phase', tip: '黑金剛型號後面：TF5＝三相 200～230V，PFV＝單相；型號牌上看 PH 1 或 PH 3', tw: { rec: 13, from: 1253.3, to: 1261.6, say: 'PFV，我們看 PFV 代表就是 PH-1，TF-5 代表就是三相' } },
          { group: '壓縮機', term: '拿錯不能退', added: '2026-10-07', alias: '焊過就算用過', en: 'No Return After Brazing', tip: '壓縮機的管子焊上去就沒人要了；型號、電壓拿錯公司要自己吸收，所以一個字一個字對', tw: { rec: 13, from: 462.0, to: 469.2, say: '它只要焊接上去沒有人要了，等於是使用後就沒有人要了' } },
          { group: '散熱器', term: '站壓', alias: '抓漏', en: 'Pressure Test', tip: '從充灌閥灌氮氣、泡水找漏點；散熱器沒有充灌閥', tw: { rec: 9, from: 569.8, to: 578.1, say: '這叫抓漏，自己站壓……站壓或是抓漏' } },
          { group: '散熱器', term: '內膨', alias: '膨脹閥鎖在蒸發器箱內', en: 'Internal TXV Mounting', tip: '冷凍做內膨（膨脹閥會結冰滴水）；冷氣是外膨' },
          { group: '管路', term: '液管', alias: '講義上的黃色線', en: 'Liquid Line', tip: '中溫中壓液態' },
          { group: '管路', term: '高壓氣管', alias: '講義上的紅色線', en: 'Discharge Line', tip: '高溫高壓氣態' },
          { group: '管路', term: '吸氣管', alias: '講義上的藍色線', en: 'Suction Line', tip: '低溫低壓氣態回到壓縮機' },
          { group: '管路', term: '高壓幾分、低壓幾分', alias: '接管規格', en: 'Discharge／Suction Size', tip: '壓縮機和零件都會寫：高壓（排氣）、低壓（吸氣）接管各幾分' },
          { group: '單位與冷媒', term: '馬', alias: '馬力（口語）', en: 'HP（正確單位是 BTU）', tip: '客人都講幾馬', tw: { rec: 2, from: 304.2, to: 306.3, say: '口語的話就講幾馬' } },
          { group: '單位與冷媒', term: '分', alias: '管徑單位', en: '1/8 inch', tip: '1 吋＝8 分＝25.4 mm，1 分＝3.175 mm' },
          { group: '單位與冷媒', term: '游標卡尺', alias: '卡尺', en: 'Vernier Caliper', tip: '量銅管外徑，÷ 3.175 就是幾分；先看游尺的 0 對到哪，找雙數的長刻度最快', tw: { rec: 12, from: 468.1, to: 474.4, say: '所以你看頂點就很快了，2、4、6、8，8 就是 1 分嘛' } },
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
  'strokes',
  'cycle-lesson',
  'check-1',
  'units',
  'caliper',
  'reftools',
  'reftable',
  'refrigerants',
  'check-2',
  'industry',
  'fridge-types',
  'check-3',
  'products',
  'ch2',
  'comp-brands',
  'comp-power',
  'comp-temp',
  'comp-pick',
  'ch3',
  'coil-spec',
  'cond-practice',
  'outdoor-units',
  'ch4',
  'ch5',
  'drier-sizes',
  'flare-fittings',
  'pipe-marks',
  'insulation',
  'insulation-sizes',
  'handout',
  'check-4',
  'estimate',
  'coil-store',
  'ac-materials',
  'store-mindset',
  'newbie-sales',
  'ch9',
  'sop',
  'check-5',
  'recording',
  'recording-2',
  'recording-3',
  'recording-4',
  'recording-5',
  'recording-6',
  'recording-7',
  'recording-8',
  'recording-9',
  'recording-10',
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
