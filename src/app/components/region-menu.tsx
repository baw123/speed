import { CheckIcon } from 'lucide-react';
import { RegionMenuClient } from './region-menu.client';
import type { Target } from '@/lib/targets';

/** A quiet text entry; the client menu only wires state. */
export function RegionMenu({ targets }: { targets: readonly Target[] }) {
  return (
    <RegionMenuClient
      targets={targets}
      checkSlot={<CheckIcon size={14} strokeWidth={2} aria-hidden />}
    />
  );
}
