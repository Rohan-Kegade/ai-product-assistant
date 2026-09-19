/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitSchema1789807115588 {
    name = 'InitSchema1789807115588'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`asin\` varchar(20) NULL, \`url\` varchar(2048) NULL, \`title\` varchar(1024) NULL, \`price\` varchar(64) NULL, \`rating\` varchar(64) NULL, \`review_count\` varchar(64) NULL, \`bought_last_month\` varchar(64) NULL, \`color\` varchar(128) NULL, \`size\` varchar(128) NULL, \`about\` text NULL, \`review_summary\` text NULL, \`offers\` json NULL, \`product_details\` json NULL, \`tech_details\` json NULL, \`scraped_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_133d88f4cd269ade8dc392132f\` (\`asin\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversation_products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conversation_id\` varchar(36) NOT NULL, \`product_id\` int NOT NULL, \`added_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`UQ_conversation_product\` (\`conversation_id\`, \`product_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conversation_id\` varchar(36) NOT NULL, \`role\` enum ('user', 'assistant') NOT NULL, \`content\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`conversation_products\` ADD CONSTRAINT \`FK_0339fdaac66d614e5e8251291a9\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_products\` ADD CONSTRAINT \`FK_3a8eb1e75f3b3d6f604e2ed10c5\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_3bc55a7c3f9ed54b520bb5cfe23\` FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_3bc55a7c3f9ed54b520bb5cfe23\``);
        await queryRunner.query(`ALTER TABLE \`conversation_products\` DROP FOREIGN KEY \`FK_3a8eb1e75f3b3d6f604e2ed10c5\``);
        await queryRunner.query(`ALTER TABLE \`conversation_products\` DROP FOREIGN KEY \`FK_0339fdaac66d614e5e8251291a9\``);
        await queryRunner.query(`DROP TABLE \`messages\``);
        await queryRunner.query(`DROP INDEX \`UQ_conversation_product\` ON \`conversation_products\``);
        await queryRunner.query(`DROP TABLE \`conversation_products\``);
        await queryRunner.query(`DROP INDEX \`IDX_133d88f4cd269ade8dc392132f\` ON \`products\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
    }
}
