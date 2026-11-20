<?php

namespace App\Services;

use App\Exceptions\Auth\AccountDeactivatedException;
use App\Exceptions\Auth\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Authenticate credentials and issue Sanctum token.
     *
     * @param  array{email: string, password: string}  $credentials
     * @return array{token: string, user: User}
     *
     * @throws InvalidCredentialsException
     * @throws AccountDeactivatedException
     */
    public function login(array $credentials, string $deviceName = 'api'): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new InvalidCredentialsException;
        }

        if (! $user->is_active) {
            throw new AccountDeactivatedException;
        }

        $token = $user->createToken($deviceName)->plainTextToken;

        return [
            'token' => $token,
            'user' => $user->loadMissing(['employee.department', 'employee.designation']),
        ];
    }

    /**
     * Revoke current access token for authenticated user.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Retrieve current authenticated user with profile relations.
     */
    public function me(User $user): User
    {
        return $user->loadMissing([
            'employee.department',
            'employee.designation',
            'employee.manager',
        ]);
    }
}

