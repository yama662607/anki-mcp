import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  cleanupStagedCardsInputSchema,
  commitStagedCardsBatchInputSchema,
  commitStagedCardInputSchema,
  createStagedCardsBatchInputSchema,
  createStagedCardInputSchema,
  deprecateCardTypeDefinitionInputSchema,
  getCardTypeSchemaInputSchema,
  getNoteTypeSchemaInputSchema,
  getStagedCardInputSchema,
  listCardTypeDefinitionsInputSchema,
  listCardTypesInputSchema,
  listNoteTypesInputSchema,
  listStagedCardsInputSchema,
  openStagedCardPreviewInputSchema,
  upsertCardTypeDefinitionInputSchema,
  upsertNoteTypeInputSchema,
  validateCardFieldsInputSchema,
  discardStagedCardsBatchInputSchema,
  discardStagedCardInputSchema,
} from '../contracts/schemas.js';
import { CatalogService } from '../services/catalogService.js';
import { DraftService } from '../services/draftService.js';
import { NoteTypeService } from '../services/noteTypeService.js';
import { getContractsResourcePayload } from './contractsResource.js';
import { errorResult, parseOrThrow, successResult } from './result.js';
import { resolveProfileId } from '../utils/profile.js';

export function registerMcpHandlers(server: McpServer, services: {
  catalogService: CatalogService;
  draftService: DraftService;
  noteTypeService: NoteTypeService;
}) {
  server.registerResource(
    'tool_contracts_v1',
    'anki://contracts/v1/tools',
    {
      title: 'Anki MCP v1 Tool Contracts',
      description: 'Frozen tool schemas and shared type registry for v1.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(getContractsResourcePayload(), null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    'card_type_catalog',
    'anki://catalog/card-types',
    {
      title: 'Anki Card Type Catalog',
      description: 'Stable catalog definitions for card creation.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(services.draftService.getCatalogResourcePayload(), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    'list_card_types',
    {
      title: 'List Card Types',
      description: 'Return stable card type catalog entries.',
      inputSchema: listCardTypesInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(listCardTypesInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: false,
        });
        const payload = {
          contractVersion: '1.0.0',
          profileId,
          ...services.catalogService.listCardTypes(profileId),
        };
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'list_card_type_definitions',
    {
      title: 'List Card Type Definitions',
      description: 'List profile-scoped custom card type definitions. Active only by default.',
      inputSchema: listCardTypeDefinitionsInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(listCardTypeDefinitionsInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: false,
        });
        return successResult({
          contractVersion: '1.0.0',
          profileId,
          ...services.catalogService.listCardTypeDefinitions(profileId, {
            includeDeprecated: args.includeDeprecated,
          }),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'deprecate_card_type_definition',
    {
      title: 'Deprecate Card Type Definition',
      description: 'Mark a custom card type definition as deprecated without deleting it.',
      inputSchema: deprecateCardTypeDefinitionInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(deprecateCardTypeDefinitionInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: true,
        });
        return successResult({
          contractVersion: '1.0.0',
          profileId,
          ...services.catalogService.deprecateCardTypeDefinition(profileId, args.cardTypeId),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'get_card_type_schema',
    {
      title: 'Get Card Type Schema',
      description: 'Read schema details for one card type.',
      inputSchema: getCardTypeSchemaInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(getCardTypeSchemaInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: false,
        });
        const payload = {
          contractVersion: '1.0.0',
          profileId,
          ...services.catalogService.getCardTypeSchema(profileId, args.cardTypeId),
        };
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'validate_card_fields',
    {
      title: 'Validate Card Fields',
      description: 'Validate and sanitize card field inputs before creation.',
      inputSchema: validateCardFieldsInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(validateCardFieldsInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: false,
        });
        const payload = {
          contractVersion: '1.0.0',
          profileId,
          ...services.catalogService.validateFields({ ...args, profileId }),
        };
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'list_note_types',
    {
      title: 'List Note Types',
      description: 'Return available Anki note types with field/template summaries.',
      inputSchema: listNoteTypesInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(listNoteTypesInputSchema, input);
        return successResult(await services.noteTypeService.listNoteTypes(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'get_note_type_schema',
    {
      title: 'Get Note Type Schema',
      description: 'Inspect fields, templates, CSS, and field bindings for one note type.',
      inputSchema: getNoteTypeSchemaInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(getNoteTypeSchemaInputSchema, input);
        return successResult(await services.noteTypeService.getNoteTypeSchema(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'upsert_note_type',
    {
      title: 'Upsert Note Type',
      description: 'Dry-run by default. Creates or updates a note type with additive-safe constraints.',
      inputSchema: upsertNoteTypeInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(upsertNoteTypeInputSchema, input);
        return successResult(await services.noteTypeService.upsertNoteType(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'upsert_card_type_definition',
    {
      title: 'Upsert Card Type Definition',
      description: 'Store a profile-scoped custom card type definition that maps onto an Anki note type.',
      inputSchema: upsertCardTypeDefinitionInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(upsertCardTypeDefinitionInputSchema, input);
        const profileId = resolveProfileId({
          providedProfileId: args.profileId,
          activeProfileId: process.env.ANKI_ACTIVE_PROFILE,
          requireExplicitForWrite: true,
        });
        const payload = {
          contractVersion: '1.0.0',
          profileId,
          cardType: services.catalogService.upsertCustomCardTypeDefinition(profileId, args.definition),
        };
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'create_staged_card',
    {
      title: 'Create Staged Card',
      description: 'Create a staged draft only (not committed). Requires profileId and clientRequestId.',
      inputSchema: createStagedCardInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(createStagedCardInputSchema, input);
        const payload = await services.draftService.createStagedCard(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'create_staged_cards_batch',
    {
      title: 'Create Staged Cards Batch',
      description: 'Create multiple staged drafts with per-item success and error reporting.',
      inputSchema: createStagedCardsBatchInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(createStagedCardsBatchInputSchema, input);
        return successResult(await services.draftService.createStagedCardsBatch(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'get_staged_card',
    {
      title: 'Get Staged Card',
      description: 'Read stored metadata and field contents for one draft.',
      inputSchema: getStagedCardInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(getStagedCardInputSchema, input);
        return successResult(await services.draftService.getStagedCard(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'open_staged_card_preview',
    {
      title: 'Open Staged Card Preview',
      description: 'Open Anki Browser for visual review of a staged draft before commit/discard.',
      inputSchema: openStagedCardPreviewInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(openStagedCardPreviewInputSchema, input);
        const payload = await services.draftService.openStagedCardPreview(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'commit_staged_card',
    {
      title: 'Commit Staged Card',
      description: 'Finalize a staged draft after explicit user approval and full reviewDecision=true checks.',
      inputSchema: commitStagedCardInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(commitStagedCardInputSchema, input);
        const payload = await services.draftService.commitStagedCard(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'commit_staged_cards_batch',
    {
      title: 'Commit Staged Cards Batch',
      description: 'Commit multiple drafts with per-item review decisions and outcomes.',
      inputSchema: commitStagedCardsBatchInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const args = parseOrThrow(commitStagedCardsBatchInputSchema, input);
        return successResult(await services.draftService.commitStagedCardsBatch(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'discard_staged_card',
    {
      title: 'Discard Staged Card',
      description: 'Discard staged/superseded draft and remove Anki note.',
      inputSchema: discardStagedCardInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(discardStagedCardInputSchema, input);
        const payload = await services.draftService.discardStagedCard(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'discard_staged_cards_batch',
    {
      title: 'Discard Staged Cards Batch',
      description: 'Discard multiple drafts with per-item success and idempotent already_discarded results.',
      inputSchema: discardStagedCardsBatchInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(discardStagedCardsBatchInputSchema, input);
        return successResult(await services.draftService.discardStagedCardsBatch(args));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'list_staged_cards',
    {
      title: 'List Staged Cards',
      description: 'List staged lifecycle records with cursor pagination.',
      inputSchema: listStagedCardsInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(listStagedCardsInputSchema, input);
        const payload = services.draftService.listStagedCards(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'cleanup_staged_cards',
    {
      title: 'Cleanup Staged Cards',
      description: 'Discard stale staged/superseded drafts older than threshold.',
      inputSchema: cleanupStagedCardsInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async (input) => {
      try {
        const args = parseOrThrow(cleanupStagedCardsInputSchema, input);
        const payload = await services.draftService.cleanupStagedCards(args);
        return successResult(payload);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
