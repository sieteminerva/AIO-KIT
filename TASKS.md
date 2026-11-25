## PLAN

- [ ] Make architecture plug and play, by making inside /prompts is the command to run.
      for example: There is /prompts/File, by default the index.ts will always scan that /prompts whenever
      `aio` command is executed. so by then `aio file` is automatically available

- [ ] Under `New` command, create:
  - vite x @aio-ui (custom build)
  - vite x @aio-gas (GAS consumer app x @aio-gas-library)
  - vite x @aio-ext (Chrome Extension)
  - vite x @aio-desktop (Desktop App)
  - vite x @aio-mobile (Mobile App)
