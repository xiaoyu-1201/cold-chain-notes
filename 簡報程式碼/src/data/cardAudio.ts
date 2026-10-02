// 自動產生（工具/make_card_audio.py），不要手改：名詞翻卡的英文發音、老闆原音小檔
// 英文用 Windows 內建英文語音（Microsoft Zira）錄好；老闆說的片段從上課錄音剪出來
import a0 from '../assets/cards/en-about-40-42-degrees-celsius.m4a'
import a1 from '../assets/cards/en-accumulator.m4a'
import a2 from '../assets/cards/en-ball-valve.m4a'
import a3 from '../assets/cards/en-base-plate.m4a'
import a4 from '../assets/cards/en-blend-refrigerant.m4a'
import a5 from '../assets/cards/en-bottom-cover.m4a'
import a6 from '../assets/cards/en-bottom-plate.m4a'
import a7 from '../assets/cards/en-capillary-tube.m4a'
import a8 from '../assets/cards/en-compressor.m4a'
import a9 from '../assets/cards/en-condenser.m4a'
import a10 from '../assets/cards/en-condensing-unit.m4a'
import a11 from '../assets/cards/en-defrost-heater.m4a'
import a12 from '../assets/cards/en-discharge-line.m4a'
import a13 from '../assets/cards/en-discharge-suction-size.m4a'
import a14 from '../assets/cards/en-evaporator.m4a'
import a15 from '../assets/cards/en-expansion-valve.m4a'
import a16 from '../assets/cards/en-fan-motor.m4a'
import a17 from '../assets/cards/en-filter-drier.m4a'
import a18 from '../assets/cards/en-fin-length.m4a'
import a19 from '../assets/cards/en-flare.m4a'
import a20 from '../assets/cards/en-h-p.m4a'
import a21 from '../assets/cards/en-internal-txv-mounting.m4a'
import a22 from '../assets/cards/en-liquid-line.m4a'
import a23 from '../assets/cards/en-oil-separator.m4a'
import a24 from '../assets/cards/en-one-eighth-of-an-inch.m4a'
import a25 from '../assets/cards/en-open-type-condenser.m4a'
import a26 from '../assets/cards/en-outdoor-unit.m4a'
import a27 from '../assets/cards/en-p-s-i-g.m4a'
import a28 from '../assets/cards/en-pressure-switch.m4a'
import a29 from '../assets/cards/en-pressure-test.m4a'
import a30 from '../assets/cards/en-receiver.m4a'
import a31 from '../assets/cards/en-refrigeration-oil.m4a'
import a32 from '../assets/cards/en-return-bend-side.m4a'
import a33 from '../assets/cards/en-rows-by-tubes-by-fin-length.m4a'
import a34 from '../assets/cards/en-saturation-temperature.m4a'
import a35 from '../assets/cards/en-sight-glass.m4a'
import a36 from '../assets/cards/en-solenoid-valve.m4a'
import a37 from '../assets/cards/en-suction-line.m4a'
import a38 from '../assets/cards/en-thermostat.m4a'
import a39 from '../assets/cards/en-top-mount.m4a'
import a40 from '../assets/cards/en-vernier-caliper.m4a'
import a41 from '../assets/cards/tw-01-1094-1130.m4a'
import a42 from '../assets/cards/tw-01-5139-5185.m4a'
import a43 from '../assets/cards/tw-02-3042-3063.m4a'
import a44 from '../assets/cards/tw-02-4082-4104.m4a'
import a45 from '../assets/cards/tw-09-1307-1387.m4a'
import a46 from '../assets/cards/tw-09-519-601.m4a'
import a47 from '../assets/cards/tw-09-5698-5781.m4a'
import a48 from '../assets/cards/tw-10-16424-16468.m4a'
import a49 from '../assets/cards/tw-10-17659-17691.m4a'
import a50 from '../assets/cards/tw-10-6724-6795.m4a'
import a51 from '../assets/cards/tw-10-8050-8131.m4a'

export const CARD_AUDIO: Record<string, { en?: string; tw?: string }> = {
  '壓縮機': { en: a8 },
  '冷凝器': { en: a9, tw: a41 },
  '裸露型散熱器': { en: a25, tw: a44 },
  '蒸發器': { en: a14, tw: a42 },
  '膨脹閥': { en: a15 },
  '毛細管': { en: a7 },
  '機組': { en: a10 },
  '儲液器': { en: a30 },
  '液氣分離器': { en: a1 },
  '乾燥過濾器': { en: a17 },
  '視液鏡': { en: a35 },
  '電磁閥': { en: a36 },
  '壓力開關': { en: a28 },
  '手閥': { en: a2 },
  '油分離器': { en: a23 },
  '溫控器': { en: a38 },
  '除霜電熱管': { en: a11 },
  '排×支×鏡面': { en: a33 },
  '鏡面': { en: a18, tw: a45 },
  '穿管面': { en: a32, tw: a46 },
  '封底': { en: a5, tw: a51 },
  '底板': { en: a6, tw: a50 },
  '風扇馬達': { en: a16, tw: a49 },
  '基板': { en: a3 },
  '機上型': { en: a39 },
  '屋外型': { en: a26, tw: a48 },
  '站壓': { en: a29, tw: a47 },
  '內膨': { en: a21 },
  '液管': { en: a22 },
  '高壓氣管': { en: a12 },
  '吸氣管': { en: a37 },
  '高壓幾分、低壓幾分': { en: a13 },
  '馬': { en: a20, tw: a43 },
  '分': { en: a24 },
  '游標卡尺': { en: a40 },
  '喇叭口': { en: a19 },
  '錶壓': { en: a27 },
  '飽和溫度': { en: a34 },
  'R22 210 psig': { en: a0 },
  '冷凍油': { en: a31 },
  '混合冷媒': { en: a4 },
}
