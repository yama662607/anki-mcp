import { describe, expect, it } from 'vitest';
import { resolveStarterPack } from '../src/contracts/starterPacks.js';

describe('starter pack manifests', () => {
  it('locks english pack field sets, deck roots, and tag conventions', () => {
    const pack = resolveStarterPack('english-core');
    expect(pack?.deckRoots).toEqual(['Languages::English']);
    expect(pack?.tagTemplates['language.v1.english-vocab-recognition']).toEqual([
      'domain::english',
      'skill::vocabulary',
      'direction::recognition',
    ]);
    expect(pack?.cardTypes.find((item) => item.cardTypeId === 'language.v1.english-listening-comprehension')?.requiredFields).toEqual([
      'Audio',
      'Prompt',
      'Answer',
    ]);
  });

  it('locks programming pack deck roots and field sets for requested languages', () => {
    const pack = resolveStarterPack('programming-core', {
      deckRoot: 'Programming',
      languages: ['typescript'],
    });
    expect(pack?.deckRoots).toEqual(['Programming::TypeScript']);
    expect(pack?.tagTemplates['programming.v1.typescript-debug']).toEqual([
      'domain::programming',
      'language::typescript',
      'skill::debug',
    ]);
    expect(pack?.cardTypes.find((item) => item.cardTypeId === 'programming.v1.typescript-build')?.requiredFields).toEqual([
      'Prompt',
      'Starter',
      'Expected',
    ]);
  });

  it('locks fundamentals pack cloze conventions', () => {
    const pack = resolveStarterPack('fundamentals-core');
    expect(pack?.deckRoots).toEqual(['Fundamentals']);
    expect(pack?.tagTemplates['fundamentals.v1.cloze']).toEqual([
      'domain::fundamentals',
      'skill::cloze',
    ]);
    expect(pack?.cardTypes.find((item) => item.cardTypeId === 'fundamentals.v1.cloze')?.requiredFields).toEqual(['Text']);
    const clozeTemplate = pack?.noteTypes.find((item) => item.modelName === 'study.v1.cloze')?.templates[0];
    expect(clozeTemplate?.front).toContain('{{cloze:Text}}');
    expect(clozeTemplate?.back).toContain('{{cloze:Text}}');
  });
});
