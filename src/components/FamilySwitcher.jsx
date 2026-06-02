import { Link } from 'react-router-dom'
import { useFamilyHealth } from '../hooks/useFamilyHealth'
import { ROUTES } from '../utils/routes'

export default function FamilySwitcher() {
  const { activeFamilyMemberId, familyMembers, setActiveFamilyMember } = useFamilyHealth()

  if (familyMembers.length === 0) {
    return (
      <Link
        to={ROUTES.family}
        className="inline-flex h-11 items-center rounded-xl border border-dashed border-gray-300 px-4 text-sm font-semibold text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-300"
      >
        Add family member
      </Link>
    )
  }

  return (
    <label className="block min-w-[14rem]">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        Active profile
      </span>
      <select
        value={activeFamilyMemberId}
        onChange={(event) => setActiveFamilyMember(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
      >
        {familyMembers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name} · {member.relation}
          </option>
        ))}
      </select>
    </label>
  )
}
