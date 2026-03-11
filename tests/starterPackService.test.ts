import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DraftStore } from '../src/persistence/draftStore.js';
import { MemoryGateway } from '../src/gateway/memoryGateway.js';
import { CatalogService } from '../src/services/catalogService.js';
import { NoteTypeService } from '../src/services/noteTypeService.js';
import { StarterPackService } from '../src/services/starterPackService.js';
import { MediaService } from '../src/services/mediaService.js';

function createContext() {
  const dir = mkdtempSync(join(tmpdir(), 'anki-mcps-pack-'));
  const store = new DraftStore(join(dir, 'drafts.sqlite'));
  const gateway = new MemoryGateway();
  const catalogService = new CatalogService(store);
  const noteTypeService = new NoteTypeService(gateway, { activeProfileId: 'default' });
  const starterPackService = new StarterPackService(noteTypeService, catalogService, { activeProfileId: 'default' });
  const mediaService = new MediaService(gateway, { activeProfileId: 'default' });
  return { dir, store, gateway, catalogService, noteTypeService, starterPackService, mediaService };
}

afterEach(() => {
  // no-op placeholder for explicit cleanup inside tests
});

describe('StarterPackService', () => {
  it('lists available starter packs with supported options', async () => {
    const context = createContext();

    try {
      const listed = await context.starterPackService.listStarterPacks({ profileId: 'default' });

      expect(listed.packCatalogVersion).toMatch(/^2026-/);
      expect(listed.packs.map((item) => item.packId)).toEqual([
        'english-core',
        'fundamentals-core',
        'programming-core',
      ]);
      expect(listed.packs.find((item) => item.packId === 'programming-core')?.supportedOptions.some((option) => option.name === 'languages')).toBe(true);
    } finally {
      context.store.close();
      rmSync(context.dir, { recursive: true, force: true });
    }
  });

  it('dry-runs and applies the english core pack idempotently', async () => {
    const context = createContext();

    try {
      const planned = await context.starterPackService.applyStarterPack({
        profileId: 'default',
        packId: 'english-core',
        dryRun: true,
      });

      expect(planned.result.status).toBe('planned');
      expect(planned.result.operations.some((operation) => operation.kind === 'note_type' && operation.id === 'language.v1.vocab-recognition' && operation.status === 'create')).toBe(true);
      expect(planned.result.deckRoots).toContain('Languages::English');
      expect(planned.result.tagTemplates['language.v1.english-listening-comprehension']).toEqual(['domain::english', 'skill::listening']);

      const applied = await context.starterPackService.applyStarterPack({
        profileId: 'default',
        packId: 'english-core',
        dryRun: false,
      });

      expect(applied.result.status).toBe('applied');
      expect((await context.noteTypeService.listNoteTypes({ profileId: 'default' })).noteTypes.some((item) => item.modelName === 'language.v1.listening-comprehension')).toBe(true);
      expect(context.catalogService.listCardTypeDefinitions('default').items.some((item) => item.cardTypeId === 'language.v1.english-listening-comprehension')).toBe(true);

      const reapplied = await context.starterPackService.applyStarterPack({
        profileId: 'default',
        packId: 'english-core',
        dryRun: false,
      });

      expect(reapplied.result.operations.every((operation) => operation.status === 'unchanged')).toBe(true);
    } finally {
      context.store.close();
      rmSync(context.dir, { recursive: true, force: true });
    }
  });

  it('validates programming pack language options and creates per-language card types', async () => {
    const context = createContext();

    try {
      await expect(
        context.starterPackService.applyStarterPack({
          profileId: 'default',
          packId: 'programming-core',
          dryRun: true,
          options: {
            languages: ['typescript', 'zig'],
          },
        }),
      ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });

      const applied = await context.starterPackService.applyStarterPack({
        profileId: 'default',
        packId: 'programming-core',
        dryRun: false,
        options: {
          languages: ['typescript', 'python'],
          deckRoot: 'Programming',
        },
      });

      expect(applied.result.deckRoots).toEqual(['Programming::Python', 'Programming::TypeScript']);
      expect(applied.result.tagTemplates['programming.v1.typescript-output']).toEqual(['domain::programming', 'language::typescript', 'skill::output']);
      const definitions = context.catalogService.listCardTypeDefinitions('default').items.map((item) => item.cardTypeId);
      expect(definitions).toContain('programming.v1.typescript-output');
      expect(definitions).toContain('programming.v1.python-build');
      expect(definitions).not.toContain('programming.v1.rust-output');
    } finally {
      context.store.close();
      rmSync(context.dir, { recursive: true, force: true });
    }
  });

  it('imports local media and returns an Anki-ready audio token with dedupe', async () => {
    const context = createContext();
    const audioPath = join(context.dir, 'hello.mp3');
    writeFileSync(audioPath, Buffer.from('fake-audio-data'));

    try {
      const first = await context.mediaService.importMediaAsset({
        profileId: 'default',
        localPath: audioPath,
      });
      const second = await context.mediaService.importMediaAsset({
        profileId: 'default',
        localPath: audioPath,
      });

      expect(first.asset.mediaKind).toBe('audio');
      expect(first.asset.fieldValue).toMatch(/^\[sound:mcp-audio-/);
      expect(second.asset.storedFilename).toBe(first.asset.storedFilename);
      expect(second.asset.alreadyExisted).toBe(true);
    } finally {
      context.store.close();
      rmSync(context.dir, { recursive: true, force: true });
    }
  });
});
