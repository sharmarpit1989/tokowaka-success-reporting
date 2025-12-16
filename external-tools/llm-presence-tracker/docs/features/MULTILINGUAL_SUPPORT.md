# Multilingual Support

## Languages Supported

The LLM Presence Tracker now detects content patterns in **7 languages**:

1. **English** (en)
2. **Spanish** (es)
3. **French** (fr)
4. **German** (de)
5. **Indonesian** (id) ⭐ *Added based on user feedback*
6. **Portuguese** (pt)
7. **Italian** (it)

## Patterns Detected

### Question Detection

**English:**
- "What is...", "How to...", "Why does...", "When will...", "Where can...", "Who is...", "Which is...", "Can I..."

**Spanish:**
- "Qué es...", "Cómo...", "Por qué...", "Cuándo...", "Dónde..."

**French:**
- "Qu'est-ce que...", "Comment...", "Pourquoi...", "Quand...", "Où..."

**German:**
- "Was ist...", "Wie...", "Warum...", "Wann...", "Wo..."

**Indonesian:** ⭐
- "Bagaimana...", "Apa...", "Apakah...", "Mengapa...", "Kapan...", "Di mana..."

**Portuguese:**
- "O que é...", "Como...", "Por que...", "Quando...", "Onde..."

**Italian:**
- "Cos'è...", "Come...", "Perché...", "Quando...", "Dove..."

**Universal:**
- Any text containing "?" (question marks)

### Definition Patterns

**English:**
- "is defined as", "means that", "refers to", "is a type of"

**Spanish:**
- "se define como", "significa", "es un tipo de"

**French:**
- "est défini comme", "signifie", "est un type de"

**German:**
- "ist definiert als", "bedeutet", "ist eine art von"

**Indonesian:** ⭐
- "didefinisikan sebagai", "berarti", "adalah jenis"

**Portuguese:**
- "é definido como", "significa", "é um tipo de"

### Step-by-Step Content

**English:**
- "Step 1", "First,", "Second,", "Then,", "Finally,", "Next,"

**Spanish:**
- "Paso 1", "Primero,", "Segundo,", "Luego,", "Finalmente,"

**French:**
- "Étape 1", "D'abord,", "Ensuite,", "Puis,", "Enfin,"

**German:**
- "Schritt 1", "Zuerst,", "Dann,", "Schließlich,"

**Indonesian:** ⭐
- "Langkah 1", "Pertama,", "Kedua,", "Kemudian,", "Akhirnya,"

**Portuguese:**
- "Passo 1", "Primeiro,", "Segundo,", "Então,", "Finalmente,"

**Universal:**
- Numbered lists: "1. ", "2. ", etc.

### Comparison Content

**English:**
- "vs.", "versus", "compared to", "difference between", "pros and cons"

**Spanish:**
- "comparado con", "diferencia entre", "ventajas y desventajas"

**French:**
- "comparé à", "différence entre", "avantages et inconvénients"

**German:**
- "im vergleich zu", "unterschied zwischen", "vor- und nachteile"

**Indonesian:** ⭐
- "dibandingkan dengan", "perbedaan antara", "kelebihan dan kekurangan"

**Portuguese:**
- "comparado com", "diferença entre", "vantagens e desvantagens"

## Real-World Example

### Before Fix (English Only)

**Page:** https://www.adobe.com/id_id/acrobat/online/pdf-to-word.html

**Content (Indonesian):**
```
Bagaimana cara mengonversi PDF ke Word tanpa kehilangan format?
Perangkat lunak apa yang saya butuhkan untuk mengonversi PDF ke Word?
Apakah dokumen Word hasil konversi saya aman?
```

**Detection Result:** ❌ `has_questions: No`

### After Fix (Multilingual)

**Same Page**

**Detection Result:** ✅ `has_questions: Yes`

**Reasons:**
1. "Bagaimana cara..." matches `/bagaimana/gi` pattern
2. "Apa..." matches `/apa/gi` pattern  
3. "Apakah..." matches `/apakah/gi` pattern
4. "?" detected by `/\?/g` pattern
5. Sentences ending with "?" detected by `/[^.!?]+\?/g` pattern

## Impact on Scoring

### Question Detection Impact

**Answerability Score (25% of total):**
- Has questions → +10 points (out of 100)
- Has question headings → +10 points

**For Indonesian Adobe page:**
- Before: Lost 20 points (10+10)
- After: Gains 20 points ✅

**Example score change:**
- Before: 60/100 = 60% → "Good" rating
- After: 80/100 = 80% → "Excellent" rating

## Testing Multilingual Pages

To test if your page is detected correctly:

```bash
# Run analysis
node main.js --csv sample-urls.csv

# Check CSV output for:
# - Has_Questions column
# - Has_Definitions column
# - Has_Steps column
# - Has_Comparisons column
```

## Adding More Languages

To add support for additional languages, edit `analyzers/answerability-analyzer.js`:

```javascript
// Example: Adding Japanese patterns
const questionPatterns = [
  // ... existing patterns
  
  // Japanese patterns
  /何ですか/gi,      // What is
  /どのように/gi,    // How to
  /なぜ/gi,          // Why
  /いつ/gi,          // When
  /どこ/gi,          // Where
];
```

## Language Detection (Future Enhancement)

Currently, patterns are checked against all languages simultaneously. Future improvements could include:

1. **Auto-detect page language** from HTML `lang` attribute
2. **Prioritize patterns** based on detected language
3. **Report language** in output (e.g., "Page language: Indonesian")

## Known Limitations

1. **Mixed language pages**: If a page has both English and Indonesian content, both patterns will match (this is good!)
2. **Informal language**: Casual/slang question forms may not be detected
3. **Complex grammar**: Some question structures may be missed
4. **Right-to-left languages**: Arabic, Hebrew not yet supported

## Reporting Issues

If you find pages with questions/steps that aren't detected, please note:

1. Page URL
2. Language
3. Example text that should be detected
4. Current detection result

This helps improve pattern matching!

---

**Last Updated:** November 2025  
**Version:** 1.1.0 (added multilingual support)

