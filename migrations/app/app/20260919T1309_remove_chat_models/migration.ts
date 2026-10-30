#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/16e755d1c401855614096246fb27648728754a694348766052eb8e90e19fa809/contract';
import endContract from '../../snapshots/16e755d1c401855614096246fb27648728754a694348766052eb8e90e19fa809/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8ed5c04e77481531d69e72df16e00c8ec4d48468c3dd66f245585941c430fd0e/contract';
import startContract from '../../snapshots/8ed5c04e77481531d69e72df16e00c8ec4d48468c3dd66f245585941c430fd0e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'message' }),
      this.dropTable({ schema: 'public', table: 'conversationParticipant' }),
      this.dropTable({ schema: 'public', table: 'conversation' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
