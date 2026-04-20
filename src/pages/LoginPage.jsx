import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { ROUTES } from '../utils/routes'

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Patient login"
      title="Secure access for every medication journey."
      description="Log in to reach your protected dashboard and medication workspace. Firebase Authentication handles the session while Firestore keeps your patient profile ready for future features."
    >
      <AuthForm
        mode="login"
        title="Log in to MedGuardian"
        subtitle="Use your email and password to continue to the protected application routes."
        submitLabel="Log in"
        footerPrompt="Need an account?"
        footerLinkLabel="Create one"
        footerLinkTo={ROUTES.signup}
      />
    </AuthLayout>
  )
}
