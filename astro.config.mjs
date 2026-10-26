// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Interview-Kästen aus Obsidian (> [!frage] …) sind nur Schreibhilfe und erscheinen nicht auf der Seite.
const ohneFragen = () => (tree) => {
  // Ab der Interview-Markierung ist alles privat (Fragen, Antworten, Bilder-Ablage).
  const ab = tree.children.findIndex((n) => n.type === 'html' && /<!--\s*INTERVIEW/i.test(n.value || ''));
  if (ab >= 0) tree.children = tree.children.slice(0, ab);
  tree.children = tree.children.filter(
    (n) => !(n.type === 'blockquote' && /^\[!frage\]/i.test(n.children?.[0]?.children?.[0]?.value ?? '')),
  );
};

// https://astro.build/config
export default defineConfig({
  site: 'https://kestrel-2tf.pages.dev',
  integrations: [sitemap({ filter: (seite) => !seite.includes('/merkliste') })],
  markdown: { remarkPlugins: [ohneFragen] },
  // node_modules ist eine Verknüpfung auf node_modules.nosync (iCloud synchronisiert den Ordner nicht).
  vite: { resolve: { preserveSymlinks: true } },
});
