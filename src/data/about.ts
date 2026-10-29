import portrait from '../assets/about/portrait.svg'

export type About = {
  photo: string
  /** 固定三段，顺序即展示顺序 */
  paragraphs: readonly [string, string, string]
  brand: string
}

/**
 * 关于我区域数据源。照片与文案均为占位内容，由站主按真实资料替换。
 * 品牌标签文案固定为「混血哲谈」，是纯展示文本。
 */
export const ABOUT: About = {
  photo: portrait,
  paragraphs: [
    '我是寬真居士，一名全栈工程师。日常在代码与传统文化之间来回，既写产品，也读经典。',
    '做技术这些年，越来越相信慢功夫：把系统想清楚，比把功能堆上去更难，也更值得。',
    '「混血哲谈」是我给个人作品起的名字——把不同来路的想法放在一起谈，聊出新的东西。',
  ],
  brand: '混血哲谈',
}
