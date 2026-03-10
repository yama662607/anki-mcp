import { AppError } from '../contracts/errors.js';
import { CARD_TYPES, CATALOG_VERSION, findCardType } from '../contracts/catalog.js';
import type { CardTypeDefinition, CardTypeSummary, CustomCardTypeDefinition, ValidationIssue } from '../contracts/types.js';
import { DraftStore } from '../persistence/draftStore.js';
import { normalizeTags, sortRecord } from '../utils/canonical.js';
import { sanitizeByPolicy } from '../utils/sanitize.js';

export type ValidateFieldsInput = {
  profileId: string;
  cardTypeId: string;
  fields: Record<string, string>;
  tags?: string[];
  deckName?: string;
};

export type ValidateFieldsOutput = {
  valid: boolean;
  normalized: {
    fields: Record<string, string>;
    tags: string[];
    deckName: string;
  };
  sanitization: {
    policyByField: Record<string, 'plain_text_only' | 'safe_inline_html' | 'trusted_html'>;
    modifiedFields: string[];
  };
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export class CatalogService {
  constructor(private readonly store: DraftStore) {}

  listCardTypes(profileId: string): { catalogVersion: string; cardTypes: CardTypeSummary[] } {
    const builtins = CARD_TYPES.map((cardType) => this.toSummary(cardType));
    const customs = this.store.listCardTypeDefinitions(profileId).map((cardType) => this.toSummary(cardType));
    return {
      catalogVersion: CATALOG_VERSION,
      cardTypes: [...builtins, ...customs],
    };
  }

  getCardTypeSchema(profileId: string, cardTypeId: string) {
    const cardType = this.requireCardType(profileId, cardTypeId, { allowDeprecated: true });
    return {
      catalogVersion: CATALOG_VERSION,
      cardType: this.toSummary(cardType),
      fields: cardType.fields,
    };
  }

  getCardTypeDefinition(profileId: string, cardTypeId: string, options?: { allowDeprecated?: boolean }): CardTypeDefinition {
    return this.requireCardType(profileId, cardTypeId, options);
  }

  getCardTypeSummary(profileId: string, cardTypeId: string, options?: { allowDeprecated?: boolean }): CardTypeSummary {
    return this.toSummary(this.requireCardType(profileId, cardTypeId, options));
  }

  listCardTypeDefinitions(
    profileId: string,
    options?: { includeDeprecated?: boolean },
  ): { items: CustomCardTypeDefinition[] } {
    return {
      items: this.store.listCardTypeDefinitions(profileId, options),
    };
  }

  deprecateCardTypeDefinition(profileId: string, cardTypeId: string): { cardType: CustomCardTypeDefinition } {
    if (findCardType(cardTypeId)) {
      throw new AppError('FORBIDDEN_OPERATION', `Builtin cardTypeId cannot be deprecated: ${cardTypeId}`);
    }

    return {
      cardType: this.store.deprecateCardTypeDefinition(profileId, cardTypeId, new Date().toISOString()),
    };
  }

  validateFields(input: ValidateFieldsInput): ValidateFieldsOutput {
    const cardType = this.requireCardType(input.profileId, input.cardTypeId);
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const knownFields = new Set(cardType.fields.map((field) => field.name));
    const providedFieldNames = Object.keys(input.fields);

    for (const requiredField of cardType.requiredFields) {
      if (!input.fields[requiredField] || input.fields[requiredField].trim().length === 0) {
        errors.push({
          code: 'REQUIRED_FIELD_MISSING',
          field: requiredField,
          message: `Required field is missing: ${requiredField}`,
        });
      }
    }

    for (const fieldName of providedFieldNames) {
      if (!knownFields.has(fieldName)) {
        errors.push({
          code: 'UNKNOWN_FIELD',
          field: fieldName,
          message: `Unknown field for card type: ${fieldName}`,
        });
      }
    }

    const normalizedFields: Record<string, string> = {};
    const policyByField: Record<string, 'plain_text_only' | 'safe_inline_html' | 'trusted_html'> = {};
    const modifiedFields: string[] = [];

    for (const schema of cardType.fields) {
      const hasField = Object.prototype.hasOwnProperty.call(input.fields, schema.name);
      if (!hasField && !schema.required) {
        continue;
      }

      const raw = input.fields[schema.name] ?? '';
      const sanitized = sanitizeByPolicy(raw, schema.allowedHtmlPolicy);
      normalizedFields[schema.name] = sanitized.value;
      policyByField[schema.name] = schema.allowedHtmlPolicy;

      if (sanitized.modified) {
        modifiedFields.push(schema.name);
      }

      if (schema.minLength !== undefined && sanitized.value.length < schema.minLength && raw.trim().length > 0) {
        errors.push({
          code: 'FIELD_TOO_SHORT',
          field: schema.name,
          message: `Field ${schema.name} must be at least ${schema.minLength} characters`,
        });
      }

      if (schema.maxLength !== undefined && sanitized.value.length > schema.maxLength) {
        warnings.push({
          code: 'FIELD_TOO_LONG',
          field: schema.name,
          message: `Field ${schema.name} is long (${sanitized.value.length})`,
          hint: `Recommended maximum is ${schema.maxLength}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      normalized: {
        fields: sortRecord(normalizedFields),
        tags: normalizeTags(input.tags ?? []),
        deckName: input.deckName ?? cardType.defaultDeck,
      },
      sanitization: {
        policyByField,
        modifiedFields: modifiedFields.sort((a, b) => a.localeCompare(b)),
      },
      errors,
      warnings,
    };
  }

  upsertCustomCardTypeDefinition(profileId: string, definition: CardTypeDefinition) {
    if (findCardType(definition.cardTypeId)) {
      throw new AppError('CONFLICT', `Builtin cardTypeId cannot be overridden: ${definition.cardTypeId}`, {
        hint: 'Choose a new custom cardTypeId instead of shadowing builtin behavior.',
      });
    }

    this.assertDefinition(definition);
    const updatedAt = new Date().toISOString();
    return this.store.upsertCardTypeDefinition(profileId, {
      ...definition,
      source: 'custom',
    }, updatedAt);
  }

  private requireCardType(
    profileId: string,
    cardTypeId: string,
    options?: { allowDeprecated?: boolean },
  ): CardTypeDefinition {
    const custom = this.store.getCardTypeDefinition(profileId, cardTypeId, {
      includeDeprecated: true,
    });
    if (custom) {
      if (custom.status === 'deprecated' && !options?.allowDeprecated) {
        throw new AppError('CONFLICT', `Custom cardTypeId is deprecated: ${cardTypeId}`, {
          hint: 'Use an active card type definition or reactivate this one with upsert_card_type_definition.',
          context: { cardTypeId, status: custom.status, deprecatedAt: custom.deprecatedAt },
        });
      }
      return custom;
    }

    const builtin = findCardType(cardTypeId);
    if (builtin) {
      return builtin;
    }

    throw new AppError('NOT_FOUND', `Unknown cardTypeId: ${cardTypeId}`);
  }

  private toSummary(cardType: CardTypeDefinition): CardTypeSummary {
    return {
      cardTypeId: cardType.cardTypeId,
      label: cardType.label,
      modelName: cardType.modelName,
      defaultDeck: cardType.defaultDeck,
      requiredFields: cardType.requiredFields,
      renderIntent: cardType.renderIntent,
      allowedHtmlPolicy: cardType.allowedHtmlPolicy,
      source: cardType.source,
    };
  }

  private assertDefinition(definition: CardTypeDefinition): void {
    const fieldNames = definition.fields.map((field) => field.name);
    const allFieldNames = new Set(fieldNames);

    if (fieldNames.length !== allFieldNames.size) {
      throw new AppError('INVALID_ARGUMENT', 'Card type definition contains duplicate field names');
    }

    for (const requiredField of definition.requiredFields) {
      if (!allFieldNames.has(requiredField)) {
        throw new AppError('INVALID_ARGUMENT', `requiredFields references unknown field: ${requiredField}`);
      }
    }

    for (const optionalField of definition.optionalFields) {
      if (!allFieldNames.has(optionalField)) {
        throw new AppError('INVALID_ARGUMENT', `optionalFields references unknown field: ${optionalField}`);
      }
    }
  }
}
