import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { ROUTES } from '../utils/routes'

export default function SignupPage() {
  return (
    <AuthLayout
      eyebrow="Create your workspace"
      title="Start a secure family health record platform for the people you care about."
      description="Create one account, add multiple family members, and organize reports, prescriptions, doctor notes, and AI-generated health summaries."
    >
      <AuthForm
        mode="signup"
        title="Create your Family Health Companion account"
        subtitle="Sign up to create a secure Firebase account and a Firestore profile for your family workspace."
        submitLabel="Create account"
        footerPrompt="Already have an account?"
        footerLinkLabel="Log in"
        footerLinkTo={ROUTES.login}
      />
    </AuthLayout>
  )
}
