import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1667173100667 implements MigrationInterface {
  name = 'initial1667173100667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nfig_configs" ("app_name" character varying NOT NULL, "env_name" character varying NOT NULL, "config_key" character varying NOT NULL, "config_val" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a143f9b95f99d8aff2a90193d29" PRIMARY KEY ("app_name", "env_name", "config_key"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a143f9b95f99d8aff2a90193d2" ON "nfig_configs" ("app_name", "env_name", "config_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f930666048dac1980acfcda97c" ON "nfig_configs" ("app_name", "env_name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f930666048dac1980acfcda97c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a143f9b95f99d8aff2a90193d2"`,
    );
    await queryRunner.query(`DROP TABLE "nfig_configs"`);
  }
}
