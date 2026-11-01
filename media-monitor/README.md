# Signal Desk — media-monitoring prototype

A self-contained, browser-based workflow for collecting, classifying, verifying and reporting client media coverage. It is an isolated prototype in this repository; it does not change REA's reverse-engineering CLI or MCP capabilities.

## Run it

From the repository root:

```sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory media-monitor
```

Open `http://localhost:4173`. No package installation or build step is required. Browser workspace data is saved to local storage. Use **Clients & outlets → Export workspace** to download a JSON export; the prototype does not yet import a saved export.

Run the formula and workflow-guard tests with:

```sh
node --test media-monitor/core.test.mjs
```

## Workflow covered

1. Maintain client contacts, fallback key terms, exact press-release titles, daily or magazine monitoring type, and the designated media list.
2. Search the exact press-release title on Google and Bing. Start a fresh monitoring run for each reporting period. If there is no result, switch to the client name plus key terms. Site-scoped links and direct outlet links are provided for each configured outlet.
3. Start with a rolling 24-hour window. A daily search can extend to 72 hours only after the Google, Bing and every outlet check is logged with no coverage. Magazine releases use a 30-day window.
4. Log coverage per client with title, date, outlet, URL, screenshot, tone, online or print measurement, and optional word count. Negative items are highlighted.
5. Calculate RAVE exactly as requested: online measurement in cm × 6 × 95; print measurement in cm × columns × 115.
6. Prepare a first-verification email draft. Executive reviewers can approve references or request corrections.
7. Block final report compilation until all references are executive-verified and required report details—including screenshots—are present. The final report separates positive/neutral references from a highlighted negative section.
8. Route the compiled report to the executive for final approval. Only the Monitoring Head role can prepare client delivery after approval. Download a print-ready HTML report, then send it through the team's approved email channel.

## Important limits

This is a local, human-in-the-loop prototype, not a production media-monitoring service. It does **not** scrape websites, retrieve Google or Bing results, classify tone automatically, authenticate users, provide server-side role permissions, or send emails. Search links open external sites and send the query terms to those providers; operators run the searches, verify time filters (especially on Bing), log each checked source and record tone/measurements. Email actions create drafts and ask the user to confirm external sending.

The default list contains the 25 outlets named in the brief; use **Clients & outlets** to add any remaining designated sites. All seeded clients, articles, URLs and approval states are fictional examples. Replace them before creating a real report.

Data and compressed screenshots stay in this browser profile. Browser storage quotas vary, so export backups regularly. Local storage is not encrypted or shared with other users. Do not enter real client or personal information in the prototype unless the device and browser profile are approved for that data. The role switcher is a workflow demonstration, not an access-control boundary.
