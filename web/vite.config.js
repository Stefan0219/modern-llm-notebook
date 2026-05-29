import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

function changelogPlugin() {
  const virtualModuleId = 'virtual:changelog'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-changelog',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return
      try {
        // 从项目根目录（web 的上级）读取 git log
        const log = execSync(
          'git log -30 --pretty=format:"%h|%ai|%s"',
          { cwd: new URL('..', import.meta.url), encoding: 'utf-8' }
        )
        const commits = log.trim().split('\n').filter(Boolean).map(line => {
          const [hash, date, ...rest] = line.split('|')
          return { hash, date: date.slice(0, 10), message: rest.join('|') }
        })
        return `export const COMMITS = ${JSON.stringify(commits)}`
      } catch {
        return `export const COMMITS = []`
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), changelogPlugin()],
  define: {
    __CHANGELOG_COMMITS__: (() => {
      try {
        const log = execSync(
          'git log -30 --pretty=format:"%h|%ai|%s"',
          { cwd: new URL('..', import.meta.url), encoding: 'utf-8' }
        )
        return JSON.stringify(
          log.trim().split('\n').filter(Boolean).map(line => {
            const [hash, date, ...rest] = line.split('|')
            return { hash, date: date.slice(0, 10), message: rest.join('|') }
          })
        )
      } catch {
        return '[]'
      }
    })(),
  },
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
