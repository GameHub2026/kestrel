// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Interview-Kästen aus Obsidian (> [!frage] …) sind nur Schreibhilfe und erscheinen nicht auf der Seite.
const ohneFragen = () => (tree) => {
  tree.children = tree.children.filter(
    (n) => !(n.type === 'blockquote' && /^\[!frage\]/i.test(n.children?.[0]?.children?.[0]?.value ?? '')),
  );
};

// https://astro.build/config
export default defineConfig({
  site: 'https://kestrel-2tf.pages.dev',
  integrations: [sitemap()],
  markdown: { remarkPlugins: [ohneFragen] },
});
