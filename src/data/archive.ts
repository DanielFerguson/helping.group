export type ArchiveArticle = {
  title: string
  description: string
  category: string
  date: string
  url: string
}

export type PressItem = {
  name: string
  logo: string
  url: string
  description: string
}

export const archiveArticles: ArchiveArticle[] = [
  {
    title: 'Helping Group: Who are we?',
    description:
      'The origin of Helping Group, the creation of Helping Homes and the wider ideas the organisation explored.',
    category: 'Organisation',
    date: '23 October 2021',
    url: 'https://medium.com/helping-group/helpinggroup-who-are-we-71b2ee52a016',
  },
  {
    title: 'Helping Homes: Catch me up',
    description:
      'How Helping Homes was designed as a seasonal service that could return to standby and reactivate when required.',
    category: 'Helping Homes',
    date: '23 October 2021',
    url: 'https://medium.com/helping-group/helping-homes-catch-me-up-13e5ffb67a22',
  },
  {
    title: 'Helping Group: Catch me up',
    description:
      'A snapshot of the organisation as it began exploring projects beyond its first bushfire response.',
    category: 'Organisation',
    date: '22 December 2020',
    url: 'https://medium.com/helping-group/helping-group-catch-me-up-33ccad54fd94',
  },
  {
    title: 'Let’s recap on 2020',
    description:
      'A record of Helping Group’s first year, the response to Helping Homes and the work that followed.',
    category: 'Year in review',
    date: '12 December 2020',
    url: 'https://medium.com/helping-group/lets-recap-on-2020-2a8768353053',
  },
]

export const verifiedPress: PressItem[] = [
  {
    name: 'The Courier',
    logo: '/logos/courier.png',
    url: 'https://www.thecourier.com.au/story/6566053/new-website-offers-places-to-stay-for-families-devastated-by-fire/',
    description: 'Emergency accommodation for families affected by fire',
  },
  {
    name: '9Now',
    logo: '/logos/9now.png',
    url: 'https://9now.nine.com.au/the-block/bushfires-australia-how-to-find-accommodation-offer-room-airbnb-findabed/10eb03d3-51b3-4455-af42-f1a57440144b',
    description: 'Ways Australians could offer accommodation during the fires',
  },
  {
    name: 'Australian Financial Review',
    logo: '/logos/afr.png',
    url: 'https://www.afr.com/politics/federal/nsw-government-calls-for-holiday-home-owners-to-open-doors-to-evacuees-20200114-p53r91',
    description: 'Holiday homes and emergency accommodation for evacuees',
  },
  {
    name: 'Stock & Land',
    logo: '/logos/stock-and-land.png',
    url: 'https://www.stockandland.com.au/story/6570125/fire-victims-need-cash-not-goods-as-new-fund-established/',
    description: 'Practical assistance for people affected by fire',
  },
  {
    name: 'Student Edge',
    logo: '/logos/student-edge.png',
    url: 'https://studentedge.org/article/where-to-find-emergency-accommodation-if-youre-impacted-by-australias-busfires',
    description: 'Where to find emergency accommodation during bushfires',
  },
]

export const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/HelpingGroup',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/helpinggroupaus/',
  },
  {
    name: 'X',
    url: 'https://x.com/HelpingGroupAU',
  },
]
