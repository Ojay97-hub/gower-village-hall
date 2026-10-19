type PolicySection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Policy = {
  id: string;
  title: string;
  summary: string;
  details?: { label: string; value: string }[];
  sections: PolicySection[];
  signedLabel?: string;
  signedBy?: string;
  signedOn?: string;
  reviewDate: string;
};

// To add a new policy, append an entry here — it will appear in the
// contents list and as its own section on the page automatically.
const policies: Policy[] = [
  {
    id: 'fire-safety',
    title: 'Fire Safety Policy',
    summary: 'Fire precautions, equipment and evacuation procedures for the Hall.',
    details: [
      { label: 'Policy owner', value: 'Chair of Trustees' },
      { label: 'Address', value: 'Penmaen and Nicholaston Village Hall, Tor View, Penmaen SA3 2HH' },
      { label: 'Use of premises', value: 'Community events, e.g. social gatherings and hobby clubs, and ad hoc rental for meetings, parties and groups, e.g. choirs, yoga etc.' },
      { label: 'Number of rooms', value: '7 on one floor, comprising entrance lobby, 3 toilets, main hall, kitchen and storage annex.' },
      { label: 'Occupancy', value: 'Up to 80 persons seated at dining tables, up to 100 persons seated theatre style, up to 120 persons standing/mixed use. No persons resident or sleeping overnight except in cases of civil emergency, where fire watch wardens must be on duty.' },
    ],
    sections: [
      {
        heading: 'Policy Statement',
        paragraphs: [
          'The purpose of this policy is to ensure the safety of all people in the vicinity of the Village Hall in the case of fire.',
          'The Village Hall management is committed to taking all reasonably practicable steps to prevent and minimise the risk of fire and has undertaken a fire safety risk assessment to identify hazards and ensure appropriate controls are in place in line with the Regulatory Reform (Fire Safety) Order 2005.',
          'Whilst fire can never be prevented completely, the Village Hall management has put in place suitable systems to alert people, raise the alarm and escape safely.',
          'These systems will be regularly monitored and reviewed through fire drills. Members of the committee will be given instruction, and written fire evacuation procedures will be electronically provided to the responsible person for each rental.',
        ],
      },
      {
        heading: 'Section 1: Fire Safety Hazards',
        paragraphs: ['Please see fire safety risk assessment attached.'],
      },
      {
        heading: 'Section 2: Fire Safety Precautions',
        paragraphs: [
          "Fire safety responsibility lies with 'The Responsible Person', i.e. the hirer, or the person in charge of the event, who must be on the premises and familiar with this policy and the implementation of the fire evacuation procedure.",
          'Smoking, naked flames or other devices, e.g. gas or oil lamps, are strictly prohibited within the confines of the building, as are any portable electrical devices not owned by the hall or currently PAT tested.',
          'There is an approved heat sensor alarm in the kitchen, and a manually operated alarm bell in the main hall adjacent to the kitchen door. In the event of fire, the alarm bell should be sounded and all occupants directed to leave the hall via the nearest safely accessible fire exit (see attached fire escape plan).',
        ],
      },
      {
        heading: 'Section 3: Emergency Procedures',
        paragraphs: [
          'In the event of fire, the alarm will be raised, and all persons evacuated to the fire muster point as per the attached fire evacuation procedure.',
          'The hall is equipped with emergency lighting. This and the alarm bell will be tested on the first Saturday of each month and recorded.',
          'There are two fire exits. One is situated at the rear of the main hall with outward opening double doors. Doors must be unlocked for the duration of any use. The second fire exit is a crash door located in the storage room adjacent to the kitchen.',
          "The location of both doors is indicated by luminous 'fire exit' signage.",
          'The fire assembly point is located in the car park field at the eastern end of the hall boundary and is indicated by a luminous sign.',
          "It is the duty of the 'Responsible Person' to ensure that fire exits are clear of obstructions and that rules relating to smoking and other fire hazards are obeyed at all times.",
          'There are water and foam extinguishers situated throughout the building as marked on the attached plan, and a fire blanket located in the kitchen.',
          'These should ONLY be operated by people trained in their use on small contained fires. The alarm MUST be raised and evacuation put in progress BEFORE considering use of extinguishers or fire blankets, and this MUST NOT be carried out at risk to the safety of the operator. Inappropriate use of extinguishers on fires, e.g. water on oil fires, can lead to greater danger.',
          'Fire extinguishers will be checked for security on the first Saturday of each month and tested annually by a registered fire equipment technician.',
          "It is the duty of the 'Responsible Person' to ensure the evacuation is carried out in accordance with the attached fire evacuation procedure and to check, as far as is safely possible, that all persons have left the building and are accounted for. It is important to ensure that ALL evacuated persons remain at the muster point until the arrival of emergency services.",
          'The Chair and the Secretary of Penmaen and Nicholaston Village Hall have joint responsibility for ensuring that testing, checks and certification of the above equipment is routinely carried out and that all hirers have a copy of the fire evacuation documents with this policy.',
        ],
      },
    ],
    signedLabel: 'Prepared by',
    signedBy: 'D Ponting (Chair)',
    signedOn: 'June 2026',
    reviewDate: 'Annually',
  },
  {
    id: 'safeguarding',
    title: 'Safeguarding Policy',
    summary: 'How we protect children and vulnerable adults who use the Hall.',
    sections: [
      {
        bullets: [
          'This statement of policy and procedures applies to users of, and activities in, Penmaen and Nicholaston Village Hall, which is the responsibility of the Trustees.',
          'This policy is in place to protect all children and vulnerable adults regardless of gender, ethnicity, disability, sexuality, religion or faith.',
          'All children and vulnerable adults have the right to protection from abuse whether physical, verbal, sexual, bullying, exclusion or neglect. The welfare of the child or vulnerable adult is paramount and is the responsibility of everyone. All people associated with the Village Hall and its use have a responsibility for the safeguarding of children and vulnerable adults.',
          'No member of the Trustees, village hall staff, outside contractors, hirers or volunteers will have unsupervised access to children or vulnerable adults unless they are parents, guardians or designated carers, or in possession of appropriate clearance such as DBS.',
          'The Trustees will ensure that all hirers/users of the Hall are aware that any safeguarding of children or vulnerable adults is the responsibility of the hirers.',
          'This policy will be included with all booking applications.',
          'The Trustees will ensure that hirers are made aware of their obligations under the Licensing Act 2003 to ensure that alcohol is not sold to those under the age of 18 where a Temporary Event Notice is in force.',
          "Acceptance of the Village Hall's safeguarding policy is part of the agreed contract taken out on hiring the Hall.",
          'In the event of any allegations or suspicions of abuse, referral should be made immediately to the Chair of Trustees. Confidentiality to be maintained at all times.',
        ],
      },
    ],
    reviewDate: 'February 2027',
  },
  {
    id: 'welsh-language',
    title: 'Welsh Language Policy',
    summary: 'Our commitment to treating Welsh and English on the basis of equality.',
    sections: [
      {
        heading: 'Introduction',
        paragraphs: [
          'This Policy has been prepared so that Penmaen and Nicholaston Village Hall, on a voluntary basis, follows good practice under the Welsh Language Act 1993.',
          'We recognise that Wales is a bilingual nation. It is a country where people can live their lives through the medium of Welsh or English. Both languages are seen, heard and used in local communities. Penmaen and Nicholaston Village Hall will treat the English and Welsh languages on the basis of equality (Welsh Measure 2011). Penmaen and Nicholaston Village Hall wishes to promote bilingualism where we will provide our services and activities bilingually wherever it is practical and appropriate.',
          'We commit to:',
        ],
        bullets: [
          'ensuring that all staff/volunteers are aware of the implications of this Welsh Language Policy',
          'raising awareness about the Welsh language where possible',
        ],
      },
      {
        heading: 'Learning Welsh',
        bullets: [
          'Supporting and encouraging volunteers who want to learn Welsh and supporting Welsh-speaking volunteers where possible who wish to improve their language skills.',
          'Encouraging service users to feel comfortable using Welsh when Welsh-speaking volunteers and members are present.',
        ],
      },
      {
        heading: 'Publicity and Promotional Material',
        bullets: [
          'All printed public material such as posters, forms, handbooks, annual reports and statements, will be bilingual where appropriate and possible.',
          'Publicity information will be bilingual where appropriate. Both languages will be equal in terms of size, format, quality, clarity and prominence.',
        ],
      },
      {
        heading: 'Communication',
        bullets: [
          'We will reply in Welsh to any communication we receive in Welsh if possible.',
          'Wherever possible, social media posts will be bilingual.',
          'Volunteers who are not fluent in Welsh will have access to translation support when needed.',
        ],
      },
      {
        heading: 'Signage',
        bullets: [
          'We will provide bilingual signage where possible. This will include internal and external signage at the Village Hall.',
          'We will find reliable translation services of a high standard to ensure that all relevant material is translated quickly and reliably.',
        ],
      },
      {
        heading: 'Practical Activities',
        bullets: [
          'Invitations and marketing materials for events will be available in Welsh and English whenever possible.',
          'This policy will be displayed on the website and within the village hall.',
        ],
      },
      {
        heading: 'Employment and Volunteering',
        bullets: [
          'Job adverts, application forms, and interview materials will be offered in both languages if possible and appropriate.',
          'Welsh-speaking volunteers will be encouraged to use Welsh in meetings if they wish.',
          'We will support non-Welsh-speaking volunteers who want to learn Welsh by signposting to available courses.',
        ],
      },
      {
        heading: 'Complaints About Welsh Language Provision',
        paragraphs: [
          'If anyone feels we have not met our commitments to the Welsh language, they are encouraged to contact the Chair of the Trustees to discuss. We are committed to learning and engaging with our volunteers and users of the village hall.',
        ],
      },
      {
        heading: 'Monitoring',
        paragraphs: ['We will monitor the implementation of the policy on an annual basis.'],
      },
    ],
    signedBy: 'Dale Ponting, Chair of Village Hall Trustees',
    signedOn: '15 October 2026',
    reviewDate: '15 October 2027',
  },
];

export function Policies() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Our Policies</h1>
            <p className="text-xl text-gray-800 mt-2">
              The policies adopted by the Trustees of Penmaen and Nicholaston Village Hall.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <nav aria-label="Policies on this page" className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Contents</h2>
            <ul className="space-y-3">
              {policies.map((policy) => (
                <li key={policy.id}>
                  <a href={`#${policy.id}`} className="font-semibold text-primary-600 hover:text-primary-700">
                    {policy.title}
                  </a>
                  <p className="text-sm text-gray-600">{policy.summary}</p>
                </li>
              ))}
            </ul>
          </nav>

          {policies.map((policy) => (
            <article key={policy.id} id={policy.id} className="scroll-mt-24 space-y-6 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{policy.title}</h2>

              {policy.details && (
                <dl className="border border-gray-200 rounded-lg divide-y divide-gray-200 text-sm">
                  {policy.details.map((detail) => (
                    <div key={detail.label} className="grid sm:grid-cols-[10rem_1fr]">
                      <dt className="bg-gray-50 py-3 px-4 font-semibold text-gray-900">{detail.label}</dt>
                      <dd className="py-3 px-4 text-gray-700">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {policy.sections.map((section, i) => (
                <div key={section.heading ?? i} className="space-y-4">
                  {section.heading && (
                    <h3 className="text-xl font-bold text-gray-900">{section.heading}</h3>
                  )}
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-gray-700">{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="bg-gray-50 p-6 rounded-lg space-y-1 text-sm text-gray-700">
                {policy.signedBy && <p><strong>{policy.signedLabel ?? 'Signed'}:</strong> {policy.signedBy}</p>}
                {policy.signedOn && <p><strong>Date:</strong> {policy.signedOn}</p>}
                <p><strong>Next review:</strong> {policy.reviewDate}</p>
              </div>
            </article>
          ))}

          <div className="pt-8 border-t border-gray-200 text-sm text-gray-600">
            <p>
              Questions about any of our policies? Please contact us at{' '}
              <a href="mailto:info@penmaenandnicholastonvh.co.uk" className="text-primary-600 hover:text-primary-700">
                info@penmaenandnicholastonvh.co.uk
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
