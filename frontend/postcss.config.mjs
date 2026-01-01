// postcss.config.mjs
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer({
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead',
      ]
    }),
  ],
};
