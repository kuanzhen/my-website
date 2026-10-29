import atlasSearch from '../assets/projects/atlas-search.svg'
import inkstoneNotes from '../assets/projects/inkstone-notes.svg'
import nebulaDashboard from '../assets/projects/nebula-dashboard.svg'
import orbitCli from '../assets/projects/orbit-cli.svg'

export type Project = {
  id: string
  name: string
  /** 站主对项目的见解，不是功能罗列 */
  summary: string
  githubUrl: string
  image: string
}

/**
 * 项目展示区数据源。截图与文案均为占位内容，由站主按真实项目替换。
 * 卡片数量下限为 4（见 project-section 规范）。
 */
export const PROJECTS: readonly Project[] = [
  {
    id: 'nebula-dashboard',
    name: '星图数据看板',
    summary: '把零散指标拼成一张能读懂的整体图景，比堆图表更考验取舍。',
    githubUrl: 'https://github.com/kuanzhen/nebula-dashboard',
    image: nebulaDashboard,
  },
  {
    id: 'atlas-search',
    name: 'Atlas 文档检索',
    summary: '检索的价值不在命中多少条，而在让人相信第一条就是答案。',
    githubUrl: 'https://github.com/kuanzhen/atlas-search',
    image: atlasSearch,
  },
  {
    id: 'inkstone-notes',
    name: '砚台笔记',
    summary: '写作工具应当安静，把注意力还给内容本身，而不是编辑器的花哨。',
    githubUrl: 'https://github.com/kuanzhen/inkstone-notes',
    image: inkstoneNotes,
  },
  {
    id: 'orbit-cli',
    name: 'Orbit 命令行工具',
    summary: '一条命令完成部署，把重复流程收敛成可复述的动作。',
    githubUrl: 'https://github.com/kuanzhen/orbit-cli',
    image: orbitCli,
  },
]
