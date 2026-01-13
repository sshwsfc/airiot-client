import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@airiot/client',
  description: 'Airiot TypeScript 客户端库文档',
  lang: 'zh-CN',

  base: '/airiot-client/',

  ignoreDeadLinks: 'localhostLinks',

  themeConfig: {
    nav: [
        { text: '首页', link: '/' },
        { text: '指南', link: '/getting-started' },
        { text: '示例', link: '/examples' },
        {
          text: 'GitHub',
          link: 'https://github.com/sshwsfc/airiot-client'
        }
      ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '快速开始', link: '/getting-started' },
          { text: '安装', link: '/getting-started#安装' }
        ]
      },
      {
        text: '核心模块',
        items: [
          { text: 'API 模块', link: '/api' },
          { text: '认证模块', link: '/auth' },
          { text: '表单模块', link: '/form' },
          { text: '模型模块', link: '/model' },
          { text: '全局钩子', link: '/hooks' }
        ]
      },
      {
        text: '更多',
        items: [
          { text: '使用示例', link: '/examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sshwsfc/airiot-client' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2026 Airiot'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }]
  ]
})
