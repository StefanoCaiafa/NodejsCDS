import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1739572800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        movieId INTEGER NOT NULL,
        title TEXT NOT NULL,
        overview TEXT,
        posterPath TEXT,
        releaseDate TEXT,
        voteAverage REAL,
        movieData TEXT NOT NULL,
        addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE (userId, movieId)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        userId INTEGER NOT NULL,
        expiresAt DATETIME NOT NULL,
        blacklistedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId)');
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_favorites_movieId ON favorites(movieId)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_token_blacklist_expiresAt ON token_blacklist(expiresAt)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_token_blacklist_expiresAt');
    await queryRunner.query('DROP INDEX IF EXISTS idx_token_blacklist_token');
    await queryRunner.query('DROP INDEX IF EXISTS idx_favorites_movieId');
    await queryRunner.query('DROP INDEX IF EXISTS idx_favorites_userId');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_email');

    await queryRunner.query('DROP TABLE IF EXISTS token_blacklist');
    await queryRunner.query('DROP TABLE IF EXISTS favorites');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
