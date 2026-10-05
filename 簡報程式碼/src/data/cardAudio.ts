// 自動產生（工具/make_card_audio.py），不要手改：名詞翻卡的英文發音、老闆原音小檔
// 英文用 Windows 內建英文語音（Microsoft Zira）錄好；老闆說的片段從上課錄音剪出來
import a0 from '../assets/cards/en-1-5-8-inch.m4a'
import a1 from '../assets/cards/en-about-40-42-degrees-celsius.m4a'
import a2 from '../assets/cards/en-accumulator.m4a'
import a3 from '../assets/cards/en-ball-valve.m4a'
import a4 from '../assets/cards/en-base-plate.m4a'
import a5 from '../assets/cards/en-blend-refrigerant.m4a'
import a6 from '../assets/cards/en-bottom-cover.m4a'
import a7 from '../assets/cards/en-bottom-plate.m4a'
import a8 from '../assets/cards/en-capillary-tube.m4a'
import a9 from '../assets/cards/en-compressor.m4a'
import a10 from '../assets/cards/en-condenser.m4a'
import a11 from '../assets/cards/en-condensing-unit.m4a'
import a12 from '../assets/cards/en-defrost-heater.m4a'
import a13 from '../assets/cards/en-discharge-line.m4a'
import a14 from '../assets/cards/en-discharge-suction-size.m4a'
import a15 from '../assets/cards/en-drier-size.m4a'
import a16 from '../assets/cards/en-evaporator.m4a'
import a17 from '../assets/cards/en-expansion-valve.m4a'
import a18 from '../assets/cards/en-fan-motor.m4a'
import a19 from '../assets/cards/en-filter-drier.m4a'
import a20 from '../assets/cards/en-fin-length.m4a'
import a21 from '../assets/cards/en-flare-adapter.m4a'
import a22 from '../assets/cards/en-flare-connection.m4a'
import a23 from '../assets/cards/en-flare-fitting.m4a'
import a24 from '../assets/cards/en-flare.m4a'
import a25 from '../assets/cards/en-h-p.m4a'
import a26 from '../assets/cards/en-internal-txv-mounting.m4a'
import a27 from '../assets/cards/en-line-set-cover.m4a'
import a28 from '../assets/cards/en-liquid-line.m4a'
import a29 from '../assets/cards/en-od-id.m4a'
import a30 from '../assets/cards/en-oil-separator.m4a'
import a31 from '../assets/cards/en-one-eighth-of-an-inch.m4a'
import a32 from '../assets/cards/en-open-type-condenser.m4a'
import a33 from '../assets/cards/en-outdoor-unit.m4a'
import a34 from '../assets/cards/en-p-s-i-g.m4a'
import a35 from '../assets/cards/en-pipe-insulation.m4a'
import a36 from '../assets/cards/en-pre-insulated-copper-pair.m4a'
import a37 from '../assets/cards/en-pressure-switch.m4a'
import a38 from '../assets/cards/en-pressure-test.m4a'
import a39 from '../assets/cards/en-receiver.m4a'
import a40 from '../assets/cards/en-reducer.m4a'
import a41 from '../assets/cards/en-refrigeration-oil.m4a'
import a42 from '../assets/cards/en-return-bend-side.m4a'
import a43 from '../assets/cards/en-rows-by-tubes-by-fin-length.m4a'
import a44 from '../assets/cards/en-saturation-temperature.m4a'
import a45 from '../assets/cards/en-sight-glass.m4a'
import a46 from '../assets/cards/en-solder-connection.m4a'
import a47 from '../assets/cards/en-solenoid-valve.m4a'
import a48 from '../assets/cards/en-suction-line.m4a'
import a49 from '../assets/cards/en-sweating.m4a'
import a50 from '../assets/cards/en-tee-wye.m4a'
import a51 from '../assets/cards/en-thermostat.m4a'
import a52 from '../assets/cards/en-top-mount.m4a'
import a53 from '../assets/cards/en-vernier-caliper.m4a'
import a54 from '../assets/cards/tw-01-1094-1130.m4a'
import a55 from '../assets/cards/tw-01-5139-5185.m4a'
import a56 from '../assets/cards/tw-02-3042-3063.m4a'
import a57 from '../assets/cards/tw-02-4082-4104.m4a'
import a58 from '../assets/cards/tw-09-1307-1387.m4a'
import a59 from '../assets/cards/tw-09-519-601.m4a'
import a60 from '../assets/cards/tw-09-5698-5781.m4a'
import a61 from '../assets/cards/tw-10-16424-16468.m4a'
import a62 from '../assets/cards/tw-10-17659-17691.m4a'
import a63 from '../assets/cards/tw-10-6724-6795.m4a'
import a64 from '../assets/cards/tw-10-8050-8131.m4a'
import a65 from '../assets/cards/tw-12-11239-11309.m4a'
import a66 from '../assets/cards/tw-12-11827-11847.m4a'
import a67 from '../assets/cards/tw-12-16885-16947.m4a'
import a68 from '../assets/cards/tw-12-17104-17128.m4a'
import a69 from '../assets/cards/tw-12-23635-23725.m4a'
import a70 from '../assets/cards/tw-12-26221-26289.m4a'
import a71 from '../assets/cards/tw-12-28563-28620.m4a'
import a72 from '../assets/cards/tw-12-37466-37567.m4a'
import a73 from '../assets/cards/tw-12-4681-4744.m4a'
import a74 from '../assets/cards/tw-12-7187-7303.m4a'

export const CARD_AUDIO: Record<string, { en?: string; tw?: string }> = {
  '壓縮機': { en: a9 },
  '冷凝器': { en: a10, tw: a54 },
  '裸露型散熱器': { en: a32, tw: a57 },
  '蒸發器': { en: a16, tw: a55 },
  '膨脹閥': { en: a17 },
  '毛細管': { en: a8 },
  '機組': { en: a11 },
  '儲液器': { en: a39 },
  '液氣分離器': { en: a2 },
  '乾燥過濾器': { en: a19 },
  '視液鏡': { en: a45 },
  '電磁閥': { en: a47 },
  '壓力開關': { en: a37 },
  '手閥': { en: a3 },
  '油分離器': { en: a30 },
  '溫控器': { en: a51 },
  '除霜電熱管': { en: a12 },
  '排×支×鏡面': { en: a43 },
  '鏡面': { en: a20, tw: a58 },
  '穿管面': { en: a42, tw: a59 },
  '封底': { en: a6, tw: a64 },
  '底板': { en: a7, tw: a63 },
  '風扇馬達': { en: a18, tw: a62 },
  '基板': { en: a4 },
  '機上型': { en: a52 },
  '屋外型': { en: a33, tw: a61 },
  '外徑／內徑': { en: a29, tw: a74 },
  'ODF': { en: a46, tw: a67 },
  'SAE': { en: a22, tw: a69 },
  '032／052': { en: a15, tw: a68 },
  '喇叭頭': { en: a23 },
  '大小頭': { en: a40, tw: a65 },
  '三通': { en: a50 },
  '一八五': { en: a0, tw: a66 },
  '被覆銅管': { en: a36, tw: a70 },
  '修飾管槽': { en: a27 },
  '四外三內': { en: a21, tw: a71 },
  '保溫管': { en: a35 },
  '倒汗': { en: a49, tw: a72 },
  '站壓': { en: a38, tw: a60 },
  '內膨': { en: a26 },
  '液管': { en: a28 },
  '高壓氣管': { en: a13 },
  '吸氣管': { en: a48 },
  '高壓幾分、低壓幾分': { en: a14 },
  '馬': { en: a25, tw: a56 },
  '分': { en: a31 },
  '游標卡尺': { en: a53, tw: a73 },
  '喇叭口': { en: a24 },
  '錶壓': { en: a34 },
  '飽和溫度': { en: a44 },
  'R22 210 psig': { en: a1 },
  '冷凍油': { en: a41 },
  '混合冷媒': { en: a5 },
}
