import { MigrationInterface, QueryRunner } from "typeorm";

export class OrdersNewIndexes1750579933469 implements MigrationInterface {
    name = 'OrdersNewIndexes1750579933469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_124456e637cca7a415897dce65" ON "order" ("customerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_88991860e839c6153a7ec878d3" ON "order" ("productId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_88991860e839c6153a7ec878d3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_124456e637cca7a415897dce65"`);
    }

}
