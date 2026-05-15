/* eslint-disable no-console */
import fs from 'fs';
import {execSync} from 'child_process';

const red = (t) => `\x1b[31m${t}\x1b[0m`;
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const blue = (t) => `\x1b[36m${t}\x1b[0m`;

console.log(blue('\n🔍 DIAGNÓSTICO COMPLETO HYDROGEN\n'));

function run(title, cmd) {
  console.log(yellow(`\n📌 ${title}`));

  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    console.log(green(output || 'OK'));
  } catch (e) {
    console.log(red(e.stdout || e.message));
  }
}

function exists(file) {
  if (fs.existsSync(file)) {
    console.log(green(`✔ ${file}`));
  } else {
    console.log(red(`✘ Missing: ${file}`));
  }
}

console.log(yellow('\n📂 Revisando archivos importantes\n'));

[
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'app/root.tsx',
  'app/entry.server.tsx',
  'app/entry.client.tsx',
].forEach(exists);

run('Node version', 'node -v');

run('NPM version', 'npm -v');

run('Dependencias rotas', 'npm ls');

run('Problemas seguridad', 'npm audit --omit=dev');

run('Errores TypeScript', 'npx tsc --noEmit');

run('Errores ESLint', 'npx eslint .');

run('Versiones React Router', 'npm ls react-router');

run('Versiones Remix', 'npm ls @remix-run/dev');

run('Versiones Hydrogen', 'npm ls @shopify/hydrogen');

run('Versiones Oxygen', 'npm ls @shopify/remix-oxygen');

run('Versiones Vite', 'npm ls vite');

run('Módulos duplicados', 'npm dedupe --dry-run');

run('Build Vite', 'npx vite build');

run('Hydrogen build', 'npx shopify hydrogen build');

console.log(blue('\n✅ Diagnóstico terminado\n'));
