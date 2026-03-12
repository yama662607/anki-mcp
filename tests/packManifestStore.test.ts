import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DraftStore } from '../src/persistence/draftStore.js';
import type { StarterPackManifest } from '../src/contracts/types.js';

function createStore() {
  const dir = mkdtempSync(join(tmpdir(), 'anki-mcps-pack-store-'));
  const store = new DraftStore(join(dir, 'drafts.sqlite'));
  return { dir, store };
}

function exampleManifest(overrides: Partial<StarterPackManifest> = {}): StarterPackManifest {
  return {
    packId: 'custom.lang.ja-core',
    label: 'Japanese Core',
    version: '2026-03-12.v1',
    domains: ['japanese'],
    supportedOptions: [
      {
        name: 'deckRoot',
        type: 'string',
        required: false,
        description: 'Deck root',
        defaultValue: 'Languages::Japanese',
      },
      {
        name: 'variants',
        type: 'string_array',
        required: false,
        description: 'Variant selection',
        defaultValue: ['kana'],
      },
    ],
    deckRoots: ['Languages::Japanese'],
    tagTemplates: {
      'language.v1.japanese-vocab': ['domain::japanese', 'skill::vocabulary'],
    },
    noteTypes: [
      {
        modelName: 'language.v1.japanese-vocab',
        fields: [{ name: 'Expression' }, { name: 'Meaning' }],
        templates: [
          {
            name: 'Card 1',
            front: '<div>{{Expression}}</div>',
            back: '{{FrontSide}}<hr id="answer"><div>{{Meaning}}</div>',
          },
        ],
        css: '.card { color: white; background: black; }',
      },
    ],
    cardTypes: [
      {
        cardTypeId: 'language.v1.japanese-vocab',
        label: 'Japanese Vocabulary',
        modelName: 'language.v1.japanese-vocab',
        defaultDeck: 'Languages::Japanese::Vocabulary',
        source: 'custom',
        requiredFields: ['Expression', 'Meaning'],
        optionalFields: [],
        renderIntent: 'recognition',
        allowedHtmlPolicy: 'safe_inline_html',
        fields: [
          { name: 'Expression', required: true, type: 'text', allowedHtmlPolicy: 'safe_inline_html' },
          { name: 'Meaning', required: true, type: 'markdown', allowedHtmlPolicy: 'safe_inline_html', multiline: true },
        ],
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  // explicit cleanup in each test
});

describe('DraftStore pack manifests', () => {
  it('stores and retrieves active custom pack manifests', () => {
    const { dir, store } = createStore();

    try {
      const manifest = exampleManifest();
      const updated = store.upsertPackManifest('default', manifest, '2026-03-12T00:00:00.000Z');

      expect(updated.packId).toBe(manifest.packId);
      expect(updated.profileId).toBe('default');
      expect(updated.status).toBe('active');
      expect(store.getPackManifest('default', manifest.packId)?.packId).toBe(manifest.packId);
      expect(store.listPackManifests('default').map((item) => item.packId)).toEqual([manifest.packId]);
    } finally {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('deprecates manifests without deleting historical access', () => {
    const { dir, store } = createStore();

    try {
      const manifest = exampleManifest();
      store.upsertPackManifest('default', manifest, '2026-03-12T00:00:00.000Z');
      const deprecated = store.deprecatePackManifest('default', manifest.packId, '2026-03-12T01:00:00.000Z');

      expect(deprecated.status).toBe('deprecated');
      expect(store.getPackManifest('default', manifest.packId)).toBeUndefined();
      expect(store.getPackManifest('default', manifest.packId, { includeDeprecated: true })?.deprecatedAt).toBe('2026-03-12T01:00:00.000Z');
      expect(store.listPackManifests('default')).toEqual([]);
      expect(store.listPackManifests('default', { includeDeprecated: true }).map((item) => item.status)).toEqual(['deprecated']);
    } finally {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('records and looks up pack-owned resources', () => {
    const { dir, store } = createStore();

    try {
      const manifest = exampleManifest();
      store.upsertPackManifest('default', manifest, '2026-03-12T00:00:00.000Z');

      store.replacePackResourceBindings('default', manifest.packId, [
        { resourceType: 'note_type', resourceId: 'language.v1.japanese-vocab' },
        { resourceType: 'card_type_definition', resourceId: 'language.v1.japanese-vocab' },
      ], '2026-03-12T00:10:00.000Z');

      expect(store.listPackResourceBindings('default', manifest.packId)).toEqual([
        {
          profileId: 'default',
          packId: manifest.packId,
          resourceType: 'card_type_definition',
          resourceId: 'language.v1.japanese-vocab',
          updatedAt: '2026-03-12T00:10:00.000Z',
        },
        {
          profileId: 'default',
          packId: manifest.packId,
          resourceType: 'note_type',
          resourceId: 'language.v1.japanese-vocab',
          updatedAt: '2026-03-12T00:10:00.000Z',
        },
      ]);

      expect(store.getPackResourceOwner('default', 'note_type', 'language.v1.japanese-vocab')).toEqual({
        profileId: 'default',
        packId: manifest.packId,
        resourceType: 'note_type',
        resourceId: 'language.v1.japanese-vocab',
        updatedAt: '2026-03-12T00:10:00.000Z',
      });
    } finally {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
