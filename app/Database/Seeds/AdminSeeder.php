<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\Shield\Entities\User;

/**
 * Creates a default admin account for first-time setup.
 *
 * Used by `php spark shield:install` or run manually:
 *   php spark db:seed AdminSeeder
 *
 * Credentials (change immediately after first login):
 *   Email:    admin@example.com
 *   Password: changeme123
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $users = model(setting('Auth.userProvider'));

        // Avoid duplicate if run more than once
        $existing = $users->findByCredentials(['email' => 'admin@example.com']);

        if ($existing !== null) {
            $this->cli('Admin user already exists — skipping.');
            return;
        }

        $user = new User([
            'username' => 'admin',
            'email'    => 'admin@example.com',
            'password' => 'changeme123',
        ]);

        $users->save($user);

        $user = $users->findById($users->getInsertID());
        $user->activate();

        $user->addGroup('superadmin');

        $this->cli('Default admin account created:');
        $this->cli('  Email:    admin@example.com');
        $this->cli('  Password: changeme123');
        $this->cli('  Group:    superadmin');
        $this->cli('');
        $this->cli('⚠ Change the password immediately after first login!');
    }

    /**
     * Write to CLI if running from the command line.
     */
    private function cli(string $message): void
    {
        if (is_cli()) {
            \CodeIgniter\CLI\CLI::write($message);
        }
    }
}
