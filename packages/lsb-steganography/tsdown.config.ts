import { defineConfig } from 'tsdown'

export default [
  defineConfig({
    entry: './src/lib.ts',
    dts: true,
  }),
  defineConfig({
    entry: './src/cli.ts',
    dts: false,
    outputOptions: {
      banner: '#! /usr/bin/env node',
    },
  }),
]
