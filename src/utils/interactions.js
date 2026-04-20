export const interactionRules = [
  {
    drugs: ['paracetamol', 'alcohol'],
    warning: 'Avoid combining due to increased liver strain risk.',
  },
  {
    drugs: ['ibuprofen', 'aspirin'],
    warning: 'This combination may increase bleeding risk.',
  },
  {
    drugs: ['warfarin', 'aspirin'],
    warning: 'This combination can raise bleeding risk and should be reviewed carefully.',
  },
]

function normalizeName(value) {
  return value.toLowerCase().trim()
}

export function checkMedicationInteractions(medications) {
  const warnings = []
  const byMedicationId = {}

  interactionRules.forEach((rule, index) => {
    const matches = rule.drugs.map((drug) =>
      medications.filter((medication) => normalizeName(medication.name).includes(drug)),
    )

    if (matches.some((group) => group.length === 0)) {
      return
    }

    warnings.push({
      id: `interaction-${index}`,
      drugs: rule.drugs,
      warning: rule.warning,
    })

    matches.flat().forEach((medication) => {
      if (!byMedicationId[medication.id]) {
        byMedicationId[medication.id] = []
      }

      byMedicationId[medication.id].push(rule.warning)
    })
  })

  return { warnings, byMedicationId }
}
