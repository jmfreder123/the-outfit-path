# The Outfit Path — Invite-only beta runbook

- Status (2026-10-26): live at theoutfitpath.com; public signup disabled and verified; invitations go out through Resend from jack@mail.theoutfitpath.com and were verified end to end
- Owner/inviter: John M. Fredericks ("Jack Fredericks" in emails)
- Eligibility: adults age 18 and over only

## Current state and steps (2026-10-26)

This section replaces the older notes below where they differ.

- The current build is live at https://theoutfitpath.com (Cloudflare Pages, production branch `codex/supabase-wardrobe`). DNS for theoutfitpath.com is on Cloudflare.
- Supabase Authentication, URL Configuration: Site URL `https://theoutfitpath.com`; Redirect URLs `https://theoutfitpath.com/` and `http://127.0.0.1:4173/` (local testing). Changed by Claude with John's approval on 2026-10-26 and confirmed after a reload.
- Public signup is off. A direct sign-up attempt on 2026-10-26 was refused with `signup_disabled`.

### Email setup (done 2026-10-26)

- Provider: Resend, free plan (3,000 emails a month, 100 a day). Account owned by John.
- Sending domain: `mail.theoutfitpath.com`, verified in Resend. Using a subdomain keeps the main domain free for other email later.
- DNS records in Cloudflare, all DNS only (not proxied), added by Claude with John's approval:
  - TXT `resend._domainkey.mail` (DKIM key from Resend)
  - CNAME `rsend.mail` to `rsend.forge.rmta.net`
  - CNAME `send.mail` to `send.forge.rmta.net`
- Click and open tracking are off.
- Resend API key "Supabase SMTP", sending access only. John created it and pasted it into Supabase himself. It is not stored in chat, notes or code.
- Supabase Authentication, Emails, SMTP Settings: custom SMTP on; sender `jack@mail.theoutfitpath.com`, sender name `Jack Fredericks`, host `smtp.resend.com`, port `465`, username `resend`, password the API key.
- Replies to jack@mail.theoutfitpath.com are not received; email receiving is not set up.
- Every email Resend sends is listed under Resend, Emails, with its subject, delivery status and contents.

### Invitation email (saved in Supabase, Authentication, Emails, Invite user)

Subject:

    You're invited to The Outfit Path beta

Body:

    <h2>You're invited to The Outfit Path</h2>
    <p>Jack Fredericks has invited you to try The Outfit Path, a private app for planning outfits from the clothes you own. It is a small, invite-only beta for adults 18 and over.</p>
    <p><a href="{{ .ConfirmationURL }}">Accept the invitation</a></p>
    <p>The link opens theoutfitpath.com, where you confirm you are 18 or older and choose a password. It is for you only, so please don't forward this email.</p>
    <p>If you weren't expecting this invitation, you can ignore this email.</p>

Saved by Claude on 2026-10-26 and confirmed after a reload. After changing the template, wait a few minutes before inviting anyone: an invitation sent one minute after the save still used Supabase's default wording ("You've been invited").

### Verified on 2026-10-26

- Test invitation to jack@thefeedsackmag.com: delivered with the new subject and wording, from "Jack Fredericks" <jack@mail.theoutfitpath.com>. Supabase shows the account confirmed and signed in at 1:02 PM, through the live site.
- Invitation to kealie.walker@gmail.com: first sent at 1:00 PM with the default wording, before the template change took effect. Re-sent with John's approval; Resend shows the second one delivered with the new subject. The link in the first email no longer works.

### Inviting a tester

1. Confirm directly with the person that they are 18 or older.
2. Supabase, Authentication, Users, Add user, Send invitation. Enter only their email and choose Invite user.
3. Check Resend, Emails: the message should show Delivered with the subject "You're invited to The Outfit Path beta".
4. They open the link, confirm 18+, see "Finish setting up your account", set a password of at least 12 characters, and land in an empty closet with the introduction.

### Re-sending an invitation

If someone hasn't accepted yet (Supabase, Users, their row shows no "Confirmed at"), repeat step 2 above with the same email. Supabase sends a new invitation and the link in the earlier email stops working. Supabase refuses this for accounts that are already confirmed; those people use Forgot password on the sign-in screen instead.

## Verified live state

On 2026-10-24, John M. Fredericks disabled **Allow new users to sign up**. A read-only verification after reload showed that it remained off, **Confirm email** remained on, and **Allow anonymous sign-ins** remained off. Email was the only enabled Auth provider and the other listed OAuth providers were disabled. The backend is now configured to reject public self-signup, subject to the required direct API test before beta data is used.

The first approved invitation, to the sole organization team member, produced a confirmed Auth user and recorded sign-in. The second approved invitation, to another owner-controlled test address, created a pending Auth user, but no email was delivered and the account remained unconfirmed with no sign-in. Its `/invite` Auth log returned HTTP 200 and recorded `user_invited`; there was no user-associated error log. The `wardrobe_documents` table still had 0 records.

The Dashboard's **Authentication → Users → Add user** menu visibly offered **Send invitation** and **Create new user**. Supabase's official documentation says disabling **Allow new users to sign up** prevents new public signups while existing users can sign in, and that invitations can be sent from **Authentication → Users → Add user → Send invitation**.

## Completed owner-only setting checkpoint

John M. Fredericks performed these account-setting actions, and the coding review verified the result without changing it:

1. Open [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/gueyttgdmmcgfqtjsdvf/auth/providers).
2. Turn **Allow new users to sign up** off. **Verified off after reload.**
3. Keep **Allow anonymous sign-ins** off and **Confirm email** on. **Verified.**
4. Click **Save changes**. **Completed by John M. Fredericks.**
5. Reload the page and verify **Allow new users to sign up** remains off. **Verified.**

This is the required backend control. Removing the app's signup button alone does not prevent direct calls to Supabase Auth.

## Before sending any invitation

- For the local invitation test, the verified loopback origin is `http://127.0.0.1:4173/`. On 2026-10-24, John M. Fredericks changed Supabase **Authentication → URL Configuration** to use that exact Site URL and added the same Redirect URL. A read-only verification after reload confirmed both values persisted.
- No production hosting target is currently verified. Before production invitations, replace the local callback with the verified HTTPS production origin only after Cloudflare Pages and the custom domain are active. Do not guess the production redirect before that target exists.
- Confirm directly with the prospective tester that they are age 18 or older. Record no date of birth or identity document for this preview. This is operator procedure, not technical age verification.
- The default Supabase invitation template was reviewed and uses `{{ .ConfirmationURL }}` for its acceptance link. The invitation redirect must still be allowlisted as described above.
- Custom SMTP is currently disabled. Supabase's default SMTP is limited to organization team-member email addresses, and the organization has one member: `jfredericks4@gmail.com`. Supabase's current SMTP documentation says outside addresses are refused with `email_address_not_authorized`; this explains why the team address received its invitation but the ASU address did not.
- Do not use **Create new user**, share a service-role/secret key, or build an admin client into the browser.

## Sending an approved invitation

After the prerequisite checks:

1. Open [Authentication → Users](https://supabase.com/dashboard/project/gueyttgdmmcgfqtjsdvf/auth/users).
2. Select **Add user → Send invitation**.
3. Enter only the approved adult tester's email.
4. Review the recipient and redirect target, then select **Invite user**. This sends an external email and must be done intentionally by John M. Fredericks.
5. The tester should open the link, affirm 18+ in the app, set a password of at least 12 characters, and sign in. The invitation link should not be shared.

Supabase documents Dashboard invitations as an admin action. The alternative Admin API requires a secret key in a trusted server environment; it must never be placed in this static frontend. For this small beta, the Dashboard flow avoids an unnecessary admin backend.

## Pending ASU test-account decision

Do not resend the ASU invitation, add the ASU address to the Supabase organization, or configure SMTP without a separate owner decision. The simplest free Dashboard-supported isolation-test alternative is:

1. John M. Fredericks approves deletion of the unused, unconfirmed ASU Auth record. It owns no wardrobe row.
2. John M. Fredericks deletes only that pending record in **Authentication → Users**.
3. John M. Fredericks uses **Add user → Create new user**, privately enters the ASU email and a unique test password, and leaves **Auto confirm user** checked. Supabase states in this form that no confirmation email is sent.

This is a test-only operator action, not public signup. Deletion and recreation are account changes and must be performed by John M. Fredericks. Do not place the password in chat, source code, or a test report. The production invitation path still requires a reviewed custom SMTP provider before inviting non-team users.

## Required verification before beta data

The browser flow is now: 18+ self-attestation first; then a blocking invite-only sign-in screen. A valid invite/recovery callback shows password setup before wardrobe access. Existing verified sessions proceed to their isolated wardrobe after the age gate. Signed-out and expired sessions cannot view the preserved guest wardrobe.

The sign-in screen now includes **Forgot password?**. The user enters the invited account email and explicitly selects **Email password-reset link**. The app always gives a generic response, so it does not reveal whether an account exists. A valid recovery link returns to the approved origin and requires a new password of at least 12 characters before access; an enrolled authenticator still requires its second factor afterward. For the current local test, use `http://127.0.0.1:4173/`, not `localhost`. No recovery request was sent during implementation. The default mail service may deliver to the organization-member address `jfredericks4@gmail.com`; production invitations/recovery for other addresses still require reviewed custom SMTP.

Optional authenticator-app MFA is implemented locally but is not yet live-enforced. The frontend blocks an enrolled AAL1 session, but the database must also enforce AAL2. After the frontend is deployed and two-account isolation passes, John reviews and runs `supabase/migrations/20261024202000_require_aal2_for_enrolled_users.sql`. See `MFA-2FA-HANDOFF.md`. No factor was enrolled, removed, or recovered during implementation.

The original account-delivery blocker is resolved. The current results and remaining checks are:

1. **Uninvited public signup:** direct `signUp` against the public Auth endpoint must fail after public signup is disabled.
2. **Approved invite:** one invited adult can complete the link/password flow and sign in.
3. **Reused or forwarded invite:** reuse/forward behavior is observed and rejected or handled safely; do not assume one-time behavior without the test.
4. **Two-account isolation:** passed for the current schema on October 24, 2026. ASU and Gmail each wrote/read a distinct labeled synthetic row; Gmail's authenticated foreign-row SELECT and UPDATE probes returned zero rows. Repeat after applying the restrictive MFA policy.
5. **Uninvited sign-in:** an unknown email/password cannot create or enter an account.
6. **Age paths:** decline loads no app/auth/cloud scripts; accept remains explicitly labeled self-attestation.
7. **Redirect safety:** invitation and recovery links return only to the approved beta origin.

Remove test users/data only through an approved cleanup procedure. Account/cloud deletion remains a launch blocker.

## Official Supabase references

- [General Auth configuration](https://supabase.com/docs/guides/auth/general-configuration)
- [Dashboard user invitations](https://supabase.com/docs/guides/auth/users#inviting-users)
- [Custom SMTP and default-mail restrictions](https://supabase.com/docs/guides/auth/auth-smtp)
- [Auth error codes](https://supabase.com/docs/guides/auth/debugging/error-codes)
- [Admin API overview and secret-key warning](https://supabase.com/docs/reference/javascript/admin-api)
