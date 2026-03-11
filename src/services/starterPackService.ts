import { AppError } from '../contracts/errors.js';
import { PACK_CATALOG_VERSION, SUPPORTED_PROGRAMMING_LANGUAGES, listStarterPacks, resolveStarterPack } from '../contracts/starterPacks.js';
import type { StarterPackManifest, StarterPackOperation, StarterPackSummary } from '../contracts/types.js';
import { CatalogService } from './catalogService.js';
import { NoteTypeService } from './noteTypeService.js';
import { resolveProfileId } from '../utils/profile.js';

type StarterPackServiceConfig = {
  activeProfileId?: string;
};

export class StarterPackService {
  constructor(
    private readonly noteTypeService: NoteTypeService,
    private readonly catalogService: CatalogService,
    private readonly config: StarterPackServiceConfig,
  ) {}

  async listStarterPacks(input: { profileId?: string }): Promise<{
    contractVersion: '1.0.0';
    profileId: string;
    packCatalogVersion: string;
    packs: StarterPackSummary[];
  }> {
    const profileId = resolveProfileId({
      providedProfileId: input.profileId,
      activeProfileId: this.config.activeProfileId,
      requireExplicitForWrite: false,
    });

    return {
      contractVersion: '1.0.0',
      profileId,
      packCatalogVersion: PACK_CATALOG_VERSION,
      packs: listStarterPacks(),
    };
  }

  getCatalogResourcePayload(profileId?: string) {
    return {
      contractVersion: '1.0.0',
      profileId: profileId ?? this.config.activeProfileId ?? 'default',
      packCatalogVersion: PACK_CATALOG_VERSION,
      packs: listStarterPacks(),
    };
  }

  async applyStarterPack(input: {
    profileId: string;
    packId: string;
    version?: string;
    dryRun?: boolean;
    options?: {
      deckRoot?: string;
      languages?: string[];
    };
  }): Promise<{
    contractVersion: '1.0.0';
    profileId: string;
    pack: StarterPackSummary;
    dryRun: boolean;
    result: {
      status: 'planned' | 'applied';
      deckRoots: string[];
      tagTemplates: Record<string, string[]>;
      operations: StarterPackOperation[];
    };
  }> {
    const profileId = resolveProfileId({
      providedProfileId: input.profileId,
      activeProfileId: this.config.activeProfileId,
      requireExplicitForWrite: true,
    });

    if (input.version && input.version !== PACK_CATALOG_VERSION) {
      throw new AppError('INVALID_ARGUMENT', `Unsupported starter pack version: ${input.version}`, {
        hint: `Use version ${PACK_CATALOG_VERSION}.`,
      });
    }

    this.assertOptions(input.packId, input.options);

    const manifest = resolveStarterPack(input.packId, input.options);
    if (!manifest) {
      throw new AppError('NOT_FOUND', `Unknown starter pack: ${input.packId}`);
    }

    const dryRun = input.dryRun ?? true;
    const operations: StarterPackOperation[] = [];

    for (const noteType of manifest.noteTypes) {
      const planned = await this.noteTypeService.upsertNoteType({
        profileId,
        modelName: noteType.modelName,
        fields: noteType.fields,
        templates: noteType.templates,
        css: noteType.css,
        isCloze: noteType.isCloze,
        dryRun: true,
      });
      const status = this.classifyNoteTypeOperation(planned.result.operations);
      operations.push({ kind: 'note_type', id: noteType.modelName, status });

      if (!dryRun && status !== 'unchanged') {
        await this.noteTypeService.upsertNoteType({
          profileId,
          modelName: noteType.modelName,
          fields: noteType.fields,
          templates: noteType.templates,
          css: noteType.css,
          isCloze: noteType.isCloze,
          dryRun: false,
        });
      }
    }

    for (const cardType of manifest.cardTypes) {
      const status = this.catalogService.planCustomCardTypeDefinition(profileId, cardType);
      operations.push({ kind: 'card_type_definition', id: cardType.cardTypeId, status });
      if (!dryRun && status !== 'unchanged') {
        this.catalogService.upsertCustomCardTypeDefinition(profileId, cardType);
      }
    }

    for (const deckRoot of manifest.deckRoots) {
      operations.push({ kind: 'deck_root', id: deckRoot, status: 'unchanged' });
    }

    return {
      contractVersion: '1.0.0',
      profileId,
      pack: this.toSummary(manifest),
      dryRun,
      result: {
        status: dryRun ? 'planned' : 'applied',
        deckRoots: [...manifest.deckRoots],
        tagTemplates: Object.fromEntries(
          Object.entries(manifest.tagTemplates).map(([cardTypeId, tags]) => [cardTypeId, [...tags]]),
        ),
        operations,
      },
    };
  }

  private toSummary(manifest: StarterPackManifest): StarterPackSummary {
    return {
      packId: manifest.packId,
      label: manifest.label,
      version: manifest.version,
      domains: [...manifest.domains],
      supportedOptions: manifest.supportedOptions.map((option) => ({ ...option })),
    };
  }

  private classifyNoteTypeOperation(
    operations: Array<{ kind: string }>,
  ): 'create' | 'update' | 'unchanged' {
    if (operations.some((operation) => operation.kind === 'create_model')) {
      return 'create';
    }
    if (operations.length > 0) {
      return 'update';
    }
    return 'unchanged';
  }

  private assertOptions(
    packId: string,
    options?: {
      deckRoot?: string;
      languages?: string[];
    },
  ): void {
    if (!options) {
      return;
    }

    if (options.deckRoot !== undefined && options.deckRoot.trim().length === 0) {
      throw new AppError('INVALID_ARGUMENT', 'deckRoot must not be empty');
    }

    if (options.languages) {
      if (packId !== 'programming-core') {
        throw new AppError('INVALID_ARGUMENT', 'languages option is only valid for programming-core');
      }

      const invalid = options.languages.filter((language) => !SUPPORTED_PROGRAMMING_LANGUAGES.includes(language as any));
      if (invalid.length > 0) {
        throw new AppError('INVALID_ARGUMENT', `Unsupported programming languages: ${invalid.join(', ')}`, {
          hint: `Supported values: ${SUPPORTED_PROGRAMMING_LANGUAGES.join(', ')}`,
        });
      }
    }
  }
}
