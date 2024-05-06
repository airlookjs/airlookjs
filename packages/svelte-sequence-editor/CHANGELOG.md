## 4.1.7 (2024-05-06)


### 🩹 Fixes

- **@airlookjs/svelte-sequence-editor:** move project release to monorepo ([4153a70](https://github.com/airlookjs/airlookjs/commit/4153a70))


### ❤️  Thank You

- Johan Bichel @smukkejohan

## [4.1.6](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.5...v4.1.6) (2024-03-21)


### Bug Fixes

* calculation of offset left that works inside a relative container ([5470071](https://github.com/airlookjs/svelte-sequence-editor/commit/5470071ae3ca101ee9f813b19afa52bf91db5f2b))

## [4.1.5](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.4...v4.1.5) (2024-03-21)


### Reverts

* Revert "fix: tl-sequence-container does not need position relative, causes timeline to appear over modals in chrome" ([bbba4dc](https://github.com/airlookjs/svelte-sequence-editor/commit/bbba4dcaa50489b60a936d1a84907f480fb563f4))
* Revert "fix: strange position: relative inline style issue, resolve with unsetting" ([4e845a8](https://github.com/airlookjs/svelte-sequence-editor/commit/4e845a841081abb0977ae211ccfcbc8332910e5d))

## [4.1.4](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.3...v4.1.4) (2024-03-21)


### Bug Fixes

* strange position: relative inline style issue, resolve with unsetting ([7b090b3](https://github.com/airlookjs/svelte-sequence-editor/commit/7b090b353692ebbd7cb43a67fcfc14740d4e7d02))

## [4.1.3](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.2...v4.1.3) (2024-03-20)


### Bug Fixes

* tl-sequence-container does not need position relative, causes timeline to appear over modals in chrome ([f7485f6](https://github.com/airlookjs/svelte-sequence-editor/commit/f7485f65a3fe35974ecee33cd8c01d3be275a028))

## [4.1.2](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.1...v4.1.2) (2024-01-24)


### Bug Fixes

* snaptimes should not be overwritten when interacting with new blocks ([b9b6e61](https://github.com/airlookjs/svelte-sequence-editor/commit/b9b6e610ec11a6de1fa7fb7f36aa2901c830a35b))

## [4.1.1](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.1.0...v4.1.1) (2024-01-24)


### Bug Fixes

* cursor style precedence, and block snapping improvements ([d70d233](https://github.com/airlookjs/svelte-sequence-editor/commit/d70d23345b95a9e88cf91b78d604209925299e24))

# [4.1.0](https://github.com/airlookjs/svelte-sequence-editor/compare/v4.0.0...v4.1.0) (2024-01-24)


### Features

* default dynamic snap threshold ([d8fda87](https://github.com/airlookjs/svelte-sequence-editor/commit/d8fda876949c0cdd3bf30859bf52699c32ea979e))
* formattimefn and title for markers ([45e3b38](https://github.com/airlookjs/svelte-sequence-editor/commit/45e3b38a83645b15c814d8c593436465635733e2))

# [4.0.0](https://github.com/airlookjs/svelte-sequence-editor/compare/v3.0.0...v4.0.0) (2024-01-15)


### Bug Fixes

* dont spam console ([2f6b539](https://github.com/airlookjs/svelte-sequence-editor/commit/2f6b5394806abb3df1607036eb66d2f287861951))
* wrong type on sequence context store ([58bf14f](https://github.com/airlookjs/svelte-sequence-editor/commit/58bf14ffbd1b0a7a1660ae31d5587651346fb5df))


### chore

* cleanup context set and get ([34ce238](https://github.com/airlookjs/svelte-sequence-editor/commit/34ce23811b9b0b5e96ba768ddc3a184d3c379788))


### Features

* allow to pass markers directly to block ([aa575e0](https://github.com/airlookjs/svelte-sequence-editor/commit/aa575e07057fec599f198616a320e28323796907))
* dark mode, example with custom colored blocks ([25bea21](https://github.com/airlookjs/svelte-sequence-editor/commit/25bea21c60dd955a3ae20abd0f97f535fb33654f))
* improve marker rendering ([df89181](https://github.com/airlookjs/svelte-sequence-editor/commit/df89181f767c3571530b4db80cc473074bf12a1a))


### BREAKING CHANGES

* removed setTime on context

# [3.0.0](https://github.com/airlookjs/svelte-sequence-editor/compare/v2.0.2...v3.0.0) (2024-01-10)


### Bug Fixes

* base link ([e413733](https://github.com/airlookjs/svelte-sequence-editor/commit/e413733cd7ecbd402698f3823c3f86cdf30788c6))
* **CI:** access public ([a569485](https://github.com/airlookjs/svelte-sequence-editor/commit/a569485e1b94c60aacabad78692b862dbcac3dae))
* **CI:** new token ([4c6936c](https://github.com/airlookjs/svelte-sequence-editor/commit/4c6936c562e3d07fc57e07038ee09fbb3add4da4))
* duplicate code to check for errorHandler ([5261811](https://github.com/airlookjs/svelte-sequence-editor/commit/52618114311f4b30aabc2e49c9befa443eecaa75))
* multiple type errors and more ([1e6be17](https://github.com/airlookjs/svelte-sequence-editor/commit/1e6be17d7b580a6aa1673f9b52a30570fb5d7aca))
* **package:** build and include dist ([4a2bba3](https://github.com/airlookjs/svelte-sequence-editor/commit/4a2bba3eb917bc75c06cb4282f54f79b99a1752d))
* wrong name for import ([d20d048](https://github.com/airlookjs/svelte-sequence-editor/commit/d20d04860f6738af633239710c4b9e05fe9633fc))


### Chore

* npm version shield ([b232771](https://github.com/airlookjs/svelte-sequence-editor/commit/b232771886eb59c17a9ec9c2929cd5387b496b7a))


### Features

* allow snapping to handles and markers ([466dbdc](https://github.com/airlookjs/svelte-sequence-editor/commit/466dbdccd6292667d0c2214ff5a9af827b87005c))
* Update README.md, testing release workflow ([b05362d](https://github.com/airlookjs/svelte-sequence-editor/commit/b05362dd8f5704bb580702659d1ce0d497848f57))
* upgrade to svelte 2.0 ([7c87cb9](https://github.com/airlookjs/svelte-sequence-editor/commit/7c87cb966ed09b6252c6e49c4636225a02c5b070))


### BREAKING CHANGES

* renamed some slots in components, now we have layers and layer, aswell as blocks and block. See new marker example for usage.
* Timeline has been renamed Sequence, everywhere

## [2.0.2](https://github.com/airlookjs/svelte-sequence-editor/compare/v2.0.1...v2.0.2) (2023-11-24)

### Bug Fixes

- base link ([e6d8568](https://github.com/airlookjs/svelte-sequence-editor/commit/e6d8568fd73a5960e01ac3c233570b96a93b37b8))

## [2.0.1](https://github.com/airlookjs/svelte-sequence-editor/compare/v2.0.0...v2.0.1) (2023-11-24)

### Bug Fixes

- duplicate code to check for errorHandler ([8593c1e](https://github.com/airlookjs/svelte-sequence-editor/commit/8593c1e8e7ff0f7315e6d10a7d791b833c233b03))
- multiple type errors and more ([10ab84c](https://github.com/airlookjs/svelte-sequence-editor/commit/10ab84c6ad06f2f84fc0ed3c01dcfef3f355e532))
- wrong name for import ([427c6c9](https://github.com/airlookjs/svelte-sequence-editor/commit/427c6c9989ecf6f4bf2ebe9964567b02d231411f))

# [2.0.0](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.6...v2.0.0) (2023-11-22)

### Chore

- npm version shield ([c242b65](https://github.com/airlookjs/svelte-sequence-editor/commit/c242b65f84479e9508f1556c3089705bae43e0b5))

### BREAKING CHANGES

- Timeline has been renamed Sequence, everywhere

## [1.0.6](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.5...v1.0.6) (2023-11-22)

### Bug Fixes

- **package:** build and include dist ([03ec611](https://github.com/airlookjs/svelte-sequence-editor/commit/03ec61126a29f3d652dfeb382c32ea49b3c25088))

## [1.0.5](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.4...v1.0.5) (2023-11-21)

### Bug Fixes

- **CI:** access public ([ddd867d](https://github.com/airlookjs/svelte-sequence-editor/commit/ddd867d0bc11c730330e24fd7e3044590897b6cd))

## [1.0.4](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.3...v1.0.4) (2023-11-21)

### Bug Fixes

- **CI:** new token ([d39acd4](https://github.com/airlookjs/svelte-sequence-editor/commit/d39acd471043d25fc57eb15b6d2cbc3c1d1da85f))

## [1.0.3](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.2...v1.0.3) (2023-11-21)

## [1.0.2](https://github.com/airlookjs/svelte-sequence-editor/compare/v1.0.1...v1.0.2) (2023-11-21)

# 1.0.0 (2023-11-21)

### Features

- Update README.md, testing release workflow ([2b5a12d](https://github.com/airlookjs/svelte-sequence-editor/commit/2b5a12d6a86447833132a818646050e94febdf48))
