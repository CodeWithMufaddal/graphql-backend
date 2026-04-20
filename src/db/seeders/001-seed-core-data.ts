import bcrypt from 'bcryptjs';
import type { QueryInterface } from 'sequelize';

async function resetSequence(queryInterface: QueryInterface, tableName: string) {
  await queryInterface.sequelize.query(`
    SELECT setval(
      pg_get_serial_sequence('"${tableName}"', 'id'),
      COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
      true
    );
  `);
}

export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  const now = new Date();
  const passwordHash = await bcrypt.hash('password123', 10);

  await queryInterface.bulkInsert('users', [
    {
      id: 1,
      name: 'Owner',
      username: 'owner',
      email: 'owner@localhost.dev',
      phone: '+91 90000 11111',
      website: 'owner.local',
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: 'Maya Singh',
      username: 'maya',
      email: 'maya@example.com',
      phone: '+91 90000 22222',
      website: 'maya.dev',
      password_hash: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: 'Arjun Rao',
      username: 'arjun',
      email: 'arjun@example.com',
      phone: '+91 90000 33333',
      website: 'arjun.dev',
      password_hash: null,
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('posts', [
    {
      id: 1,
      title: 'Shipping the first GraphQL draft',
      body: 'This seeded post helps the frontend start integrating immediately.',
      user_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      title: 'Seed data makes local dev faster',
      body: 'A small but realistic dataset keeps onboarding smooth and UI work unblocked.',
      user_id: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      title: 'Postgres on localhost is enough for phase one',
      body: 'We can harden infra and deployment later once the contract is stable.',
      user_id: 3,
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('comments', [
    {
      id: 1,
      name: 'Starter Feedback',
      email: 'feedback@example.com',
      body: 'This comment gives the comments field something real to render.',
      post_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: 'UI Note',
      email: 'ui@example.com',
      body: 'The frontend can now test nested post to comments rendering.',
      post_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: 'Schema Review',
      email: 'review@example.com',
      body: 'Pagination, auth, and seed data are ready for the next iteration.',
      post_id: 2,
      created_at: now,
      updated_at: now,
    },
  ]);

  await resetSequence(queryInterface, 'users');
  await resetSequence(queryInterface, 'posts');
  await resetSequence(queryInterface, 'comments');
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.bulkDelete('comments', {});
  await queryInterface.bulkDelete('posts', {});
  await queryInterface.bulkDelete('users', {});

  await resetSequence(queryInterface, 'users');
  await resetSequence(queryInterface, 'posts');
  await resetSequence(queryInterface, 'comments');
}

