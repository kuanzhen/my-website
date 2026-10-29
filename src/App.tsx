import { Hero } from './components/Hero/Hero'
import { NavBar } from './components/Navigation/NavBar'
import { AboutSection } from './components/sections/AboutSection'
import { PlaceholderSection } from './components/sections/PlaceholderSection'
import { ProjectSection } from './components/sections/ProjectSection'
import { ABOUT } from './data/about'
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
      <header>
        <NavBar />
      </header>
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
        <AboutSection
          photo={ABOUT.photo}
          paragraphs={ABOUT.paragraphs}
          brand={ABOUT.brand}
        />
      </main>
    </>
  )
}

export default App
