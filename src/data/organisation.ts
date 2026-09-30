import { formatAbn, isValidAbn } from '../lib/abn'

export type ResponsiblePerson = {
  name: string
  role: string
}

export type Supporter = {
  name: string
  logo: string
  logoWidth: number
  logoHeight: number
  /** Rendered height in px, tuned so logos look optically even. */
  displayHeight: number
}

const abn = '34726868010'
if (!isValidAbn(abn)) {
  throw new Error(`Helping Group's ABN (${abn}) fails the ABR checksum`)
}
const acncCharityUrl =
  'https://www.acnc.gov.au/charity/charities/e19a1344-f4b1-eb11-8236-000d3a6ab783'

/**
 * Public, verifiable facts about Helping Group.
 * Every value must match the ACNC Charity Register or the Australian Business
 * Register. Update responsiblePeople whenever the ACNC register changes.
 */
export const organisation = {
  name: 'Helping Group',
  abn,
  abnDisplay: formatAbn(abn),
  contactEmail: 'contact@helping.group',
  acnc: {
    registeredOn: '2020-08-06',
    profileUrl: `${acncCharityUrl}/profile`,
    peopleUrl: `${acncCharityUrl}/people`,
  },
  charity: {
    size: 'Small',
    incomeTaxExempt: true,
    deductibleGiftRecipient: false,
    lastReportedOn: '2026-02-23',
    nextReportDue: '2027-01-31',
  },
  abnLookupUrl: `https://abr.business.gov.au/ABN/View?abn=${abn}`,
  acknowledgementOfCountry:
    'Helping Group acknowledges the Wadawurrung people, Traditional Owners of the lands on which we live and work, and pays respect to Elders past and present.',
  responsiblePeople: [
    { name: 'Daniel Ferguson', role: 'President · Founder' },
    { name: 'Daniel Gates', role: 'Vice-president' },
    { name: 'Kasenya Turner', role: 'Secretary' },
    { name: 'Alison Kemp', role: 'Treasurer' },
    { name: 'Grace Barelier', role: 'Director' },
  ] satisfies ResponsiblePerson[],
  earlySupporters: [
    {
      name: 'Amazon Web Services',
      logo: '/icons/aws.png',
      logoWidth: 360,
      logoHeight: 215,
      displayHeight: 36,
    },
    {
      name: 'Australian Government Department of Foreign Affairs and Trade',
      logo: '/icons/dfat.png',
      logoWidth: 360,
      logoHeight: 167,
      displayHeight: 60,
    },
    {
      name: 'Youth Affairs Council Victoria',
      logo: '/icons/yacvic.png',
      logoWidth: 500,
      logoHeight: 163,
      displayHeight: 46,
    },
  ] satisfies Supporter[],
}
