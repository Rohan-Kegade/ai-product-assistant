/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddUsers1793000000000 {
    name = 'AddUsers1793000000000'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(60) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_3a9ae579e61e81cc0e989afeb4a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_3a9ae579e61e81cc0e989afeb4a\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
