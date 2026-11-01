# Local authentication logic

The login and signup screens work without a backend by using the browser's
`localStorage` as a small local account store.

## Flow

1. On first use, the auth provider creates a default demo administrator:
   `admin@mediavault.local` / `Admin123!`.
2. Accounts are stored under `mediavault_users`. Each account has an id, name,
   normalized email, password, and role.
3. Signup validates the name and an eight-character minimum password, rejects
   duplicate emails, creates a `User` account, and signs that account in.
4. Login matches the email and password against the stored accounts. The User
   and Admin modes also verify the account role so an account cannot enter the
   wrong area.
5. The signed-in account id is stored under `mediavault_session`. When the app
   opens again, the provider restores that session from the local account store.
6. Sign out removes only the current session, so registered accounts remain
   available for the next login.
7. “Reset Application Data” in Settings clears localStorage, which removes all
   local accounts and recreates the default admin on the next auth operation.

This is intentionally a frontend demo implementation. Passwords are stored in
localStorage as plain text, so it must not be used for production or real user
data. A production version should replace this provider with a server-side
authentication API, hashed passwords, secure cookies or tokens, and server-side
authorization.
