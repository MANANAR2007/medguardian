import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { ROUTES } from '../utils/routes'

export default function SignupPage() {
  return (
    <AuthLayout
      eyebrow="Secure signup"
      title="Create the right workspace for patients or caregivers."
      description="Choose the role that matches your workflow. Patients manage medications and adherence, while caregivers can link to a patient account and monitor their medication activity."
    >
      <AuthForm
        mode="signup"
        title="Create your MedGuardian account"
        subtitle="Sign up to create a Firebase-authenticated account and a Firestore role profile."
        submitLabel="Create account"
        footerPrompt="Already have an account?"
        footerLinkLabel="Log in"
        footerLinkTo={ROUTES.login}
      />
    </AuthLayout>
  )
}
