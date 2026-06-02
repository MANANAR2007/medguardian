import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { ROUTES } from '../utils/routes'

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Secure family access"
      title="Bring your family’s health records into one calm workspace."
      description="Log in to reach your private dashboard, switch between family members, and review reports, prescriptions, and doctor notes with AI support."
    >
      <AuthForm
        mode="login"
        title="Log in to Family Health Companion"
        subtitle="Use your email and password to continue to your private family health record workspace."
        submitLabel="Log in"
        footerPrompt="Need an account?"
        footerLinkLabel="Create one"
        footerLinkTo={ROUTES.signup}
      />
    </AuthLayout>
  )
}
