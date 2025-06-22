import { MigrationInterface, QueryRunner } from "typeorm";

export class OrdersUniqueComposite1750555728191 implements MigrationInterface {
    name = 'OrdersUniqueComposite1750555728191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d05d2c110ca9f6aac9ea1e0ad0" ON "order" ("customerId", "promotionId", "productId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d05d2c110ca9f6aac9ea1e0ad0"`);
    }

}
