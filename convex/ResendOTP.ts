import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

const allowedEmails = (process.env.AUTH_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 8;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (allowedEmails.length > 0 && !allowedEmails.includes(normalizedEmail)) {
      throw new Error(
        "Not allowed, to get access contact nireshine@gmail.com."
      );
    }

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Laxxmi Chemicals <onboarding@resend.dev>",
      to: [email],
      subject: `Laxxmi Chemicals - Verification Code: ${token}`,
      html: `
        <div style="background:#0b0f19;padding:32px 12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
          <div style="max-width:560px;margin:0 auto;background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:28px;">
            <div style="color:#e2e8f0;font-size:20px;font-weight:700;line-height:1.3;margin:0 0 18px 0;">
              Verify your email to sign in to Laxxmi Chemicals
            </div>

            <div style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px 0;">Hello,</div>
            <div style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px 0;">
              We have received a sign-in attempt for <strong style="color:#e2e8f0;">${email}</strong>.
            </div>
            <div style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
              To complete the sign-in process, enter the verification code in the original window:
            </div>

            <div style="text-align:center;margin:0 0 22px 0;">
              <div style="display:inline-block;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.25);border-radius:12px;padding:14px 22px;">
                <span style="color:#f8fafc;font-size:26px;letter-spacing:8px;font-weight:800;">${token}</span>
              </div>
            </div>

            <div style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
              If you didn't attempt to sign in, you can safely ignore this email. Do not share or forward this code with anyone.
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});