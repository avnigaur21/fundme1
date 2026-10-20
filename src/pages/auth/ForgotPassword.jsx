import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthShell from "./AuthShell";

// Passwords are owned by the FundMe backend's custom users table. Until an
// email provider is configured, do not expose an unsafe "set a new password"
// form; give the user a clear recovery path instead of rendering a blank page.
export default function ForgotPassword() {
  return (
    <AuthShell
      narrow
      eyebrow="Account recovery"
      title={<>Reset access to your <span className="font-serif-display text-emerald-600">account</span>.</>}
      sub="Password recovery email is not configured for this environment yet."
      footer={<Link to="/login" className="text-emerald-600 font-semibold hover:underline">Back to sign in</Link>}
    >
      <div className="bg-white border border-slate-200 p-7 space-y-5" data-testid="forgot-password-page">
        <div className="flex items-start gap-3 rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <Mail size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <p>Ask the project administrator to reset your account, or create a new account with a different email while email delivery is being configured.</p>
        </div>
        <Button asChild variant="outline" className="w-full h-11 rounded-md border-slate-300">
          <Link to="/login"><ArrowLeft size={14} className="mr-2" /> Return to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
