type PolicySection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Policy = {
  id: string;
  title: string;
  summary: string;
  sections: PolicySection[];
  signedBy?: string;
  signedOn?: string;
  reviewDate: string;
};

// To add a new policy, append an entry here — it will appear in the
// contents list and as its own section on the page automatically.
const policies: Policy[] = [
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
                {policy.signedBy && <p><strong>Signed:</strong> {policy.signedBy}</p>}
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
