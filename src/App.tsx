import { Hero } from './components/Hero/Hero'
import { NavBar } from './components/Navigation/NavBar'
import { PlaceholderSection } from './components/sections/PlaceholderSection'
import { ProjectSection } from './components/sections/ProjectSection'
import { PROJECTS } from './data/projects'

const PROFILE = {
  name: '寬真居士',
  role: '全栈工程师',
  intro: '喜欢儒释道传统文化，自认为是马列主义者的 AI coder',
  projectsLabel: '我的项目',
} as const

// 联系我占位只提供导航锚点，实际内容留待后续变更
const CONTACT_SECTION = {
  id: 'contact',
  title: '联系我',
  description: '内容待补充',
} as const

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Hero
          name={PROFILE.name}
          role={PROFILE.role}
          intro={PROFILE.intro}
          projectsLabel={PROFILE.projectsLabel}
        />
        <ProjectSection projects={PROJECTS} />
        <PlaceholderSection
          id={CONTACT_SECTION.id}
          title={CONTACT_SECTION.title}
          description={CONTACT_SECTION.description}
        />
      </main>
    </>
  )
}

export default App
