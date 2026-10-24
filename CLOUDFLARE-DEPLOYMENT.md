# The Outfit Path — Cloudflare Pages deployment handoff

Status: production-shaped static files and tests prepared locally; not pushed, deployed, connected, or published
Intended domain: `theoutfitpath.com`
Registrar/DNS currently observed: GoDaddy
Hosting target: Cloudflare Pages free static hosting, to be created by the account owner

## Verified current state

- The protected local build is served from `docs/` with no build step. `docs/_headers` now prepares CSP, clickjacking, MIME-sniffing, referrer, permissions, and `pages.dev` no-index headers for Cloudflare Pages.
- `http://127.0.0.1:4173/` returned HTTP 200 and loaded the adults-only gate first.
- GitHub verified `jmfreder123/the-outfit-path` as a public repository with default branch `main`; remote `main` is commit `6b9e1198723c7314ca544d45bd3627e47e6e6de3`. The local `codex/supabase-wardrobe` branch is ahead of `main` and remains unpushed.
- GitHub's Pages API reports the legacy public site as **built**, HTTPS-enforced, sourced from `main:/docs`, with no custom domain: `https://jmfreder123.github.io/the-outfit-path/`. It does not contain the protected local beta and must not be invited or treated as production.
- The authenticated Cloudflare account is on the dashboard and shows three unrelated active Free-plan zones (`talentstickiness.com`, `.net`, and `.org`). `theoutfitpath.com` is not a Cloudflare zone. The Workers & Pages inventory did not finish rendering during read-only inspection, and no authoritative `*.pages.dev` hostname was verified. Therefore no Cloudflare DNS target is known yet.
- A fresh public DNS lookup on October 24, 2026 verified GoDaddy nameservers `ns63.domaincontrol.com` and `ns64.domaincontrol.com`; the apex resolves to parking addresses `15.197.148.33` and `3.33.130.190`; `www` is a CNAME to the apex.
- A fresh HTTPS check of `https://theoutfitpath.com/` failed during TLS SNI negotiation. No working site is published on the purchased domain.
- The signed-out local flow blocks wardrobe access after the 18+ gate and shows invite-only sign-in/account setup. Password recovery and optional TOTP enrollment/challenge are implemented. The user confirmed the full password-plus-authenticator sign-out/sign-in challenge works.
- Two-account browser and database isolation passed with labeled synthetic ASU and Gmail rows. Gmail's authenticated foreign-row SELECT and UPDATE probes returned zero rows. No real wardrobe data or photos were uploaded. The two synthetic rows remain because deletion was not authorized.
- The reviewed restrictive MFA migration remains unapplied. It must be applied and re-tested after the protected frontend is online and before external beta invitations.

## Required safety gates before external invitations

1. Deploy this protected branch to its Cloudflare `*.pages.dev` hostname and verify the headers, age gate, invite-only sign-in, password recovery, and TOTP challenge there.
2. Owner reviews and runs `supabase/migrations/20261024202000_require_aal2_for_enrolled_users.sql`; then verify enrolled AAL1 denial, enrolled AAL2 own-row access, unenrolled AAL1 own-row access, and cross-user denial.
3. Verify direct public `signUp()` is rejected while **Allow new users to sign up** remains off, plus reused/forwarded invite and uninvited sign-in behavior.
4. Approve and implement the cloud-copy and account deletion path, or keep real personal data out of the beta and retain the current explicit limitation.
5. Finish the privacy notice/legal/retention decisions; retain the 18+ self-attestation limitation and invite-only operator procedure.
6. Keep the old GitHub Pages URL out of invitations and remove or redirect it only through a separately approved repository/hosting change.

## Recommended Cloudflare Pages project — owner action

Cloudflare's Git integration is a persistent GitHub grant and the final **Save and Deploy** action publishes a site. John M. Fredericks must perform and review these account actions:

1. First publish only the reviewed branch `codex/supabase-wardrobe` to the existing public GitHub repository. This does **not** change `main`, and the verified legacy GitHub Pages source (`main:/docs`) will not auto-deploy from this branch push. The branch source will become publicly visible. Do not merge to `main` yet.
2. In Cloudflare **Workers & Pages**, create a Pages project and choose **Connect to Git**.
3. When GitHub asks for the persistent Cloudflare Workers & Pages installation, grant **Only select repositories → `jmfreder123/the-outfit-path`**.
4. Use project name `the-outfit-path` and production branch `codex/supabase-wardrobe`.
5. Framework preset: none. Build command: blank. Build output directory: `docs`. Root directory: repository root.
6. Add no environment variables, secrets, service-role credentials, or database password. The publishable browser key is already in the static client and RLS remains the data boundary.
7. Review the repository, branch, and output directory, then the owner selects **Save and Deploy**. This publishes the protected build to a public `*.pages.dev` hostname but does not invite anyone or expose a wardrobe without authentication.

The first successful deployment will provide the authoritative `<project>.pages.dev` hostname. Record that actual hostname before preparing DNS; do not invent it.

The branch push and **Save and Deploy** are external publishing actions. Neither has been performed. After the first deployment, record the exact hostname and complete the MFA backend verification before sending external invitations.

### Direct Upload fallback

A verified zip of the `docs/` contents can be uploaded through **Create application → Get started → Drag and drop your files** without granting GitHub access. Cloudflare documents that a Direct Upload project cannot later switch to Git integration, so Git integration is recommended for the upcoming visual iterations. The fallback archive is for deliberate manual deployment only.

Prepared fallback: `release/the-outfit-path-pages-bc5ad94.zip` (13 files, 131,896 uncompressed bytes). SHA-256: `ae2bb664fa7466a5f0c8ae2e1bb3d17a3e2a8c1f620818125fdd7b05f5f201f6`. The archive contains the contents of `docs/` at its root, including `_headers`; it contains no wardrobe backup, photo, database password, service-role key, session token, or private authentication credential. The public Supabase publishable key is intentionally present.

## Custom domain — owner action only after the Pages hostname exists

Cloudflare requires the custom domain to be associated from the Pages project's **Custom domains** screen before a DNS record alone will work.

For the apex `theoutfitpath.com`, Cloudflare's current Pages documentation requires adding the domain as a Cloudflare zone and pointing the registrar nameservers to the exact nameservers Cloudflare assigns. Those assigned values do not exist yet. Do not change the current GoDaddy nameservers until Cloudflare shows the zone and both exact assigned nameservers.

If John M. Fredericks first wants only `www.theoutfitpath.com` while leaving GoDaddy DNS authoritative, Cloudflare documents a CNAME from `www` to the real `<project>.pages.dev` hostname, but only after adding `www.theoutfitpath.com` in the Pages **Custom domains** screen. The existing `www` CNAME would then need an approved replacement. Do not change the parked apex, nameservers, email-related records, DMARC, or unrelated records as part of that step.

After TLS and the chosen production origin are verified:

1. Set Supabase **Authentication → URL Configuration → Site URL** to `https://theoutfitpath.com/` and add the exact same HTTPS origin under Redirect URLs. Keep `http://127.0.0.1:4173/` only if local development invitations/recovery must continue. This is an owner-performed account-setting change.
2. Re-run invitation, recovery, cross-user isolation, age-gate, CSP, and mobile checks on the real origin.
3. Export a local wardrobe backup before changing origins because `localStorage` and IndexedDB do not move between origins.
4. Import only the intended backup on the new origin; photos remain device-local unless included in the user's exported backup.

## References

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages GitHub permissions](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Cloudflare Pages Free-plan limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
