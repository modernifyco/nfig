import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1667173142385 implements MigrationInterface {
  name = 'initial1667173142385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nfig_configs" ("app_name" varchar NOT NULL, "env_name" varchar NOT NULL, "config_key" varchar NOT NULL, "config_val" varchar, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), PRIMARY KEY ("app_name", "env_name", "config_key"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a143f9b95f99d8aff2a90193d2" ON "nfig_configs" ("app_name", "env_name", "config_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f930666048dac1980acfcda97c" ON "nfig_configs" ("app_name", "env_name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_f930666048dac1980acfcda97c"`);
    await queryRunner.query(`DROP INDEX "IDX_a143f9b95f99d8aff2a90193d2"`);
    await queryRunner.query(`DROP TABLE "nfig_configs"`);
  }
}
