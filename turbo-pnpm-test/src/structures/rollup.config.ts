import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  // Main build: TypeScript to ESM
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
    external: (id: string) => {
      // Bundle relative imports (./ or ../)
      if (id.startsWith('./') || id.startsWith('../')) {
        return false;
      }
      // Externalize everything else (npm modules, workspace packages)
      return true;
    },
  },
  // Type definitions
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
    external: (id: string) => {
      // Bundle relative imports (./ or ../)
      if (id.startsWith('./') || id.startsWith('../')) {
        return false;
      }
      // Externalize everything else (npm modules, workspace packages)
      return true;
    },
  },
]);

