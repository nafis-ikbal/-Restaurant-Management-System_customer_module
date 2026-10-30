#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8ed5c04e77481531d69e72df16e00c8ec4d48468c3dd66f245585941c430fd0e/contract';
import endContract from '../../snapshots/8ed5c04e77481531d69e72df16e00c8ec4d48468c3dd66f245585941c430fd0e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/993bd5adaae04745aa3f28254fba1c86e3c13cd3621c09888ff2d90ab87fbf8d/contract';
import startContract from '../../snapshots/993bd5adaae04745aa3f28254fba1c86e3c13cd3621c09888ff2d90ab87fbf8d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'category',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'conversation',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'menuItem',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'order',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'payment',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'reservation',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'restaurantTable',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
      this.setDefault({
        schema: 'public',
        table: 'user',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
