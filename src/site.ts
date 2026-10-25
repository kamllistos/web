// ✏️ Edit this file to change what your website says.
export const site = {
  name: "Cam Toan Do",
  role: "Microsoft 365 Security & Governance Specialist",
  headline: "Security.\nMade simple.",
  tagline: "Microsoft 365 security and governance for small businesses — I find and fix the gaps in the tools you already pay for, in plain English.",
  email: "official@camtoan.me",

  // Studio/brand the site and its products live under.
  brand: {
    name: "Kamllistos",
    pronounce: "kam-LEES-tos",
    meaning:
      "A play on my name, Cam, and the Greek Κάλλιστος (kállistos) — “most excellent.” It's the banner the tools and products here live under.",
    product: "feature-lookup",
  },

  about: [
    "I'm a cybersecurity coordinator at a construction company by day. On the side, I offer practical, plain-English security help to people who don't have a security team.",
    "No scare tactics and no jargon: you get a clear list of what's wrong, why it matters, and how to fix it.",
  ],

  // Service packages shown on /services. Pricing in CAD.
  packages: [
    {
      id: "m365-health-check",
      name: "Microsoft 365 Security Health Check",
      tagline: "Find the gaps in the Microsoft 365 you already pay for.",
      forWho:
        "5–50 staff who have Microsoft 365 but nobody managing it — construction, accounting, engineering, property management and small manufacturers.",
      delivers: [
        { title: "Identity review", items: ["MFA coverage", "Shared accounts", "Dormant users", "Admin accounts", "Guest accounts"] },
        { title: "Email security review", items: ["SPF", "DKIM", "DMARC", "Anti-phishing", "Safe Links", "Safe Attachments (if licensed)"] },
        { title: "Microsoft Secure Score review", items: ["Top 10 recommendations", "Quick wins", "Medium-effort fixes"] },
        { title: "Basic device security", items: ["BitLocker", "Microsoft Defender", "Local admin usage"] },
      ],
      report:
        "A plain-English 5–10 page report: executive summary, findings sorted into high / medium / low risk, recommended actions, and a 30-day roadmap.",
      tiers: [
        { name: "Starter", price: "$399", includes: ["1 meeting", "Full review", "Findings report"] },
        { name: "Standard", price: "$799", includes: ["Full review", "Findings report", "Remediation roadmap", "Follow-up meeting"], featured: true },
      ],
    },
    {
      id: "it-documentation",
      name: "IT Documentation as a Service",
      tagline: "Nobody wants to write it. Everybody needs it.",
      forWho:
        "Small businesses that grew without ever writing down how their IT works — and now need it for insurance, clients or plain peace of mind.",
      delivers: [
        { title: "Security policy pack", items: ["Acceptable Use", "Password", "AI Acceptable Use", "Remote Work", "Incident Reporting"] },
        { title: "IT inventory", items: ["Software", "Microsoft 365 licenses", "Vendors", "Critical systems"] },
        { title: "Access register", items: ["System", "Owner", "Admins", "Business purpose"] },
        { title: "Backup register", items: ["What gets backed up", "Frequency", "Retention", "Owner"] },
        { title: "Vendor register", items: ["Microsoft", "QuickBooks", "Procore", "Dropbox, and the rest"] },
      ],
      tiers: [
        { name: "Basic", price: "$499", includes: ["3 core policies"] },
        { name: "Standard", price: "$999", includes: ["5 policies", "IT inventory", "Vendor register"], featured: true },
        { name: "Business", price: "$1,499", includes: ["Everything in Standard", "Access & backup registers", "Annual review session"] },
      ],
    },
  ],

  // Ongoing monthly option, offered after an assessment.
  retainer: {
    name: "Fractional Security Coordinator",
    price: "$249–$499 / month",
    tagline: "The in-house security person you don't have — one hour a month.",
    includes: [
      "Review Microsoft Secure Score",
      "Review users and dormant accounts",
      "Review MFA exceptions",
      "Quarterly policy update",
      "Monthly security-awareness email",
      "A 1-hour meeting each month",
    ],
  },

  // Honest about scope — what this is not.
  notPromising: ["24/7 monitoring", "A security operations centre (SOC)", "Incident response", "Penetration testing"],

  // A sample of what a health-check report looks like.
  sampleReport: {
    score: "52 / 100",
    rows: [
      { level: "High risk", text: "No MFA on 5 accounts" },
      { level: "Medium risk", text: "Guest accounts not reviewed" },
      { level: "Low risk", text: "Secure Score recommendations outstanding" },
    ],
    quickWins: ["Enable MFA", "Disable legacy authentication", "Review external sharing"],
  },

  // Home page: how an engagement works.
  process: [
    { step: "1", title: "Tell me what you need", text: "Email a few lines about your business or website and what worries you." },
    { step: "2", title: "I take a look", text: "I review what's in scope and send a plain-English report with a prioritized fix list." },
    { step: "3", title: "Fix it together", text: "Fix it yourself with the report, or I can walk you through it step by step." },
  ],

  // Home page: quick facts (keep these verifiable).
  highlights: [
    { value: "Full-time", label: "Cybersecurity Coordinator" },
    { value: "3.88 GPA", label: "Information System Security, SAIT" },
  ],

  // This site is the first project: it's hardened, and anyone can verify it.
  project: {
    title: "This website",
    text: "Built as a static site with no server, database or login to attack, and served with a strict Content-Security-Policy, HSTS and anti-framing headers. Every change is checked automatically before it ships, and the live site is tested every hour. Don't take my word for it — check it yourself:",
    checks: [
      { label: "Security headers scan", url: "https://securityheaders.com/?q=kamllistos.com&followRedirects=on" },
      { label: "Mozilla Observatory", url: "https://developer.mozilla.org/en-US/observatory/analyze?host=kamllistos.com" },
      { label: "SSL Labs (HTTPS)", url: "https://www.ssllabs.com/ssltest/analyze.html?d=kamllistos.com" },
      { label: "Status page", url: "https://status.camtoan.me" },
      { label: "Hourly live checks", url: "https://github.com/kamllistos/web/actions/workflows/live.yml" },
      { label: "Source code", url: "https://github.com/kamllistos/web" },
    ],
  },

  // Shown in the Certifications section. Add a `url` (e.g. your Credly badge link) to make one clickable.
  certifications: [
    { name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", url: "https://www.credly.com/badges/c8b2a40f-5678-4711-b5e2-6a5958d382f5/public_url" },
    { name: "AWS Certified AI Business Strategist — Early Adopter", issuer: "Amazon Web Services", url: "https://www.credly.com/badges/992d498b-5549-4b78-ae91-b3db4ea6fd02" },
    { name: "Microsoft Certified: Azure Administrator Associate", issuer: "Microsoft", url: "https://learn.microsoft.com/api/credentials/share/en-us/CamToanDo/3FB6A2F5044FDC5B?sharingId=BDEFF7E51BA51EF9" },
    { name: "CompTIA Security+", issuer: "CompTIA", url: "https://www.credly.com/badges/f0912333-3f1e-4ee8-9bd7-4464474c9726/public_url" },
    { name: "CompTIA Network+", issuer: "CompTIA", url: "https://www.credly.com/badges/182cd5fb-be0c-4f3e-936c-a166523ac24e/public_url" },
    { name: "CompTIA A+", issuer: "CompTIA", url: "https://www.credly.com/badges/b920c0ee-5ce6-43db-ab3d-37103427ec96/public_url" },
  ],

  // Path to your PUBLIC PGP key in /public (e.g. "/pgp.asc") and its fingerprint. Leave empty to hide.
  pgp: { file: "/pgp.asc", fingerprint: "9083 9B9E C1CD 87EB C933  EB78 49A2 57EE 9CAE 466F" },

  // Substack: posts are pulled from the RSS feed at build time and listed on /blog.
  substack: {
    profile: "https://substack.com/@camtoando",
    feed: "https://camtoando.substack.com/feed",
    // Posts whose title contains any of these (case-insensitive) are hidden from the blog.
    exclude: ["ĐBQH", "Ex-Parliamentarian"],
  },

  links: [
    { label: "GitHub", url: "https://github.com/kamllistos" },
    { label: "Substack", url: "https://substack.com/@camtoando" },
  ],
};
