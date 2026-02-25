// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: '秋云文档',
			logo: {
				src: './public/favicon.svg',
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/qiuqyCN' },
			],
			sidebar: [
				{
					label: '关于我',
					items: [{ label: '个人简介', slug: 'about' }],
				},
				{
					label: '项目作品',
					items: [{ label: '项目列表', slug: 'projects' }],
				},
				{
					label: '学习笔记',
					autogenerate: { directory: 'notes' },
				},
				{
					label: '代码片段',
					autogenerate: { directory: 'snippets' },
				},
			],
		}),
	],
});
