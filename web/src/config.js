export const GITHUB_OWNER = 'walkinglabs'
export const GITHUB_REPO = 'modern-llm-notebook'
export const GITHUB_BRANCH = 'main'

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
export const GITHUB_REPO_GIT_URL = `${GITHUB_REPO_URL}.git`

export function getNotebookGitHubUrl(meta, notebookId) {
  return `${GITHUB_REPO_URL}/blob/${GITHUB_BRANCH}/notebooks/${meta?.partDir}/${notebookId}.ipynb`
}

export function getNotebookColabUrl(meta, notebookId) {
  return `https://colab.research.google.com/github/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/notebooks/${meta?.partDir}/${notebookId}.ipynb`
}

function getNotebookPath(meta, notebookId) {
  return `notebooks/${meta?.partDir}/${notebookId}.ipynb`
}

function withNotebookParams(baseUrl, meta, notebookId) {
  const params = new URLSearchParams({
    git_repo: GITHUB_REPO_GIT_URL,
    git_branch: GITHUB_BRANCH,
    file_path: getNotebookPath(meta, notebookId),
  })
  return `${baseUrl}?${params.toString()}`
}

export function getNotebookModelScopeUrl(meta, notebookId) {
  return withNotebookParams('https://modelscope.cn/my/mynotebook/preset', meta, notebookId)
}

export function getNotebookBaiduXingheUrl(meta, notebookId) {
  return withNotebookParams('https://aistudio.baidu.com/notebook/open', meta, notebookId)
}

export function getNotebookLaunchLinks(meta, notebookId) {
  return [
    {
      id: 'colab',
      label: '在 Colab 打开',
      href: getNotebookColabUrl(meta, notebookId),
    },
    {
      id: 'modelscope',
      label: '在 ModelScope 打开',
      href: getNotebookModelScopeUrl(meta, notebookId),
    },
    {
      id: 'baidu-xinghe',
      label: '在百度星河社区打开',
      href: getNotebookBaiduXingheUrl(meta, notebookId),
    },
  ]
}
