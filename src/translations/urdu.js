export const urduTranslations = {
    'ADHD Clinical Assistant': 'ADHD کلینکل اسسٹنٹ',
    'Check My Symptoms': 'اپنی علامات چیک کریں',
    'Browse Database': 'ڈیٹا بیس دیکھیں',
    'Tell us about your symptoms': 'اپنی علامات بتائیں',
    'Age': 'عمر',
    'Gender': 'جنس',
    'Male': 'مرد',
    'Female': 'خاتون',
    'Nonbinary': 'نان بائنری',
    'Prefer not to say': 'نہیں بتانا چاہتے',
    'Get My Personalized Report': 'میری ذاتی رپورٹ حاصل کریں',
    'Analyzing...': 'تجزیہ ہو رہا ہے...',
    'Quick Assessment': 'فوری جائزہ',
    'Symptoms': 'علامات',
    'Your Clinical Assessment Report': 'آپ کی کلینکل رپورٹ',
    'AI Risk Score': 'اے آئی رسک سکور',
    'AI Recommendation': 'اے آئی تجویز',
    'Primary Concern': 'بنیادی مسئلہ',
    'Top Symptoms': 'بڑی علامات',
    'What You Should Do': 'آپ کو کیا کرنا چاہیے',
    'Recommended Tests': 'تجویز کردہ ٹیسٹ',
    'Next Steps': 'اگلے اقدامات',
    'Patients by Symptom': 'علامت کے مطابق مریض',
    'Treatments by Outcome': 'نتائج کے مطابق علاج',
    'Outcomes by Symptom': 'علامت کے مطابق نتائج',
    'Treatment Effectiveness': 'علاج کی افادیت',
    'Symptom Correlation': 'علامات کا تعلق',
    'Custom Query': 'اپنی مرضی کی کوئری',
    'Find patients with specific symptom severity': 'مخصوص علامت کی شدت والے مریض تلاش کریں',
    'Find treatments that improve a specific outcome': 'مخصوص نتیجہ بہتر کرنے والے علاج تلاش کریں',
    'Find outcomes related to a specific symptom': 'مخصوص علامت سے متعلق نتائج تلاش کریں',
    'Check effectiveness of a specific treatment': 'مخصوص علاج کی افادیت چیک کریں',
    'Analyze correlation between symptoms': 'علامات کے درمیان تعلق جانچیں',
    'Write your own Cypher query': 'اپنی Cypher کوئری لکھیں',
    'Minimum Severity Score (1-10)': 'کم از کم شدت (1-10)',
    'Write your Cypher query:': 'اپنی Cypher کوئری لکھیں:',
    'Executing...': 'چل رہا ہے...',
    'Run Query': 'کوئری چلائیں',
    'Example Questions You Can Ask': 'مثال کے سوالات',
    'What treatments improve "Inattention"?': '"توجہ کی کمی" کے لیے کون سے علاج بہتر ہیں؟',
    'Which outcomes are associated with "Hyperactivity"?': '"بے چینی" سے کون سے نتائج وابستہ ہیں؟',
    'How effective is "Cognitive Behavioral Therapy"?': '"کاگنیٹو بیہیویئرل تھراپی" کتنی مؤثر ہے؟',
    'What lab tests are recommended for severe symptoms?': 'شدید علامات کے لیے کون سے ٹیسٹ تجویز ہیں؟',

    // Symptoms
    'Inattention': 'توجہ کی کمی',
    'Hyperactivity': 'بے چینی',
    'Impulsivity': 'جلد بازی',
    'Daydreaming': 'دن میں خواب دیکھنا',
    'Restlessness': 'بے آرامی',
    'Fidgeting': 'بے چینی (جسمانی)',
    'Poor concentration': 'توجہ نہ لگ پانا',
    'Interrupting others': 'دوسروں کی بات کاٹنا',
    'Difficulty waiting turn': 'باری کا انتظار نہ کر پانا',
    'Rejection Sensitivity Dysphoria': 'رد ہونے کا احساس',

    // Risk levels
    'Critical': 'بہت شدید',
    'Severe': 'شدید',
    'Moderate': 'معتدل',
    'Mild': 'ہلکا',
    'Minimal': 'بہت ہلکا',
    'High': 'زیادہ',
    'Low': 'کم',

    // Common
    'Select Outcome': 'نتیجہ منتخب کریں',
    'Select Symptom': 'علامت منتخب کریں',
    'Select Treatment': 'علاج منتخب کریں',
    'Select': 'منتخب کریں'
};

export const translate = (text, language) => {
    if (language === 'urdu' && urduTranslations[text]) {
        return urduTranslations[text];
    }
    return text;
};