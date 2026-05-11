import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Disclaimer',
  description:
    'Important health and safety information. Lyvewell is not a medical provider. Always consult a qualified healthcare professional.',
  alternates: { canonical: '/legal/medical-disclaimer' },
}

const LAST_UPDATED = '10 May 2026'

export default function MedicalDisclaimerPage() {
  return (
    <>
      <h1>Medical Disclaimer</h1>
      <p className="text-muted-foreground not-prose -mt-4 mb-8 text-sm">Last updated: {LAST_UPDATED}</p>

      <p>
        <strong>Please read this disclaimer carefully before using Lyvewell.</strong> Your health and safety
        are paramount. This page explains the important limitations of our Service and what you must do to use
        it safely.
      </p>

      <h2>1. Not Medical Advice</h2>
      <p>
        All content provided by Lyvewell — including AI-generated supplement protocols, meal plans, coach
        responses, tracking insights, and educational articles — is for <strong>informational and educational
        purposes only</strong>. It does not constitute medical advice, medical diagnosis, or medical treatment.
      </p>
      <p>
        The information on Lyvewell is not intended to replace or substitute professional medical advice,
        diagnosis, or treatment from a qualified healthcare professional. Never disregard professional medical
        advice or delay seeking it because of something you have read or received on Lyvewell.
      </p>

      <h2>2. Not a Healthcare Provider</h2>
      <p>
        Lyvewell is a software technology company, not a healthcare provider, pharmacy, or medical practice.
        No doctor-patient relationship, pharmacist-patient relationship, or any other clinical relationship is
        created between you and Lyvewell by using this platform.
      </p>
      <p>
        Lyvewell does not employ registered medical doctors, pharmacists, dietitians, or other regulated
        healthcare professionals to review AI-generated content before it is delivered to you.
      </p>

      <h2>3. Consult Your Doctor Before Starting Supplements</h2>
      <p>
        Dietary supplements can have significant effects on your health. Before acting on any recommendation
        made by Lyvewell, you should:
      </p>
      <ul>
        <li>Consult your doctor, physician, or a qualified specialist.</li>
        <li>Inform your doctor of all supplements you are taking or considering.</li>
        <li>Disclose your full medical history, including all diagnosed conditions.</li>
        <li>
          Discuss any symptoms or health changes you have experienced. This is especially important if you have
          a chronic condition.
        </li>
      </ul>

      <h2>4. Drug and Supplement Interactions</h2>
      <p>
        Dietary supplements can interact with prescription medications, over-the-counter medicines, and other
        supplements. These interactions can reduce the effectiveness of your medication, increase side effects,
        or in rare cases cause serious harm.
      </p>
      <p>
        Lyvewell&rsquo;s AI systems <strong>do not comprehensively check for drug-supplement interactions</strong>.
        The AI may not have access to your complete medication list or the most current interaction data. You
        must consult your pharmacist or prescribing doctor before starting any supplement recommended by
        Lyvewell, particularly if you take:
      </p>
      <ul>
        <li>Blood thinners (e.g. warfarin, apixaban)</li>
        <li>Thyroid medications</li>
        <li>Immunosuppressants</li>
        <li>Diabetes medications (including insulin)</li>
        <li>Antidepressants or psychiatric medications</li>
        <li>Any medication with a narrow therapeutic index</li>
      </ul>

      <h2>5. Pregnancy and Breastfeeding</h2>
      <p>
        If you are pregnant, trying to conceive, or breastfeeding, do not take any supplement recommended by
        Lyvewell without first consulting your doctor or obstetrician. Many supplements are contraindicated
        during pregnancy and can cause harm to you or your baby. Lyvewell is not designed for use during
        pregnancy, and our AI systems are not optimised to provide safe guidance for pregnant or nursing
        individuals.
      </p>

      <h2>6. Pre-existing Medical Conditions</h2>
      <p>
        Extra caution is required if you have any of the following conditions, among others. Always seek
        specific medical advice before using supplement recommendations if you have:
      </p>
      <ul>
        <li><strong>Diabetes or blood sugar conditions</strong> — certain supplements affect glucose metabolism.</li>
        <li>
          <strong>Cardiovascular disease or hypertension</strong> — some supplements affect heart rate, blood
          pressure, or clotting.
        </li>
        <li>
          <strong>Kidney disease</strong> — impaired kidneys may not safely excrete high doses of certain
          vitamins and minerals.
        </li>
        <li>
          <strong>Liver disease</strong> — fat-soluble vitamins and herbal supplements can accumulate in the
          liver.
        </li>
        <li>
          <strong>Autoimmune conditions</strong> — certain supplements stimulate immune activity that may
          exacerbate autoimmune disorders.
        </li>
        <li>
          <strong>Cancer or a history of cancer</strong> — antioxidant supplements in high doses may have
          complex effects in certain cancer types.
        </li>
        <li>
          <strong>Thyroid disorders</strong> — iodine, selenium, and other supplements interact with thyroid
          function.
        </li>
      </ul>

      <h2>7. Allergies and Intolerances</h2>
      <p>
        Supplement products may contain allergens such as soy, gluten, dairy, shellfish-derived ingredients
        (e.g. glucosamine), gelatine (from animal sources), and other compounds. While Lyvewell tries to
        account for stated dietary preferences, it is your responsibility to carefully read product labels
        before purchasing or consuming any supplement. We cannot guarantee allergen accuracy in third-party
        products.
      </p>

      <h2>8. Emergency Situations</h2>
      <p>
        <strong>
          In a medical emergency, do not consult Lyvewell. Call your local emergency services number
          immediately.
        </strong>
      </p>
      <p>
        Lyvewell is not an emergency service and cannot provide real-time emergency medical assistance. The AI
        coach is not monitored by human operators and cannot dispatch emergency services.
      </p>

      <h2>9. AI Limitations</h2>
      <p>
        Lyvewell uses large language model (LLM) AI technology to generate recommendations. LLMs have
        well-documented limitations that are particularly significant in a health context:
      </p>
      <ul>
        <li>
          <strong>Hallucinations</strong>: AI models can confidently generate plausible-sounding but factually
          incorrect information, including false dosages, non-existent studies, or incorrect contraindications.
        </li>
        <li>
          <strong>Training data cutoff</strong>: AI knowledge has a cutoff date and may not reflect the most
          current research, safety warnings, or regulatory guidance.
        </li>
        <li>
          <strong>Lack of clinical context</strong>: The AI does not have access to your full medical records,
          blood tests, or physical examination findings.
        </li>
        <li>
          <strong>Individual variability</strong>: AI recommendations are based on general patterns and may not
          be appropriate for your specific physiology, genetics, or medical history.
        </li>
      </ul>

      <h2>10. Supplement Quality and Regulation</h2>
      <p>
        Dietary supplements are regulated differently across countries. In many jurisdictions, supplements are
        not required to undergo clinical trials to prove efficacy before being sold, and regulatory oversight
        varies significantly. It is your responsibility to understand the rules applicable in your country.
      </p>
      <p>
        Lyvewell may recommend specific supplement brands based on quality indicators such as third-party
        testing and ingredient transparency. However, we cannot guarantee the quality, purity, potency, or
        safety of any third-party product. Manufacturing standards can vary. When possible, choose supplements
        that carry third-party certifications such as NSF International, Informed Sport, or similar quality
        marks.
      </p>

      <h2>11. Individual Results Vary</h2>
      <p>
        The efficacy of supplements and dietary interventions varies significantly between individuals based on
        genetics, gut microbiome, baseline health status, lifestyle, and many other factors. Lyvewell makes no
        guarantees or warranties regarding the effectiveness of any supplement recommendation or meal plan for
        your specific situation. Testimonials or case studies, if any, reflect individual experiences and are
        not indicative of typical results.
      </p>

      <h2>12. Reporting Adverse Events</h2>
      <p>
        If you experience an adverse reaction to a supplement, we encourage you to:
      </p>
      <ul>
        <li>Stop taking the supplement immediately and seek medical attention if needed.</li>
        <li>
          Report the reaction to your healthcare provider and to the relevant regulatory body or adverse event
          reporting scheme in your country. Reporting helps improve safety data for everyone.
        </li>
        <li>
          Notify us at <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> so we can review our
          recommendations.
        </li>
      </ul>

      <h2>13. Acknowledgement</h2>
      <p>
        By creating an account and using Lyvewell, you acknowledge that:
      </p>
      <ul>
        <li>
          You have read and understood this Medical Disclaimer in full.
        </li>
        <li>
          You understand that Lyvewell is not a substitute for professional medical advice and does not create
          a healthcare provider relationship.
        </li>
        <li>
          You accept full responsibility for decisions you make regarding your health based on information
          provided by the Service.
        </li>
        <li>
          You will consult a qualified healthcare professional before starting any supplement regimen,
          particularly if you have a pre-existing condition or take prescription medication.
        </li>
      </ul>
    </>
  )
}
