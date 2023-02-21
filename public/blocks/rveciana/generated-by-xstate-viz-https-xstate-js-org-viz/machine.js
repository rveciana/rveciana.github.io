
  // Available variables:
  // - Machine
  // - interpret
  // - assign
  // - send
  // - sendParent
  // - spawn
  // - raise
  // - actions
  // - XState (all XState exports)
  
  const fetchMachine = Machine({
    id: 'Agreement',
    initial: 'newAgreement',
    context: {
      stage: "generalTerms"
    },
    states: {
      newAgreement: {
        on: {
          SAVE: 'draft'
        }
      },
      draft: {
        on: {
          CONFIRM_CN: 'confirmedCn',
          CONFIRM_PRE_CN: 'confirmedPreCn',
          REJECT: 'Rejected'
        }
      },
      confirmedCn: {
        on: {
          DRAFT: 'draft',
          CONFIRM_PRE_CN: 'confirmedPreCn',
          REJECT: 'Rejected'
        }
      },
      confirmedPreCn: {
        on: {
          DRAFT: 'draft',
          CONFIRM_CN: 'confirmedCn',
          REJECT: 'Rejected'
        }
      },
      
      Rejected: {
        on: {
          DRAFT: 'draft',
          CONFIRM_CN: 'confirmedCn',
          CONFIRM_PRE_CN: 'confirmedPreCn'
        }
      }
      
    }
  });
  