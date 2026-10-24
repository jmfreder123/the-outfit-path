# Optional authenticator-app 2FA handoff

Status: implemented and mock-tested locally; not enrolled for any user and not enforced in the live database.

## Behavior

- A signed-in account with no verified TOTP factor can open its isolated wardrobe and optionally choose **Set up authenticator app** in Preferences.
- Enrollment begins only after that user clicks the setup button. The QR secret is displayed only in the open modal and is not written to wardrobe storage or logs.
- A verified factor changes the next required assurance level to `aal2`. On reload, sign-in, account switch, or password recovery, the app keeps the wardrobe hidden and the local account scope unloaded until the user verifies a current six-digit TOTP code.
- Removing a verified factor requires a current `aal2` session plus a second confirmation. The app refreshes the session afterward.
- There are no recovery codes in this implementation. A person who loses their authenticator signs out and contacts John M. Fredericks. Factor removal in the Supabase Dashboard is an account-recovery action that John must perform only after separately verifying the person's identity.

## Safe activation order

This order avoids locking users out before the challenge UI is available:

1. Keep the restrictive MFA migration unapplied while testing the local UI.
2. In the local app, a signed-in user opens **Preferences and data → Add an authenticator app (optional)**. Before setup, open an authenticator such as Google Authenticator, Microsoft Authenticator, or Authy; Apple Passwords also supports verification codes on current Apple systems. In that app, select **Add account** or **+**, then choose its built-in **Scan QR code** option—not the ordinary Camera app. The user—not an agent—then selects **Set up authenticator app**, scans the private QR, enters the current six-digit code, and enables the factor.
3. The user signs out and back in. Confirm that the wardrobe remains hidden at AAL1 and opens only after a current authenticator code. Also verify password recovery: new password first, then the enrolled factor.
4. Deploy the already-protected frontend and verify its production URL, headers, invite-only sign-in, recovery redirect, and MFA challenge. Do not apply the policy while an older frontend without the challenge UI is public.
5. John reviews and runs the migration below in Supabase SQL Editor. This is a live security-setting change and must be owner-performed.
6. Repeat controlled cloud tests: an enrolled account at AAL1 gets no rows, the same account at AAL2 can access only its own row, and an account with no verified factor still works at AAL1 but cannot reach another user's row.

If an enrolled person loses the authenticator, password recovery alone will not bypass the factor. John must independently verify the person's identity and remove the verified factor in the protected Supabase Dashboard. After removal, the optional-enforcement policy permits AAL1 again. The app does not offer or promise recovery codes.

## Required owner-run database step

The frontend gate is not a security boundary by itself. The current two-account isolation checks passed with labeled synthetic rows. After the protected frontend is deployed and its MFA challenge is verified, John must review and run `supabase/migrations/20261024202000_require_aal2_for_enrolled_users.sql` in the Supabase SQL Editor.

The migration adds one **restrictive** RLS policy. It preserves rows and existing per-user ownership policies. For an account with at least one verified MFA factor, database access requires the JWT `aal` claim to be `aal2`; accounts without a verified factor may use either `aal1` or `aal2`.

After running it, verify with controlled synthetic data:

1. An account with no factor can read/write only its own row at `aal1`.
2. An enrolled account at `aal1` cannot select, insert, or update its row.
3. The same enrolled account at `aal2` can read/write only its own row.
4. Neither account can select or update the other account's row.
5. An expired session returns to the invite-only sign-in gate without exposing browser or cloud wardrobe data.

Do not deploy the migration before the UI is available: doing so could lock an enrolled user out of cloud data without presenting a challenge screen.

References:

- https://supabase.com/docs/guides/auth/auth-mfa/totp
- https://supabase.com/docs/guides/auth/auth-mfa
- https://support.google.com/accounts/answer/1066447
- https://support.microsoft.com/en-us/authenticator/how-to-add-your-accounts-to-microsoft-authenticator
- https://help.twilio.com/articles/19753413823643
- https://support.apple.com/guide/iphone/automatically-fill-in-verification-codes-ipha6173c19f/ios
