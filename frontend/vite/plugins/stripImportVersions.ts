// vite/plugins/stripImportVersions.ts
import type { Plugin } from 'vite';

export default function stripImportVersions(): Plugin {
  return {
    name: 'strip-import-versions',
    enforce: 'pre',

    resolveId(source, importer, options) {
      const match = source.match(/^([\w\-@\/]+)@([\d.]+)$/);
      if (match) {
        const [_, pkg, _version] = match;
        return this.resolve(pkg, importer, { skipSelf: true });
      }
      return null;
    },

    transform(code, id) {
      if (!id.endsWith('.tsx') && !id.endsWith('.ts')) return;

      return code.replace(
        /from\s+['"]([\w\-@\/]+)@([\d.]+)['"]/g,
        (_, pkg) => `from '${pkg}'`
      );
    },
  };
}
