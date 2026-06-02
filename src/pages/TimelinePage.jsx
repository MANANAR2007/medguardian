import { useMemo, useState } from 'react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'
import TimelineChart from '../components/TimelineChart'
import { useFamilyHealth } from '../hooks/useFamilyHealth'

export default function TimelinePage() {
  const { activeFamilyMember, availableTimelineTests, timelineMap } = useFamilyHealth()
  const [selectedTest, setSelectedTest] = useState('')
  const resolvedSelectedTest = timelineMap.has(selectedTest) ? selectedTest : availableTimelineTests[0] || ''
  const selectedPoints = useMemo(() => timelineMap.get(resolvedSelectedTest) || [], [resolvedSelectedTest, timelineMap])

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Timeline"
          title={activeFamilyMember ? `${activeFamilyMember.name}'s health trends` : 'Health timeline'}
          description="Track how values change across reports so rising or improving patterns are easier to spot."
        />
      </Card>

      {!activeFamilyMember ? (
        <EmptyState
          title="No family profile selected"
          description="Choose a family member before reviewing trends."
        />
      ) : availableTimelineTests.length === 0 ? (
        <EmptyState
          title="No trendable lab values yet"
          description="Upload at least one structured lab report with numeric values to build the timeline."
        />
      ) : (
        <>
          <Card>
            <SectionHeader
              eyebrow="Choose marker"
              title="Select a test to track"
              compact
            />
            <label className="mt-4 block max-w-sm">
              <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Available tests</span>
              <select
                value={resolvedSelectedTest}
                onChange={(event) => setSelectedTest(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
              >
                {availableTimelineTests.map((testName) => (
                  <option key={testName} value={testName}>
                    {testName}
                  </option>
                ))}
              </select>
            </label>
          </Card>

          {resolvedSelectedTest && selectedPoints.length > 0 ? (
            <TimelineChart testName={resolvedSelectedTest} points={selectedPoints} />
          ) : null}
        </>
      )}
    </div>
  )
}
