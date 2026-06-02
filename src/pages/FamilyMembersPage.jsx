import { useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import FamilyMemberForm from '../components/FamilyMemberForm'
import SectionHeader from '../components/SectionHeader'
import { useFamilyHealth } from '../hooks/useFamilyHealth'

export default function FamilyMembersPage() {
  const { activeFamilyMemberId, createFamilyMember, deleteFamilyMember, familyMembers, setActiveFamilyMember, updateFamilyMember } =
    useFamilyHealth()
  const [editingMember, setEditingMember] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedMembers = useMemo(() => familyMembers, [familyMembers])

  async function handleCreate(input) {
    setIsSubmitting(true)

    try {
      await createFamilyMember(input)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(input) {
    if (!editingMember) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateFamilyMember(editingMember.id, input)
      setEditingMember(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(member) {
    const confirmed = window.confirm(`Delete ${member.name}? This will also remove their uploaded reports.`)

    if (!confirmed) {
      return
    }

    await deleteFamilyMember(member.id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Family profiles"
          title="Manage family members"
          description="Create separate health profiles for parents, grandparents, children, or yourself. Each profile gets its own report vault and timeline."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <FamilyMemberForm
          key={editingMember?.id ?? 'new-family-member'}
          initialValues={editingMember}
          isSubmitting={isSubmitting}
          onSubmit={editingMember ? handleUpdate : handleCreate}
          onCancel={editingMember ? () => setEditingMember(null) : undefined}
        />

        <Card>
          <SectionHeader
            eyebrow="Saved profiles"
            title="Current family members"
            description="Switch the active profile here or from the header family switcher."
            compact
          />

          <div className="mt-4 space-y-3">
            {sortedMembers.length === 0 ? (
              <EmptyState
                title="No family members yet"
                description="Add your first family profile to begin uploading health records and prescriptions."
              />
            ) : (
              sortedMembers.map((member) => (
                <article
                  key={member.id}
                  className={[
                    'rounded-xl border p-4 transition',
                    member.id === activeFamilyMemberId
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {[member.relation, member.gender, member.birthYear].filter(Boolean).join(' · ') || 'Profile details can be updated anytime.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setActiveFamilyMember(member.id)}>
                        {member.id === activeFamilyMemberId ? 'Active' : 'Set active'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingMember(member)}>
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(member)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
