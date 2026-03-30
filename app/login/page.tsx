"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";

type Step =
  | { type: "email" }
  | { type: "otp"; email: string };

const OTP_LENGTH = 8;

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<Step>({ type: "email" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  async function handleSendCode(formData: FormData) {
    setLoading(true);
    setSendCodeError(null);
    const email = formData.get("email") as string;

    try {
      await signIn("resend-otp", formData);
      setStep({ type: "otp", email });
      setVerifyError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSendCodeError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleEnter(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (loading) return;
    if (otp.length !== OTP_LENGTH) return;
    void handleVerifyCode();
  }

  async function handleVerifyCode() {
    setLoading(true);
    setVerifyError(null);

    const formData = new FormData();
    formData.set("email", step.type === "otp" ? step.email : "");
    formData.set("code", otp);

    try {
      await signIn("resend-otp", formData);
      router.push("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setVerifyError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen px-4 py-16 md:py-32">
      <div className="max-w-92 m-auto w-full">
        <div className="p-6 space-y-6">
          <div>
            <Link href="/" aria-label="go home" />

            <Image src="/laxx-chem-logo.png" alt="Laxxmi Chemicals" className="h-12 w-auto" width={100} height={100} />

            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Sign In to Laxxmi Chemicals
            </h1>

            <p className="text-muted-foreground">
              {step.type === "email"
                ? "Welcome back! Sign in to continue"
                : `Enter the code sent to ${step.email}`}
            </p>
          </div>

          {/* EMAIL STEP */}
          {step.type === "email" && (
            <form action={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                />

                {sendCodeError && (
                  <p className="text-sm text-red-600">{sendCodeError}</p>
                )}
              </div>

              <Button className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send code"}
              </Button>
            </form>
          )}

          {/* OTP STEP */}
          {step.type === "otp" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">Verification code</Label>

                <div className="w-full">
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(value) => {
                      if (verifyError) setVerifyError(null);
                      setOtp(value);
                    }}
                    onKeyDown={handleEnter}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {verifyError && (
                  <p className="text-sm text-red-600">{verifyError}</p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={loading || otp.length !== OTP_LENGTH}
                onClick={handleVerifyCode}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtp("");
                  setSendCodeError(null);
                  setStep({ type: "email" });
                }}
              >
                Change email
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
