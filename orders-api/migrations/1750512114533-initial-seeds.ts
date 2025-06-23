import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSeeds1750512114533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert sample products and promotions
    await queryRunner.query(
      `INSERT INTO product (id, name)
        VALUES
          ('019792ae-89fe-7795-8740-7df8c228e633', 'Nice Shoes')`,
    );

    await queryRunner.query(
      `INSERT INTO inventory (id, quantity)
        VALUES
          ('019792ae-89fe-7795-8740-7df8c228e633', 10000)`,
    );

    await queryRunner.query(
      `INSERT INTO promotion (id, name)
        VALUES
          ('019792b0-a1fc-7aa0-864a-0416f4c6f07b', 'Black Friday Sale')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove items insert previously
    await queryRunner.query(
      `DELETE FROM product WHERE id IN ('019792ae-89fe-7795-8740-7df8c228e633')`,
    );

    await queryRunner.query(
      `DELETE FROM inventory WHERE id IN ('019792ae-89fe-7795-8740-7df8c228e633')`,
    );

    await queryRunner.query(
      `DELETE FROM promotion WHERE id IN ('019792b0-a1fc-7aa0-864a-0416f4c6f07b')`,
    );
  }
}
