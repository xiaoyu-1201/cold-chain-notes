/**
 * 15 段完整上課錄音（離線檔、本機開發用）。
 * 公開網站（npm run build:pages）不放：vite.config 會把這個檔換成 classAudio.public.ts。
 * 原因（10/09 使用者決定）：錄音裡有客人名字、價格、品牌評價、講電話的內容，逐字稿匿名化了，錄音沒辦法。
 */
import part1Url from '../assets/class-0101-part1.m4a'
import part2Url from '../assets/class-0101-part2.m4a'
import part3Url from '../assets/class-0101-part3.m4a'
import part4Url from '../assets/class-0101-part4.m4a'
import part5Url from '../assets/class-0101-part5.m4a'
import part6Url from '../assets/class-1002-part1.m4a'
import part7Url from '../assets/class-1002-part2.m4a'
import part8Url from '../assets/class-1002-part3-1.m4a'
import part9Url from '../assets/class-1002-part3-2.m4a'
import part10Url from '../assets/class-1002-part3-3.m4a'
import part11Url from '../assets/class-1002-part3-4.m4a'
import part12Url from '../assets/class-1005-part1.m4a'
import part13Url from '../assets/class-1006-part1.m4a'
import part14Url from '../assets/class-1006-part2.m4a'
import part15Url from '../assets/class-1007-part1.m4a'

export const CLASS_AUDIO_URLS: string[] = [part1Url, part2Url, part3Url, part4Url, part5Url, part6Url, part7Url, part8Url, part9Url, part10Url, part11Url, part12Url, part13Url, part14Url, part15Url]
