const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, company, businessType, targetLayer, bottleneck } = req.body;

  if (!firstName || !lastName || !email || !company) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await resend.emails.send({
      from: "CommodityOps Waitlist <noreply@commodityops.com>",
      to: "info@commodityops.com",
      replyTo: email,
      subject: `New waitlist signup — ${firstName} ${lastName} @ ${company}`,
      html: `
        <div style="font-family: monospace; max-width: 600px;">
          <h2 style="border-bottom: 1px solid #eee; padding-bottom: 12px;">New Waitlist Signup</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 160px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${company}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Business Type</td><td style="padding: 8px 0;">${businessType || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Target Layer</td><td style="padding: 8px 0;">${targetLayer || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Bottleneck</td><td style="padding: 8px 0;">${bottleneck || "—"}</td></tr>
          </table>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
