import { describe, expect, it } from 'vitest';
import { resolveProfileId } from '../src/utils/profile.js';

describe('resolveProfileId', () => {
  it('prefers the explicit profile for reads and writes', () => {
    expect(
      resolveProfileId({
        providedProfileId: 'explicit',
        activeProfileId: 'active',
        requireExplicitForWrite: false,
      }),
    ).toBe('explicit');

    expect(
      resolveProfileId({
        providedProfileId: 'explicit',
        activeProfileId: 'active',
        requireExplicitForWrite: true,
      }),
    ).toBe('explicit');
  });

  it('uses active profile for reads when omitted', () => {
    expect(
      resolveProfileId({
        activeProfileId: 'active',
        requireExplicitForWrite: false,
      }),
    ).toBe('active');
  });

  it('rejects omitted write profile and missing active read profile', () => {
    expect(() =>
      resolveProfileId({
        activeProfileId: 'active',
        requireExplicitForWrite: true,
      }),
    ).toThrow(/profileId is required/);

    expect(() =>
      resolveProfileId({
        requireExplicitForWrite: false,
      }),
    ).toThrow(/Unable to resolve active profile/);
  });
});
