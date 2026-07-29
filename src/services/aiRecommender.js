// src/services/aiRecommender.js
// Google AI Assistant for Laptop Catalog Recommendations & Smart Filtering

const GEMINI_API_KEY = (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || (typeof window !== 'undefined' ? window.GEMINI_API_KEY : "") || "";

/**
 * Ask Google AI (Gemma 4 / Gemini) to analyze customer requirements & return matching laptops from catalog.
 */
export async function getAiLaptopRecommendations(userPrompt, catalogText) {
  if (!userPrompt || !userPrompt.trim()) return null;

  const cleanPrompt = userPrompt.toLowerCase().trim();

  // If API key is available, query Google API
  if (GEMINI_API_KEY) {
    const models = [
      "models/gemma-4-26b-a4b-it",
      "models/gemini-2.0-flash"
    ];

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const promptText = `You are a top sales assistant at Buyology Laptop store in UAE.
Live stock catalog:
${catalogText}

CUSTOMER ASK: "${userPrompt}"

Recommend 1 to 3 best matching laptops from catalog above.
Return raw JSON ONLY:
{
  "recommendations": [
    {
      "title": "Exact Laptop Title from catalog",
      "reason": "Short 1-line recommendation reason for customer",
      "offerPrice": 1299
    }
  ],
  "summary": "Short 1-sentence sales recommendation summary"
}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 200) {
          const data = await res.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              console.log(`✅ Google AI (${model}) returned recommendation!`);
              return JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (err) {
        console.warn(`Model ${model} timeout/fallback:`, err.message);
      }
    }
  }

  // -------------------------------------------------------------
  // ACCURATE LOCAL RECOMMENDATION ENGINE
  // -------------------------------------------------------------
  console.log("Using Accurate Local Recommendation Engine...");
  return runAccurateLocalAiRecommendation(cleanPrompt, catalogText);
}

function runAccurateLocalAiRecommendation(prompt, catalogText) {
  if (!catalogText) return null;

  const blocks = catalogText.split(/💻/g).filter(b => b.trim().length > 10);
  const matched = [];

  // Parse budget if mentioned
  const budgetMatch = prompt.match(/(?:under|below|budget|price)\s*(\d+)/i) || prompt.match(/(\d+)\s*(?:aed|dirhams)/i);
  const maxPrice = budgetMatch ? parseInt(budgetMatch[1], 10) : 99999;

  const wants4GbGpu = prompt.includes('4gb') || prompt.includes('4 gb') || prompt.includes('dedicated gpu') || prompt.includes('gaming');
  const wants2GbGpu = prompt.includes('2gb') || prompt.includes('2 gb');
  const wantsGeneralGpu = prompt.includes('gpu') || prompt.includes('graphics') || prompt.includes('workstation');
  const wantsTouch2in1 = prompt.includes('touch') || prompt.includes('2in1') || prompt.includes('2 in 1') || prompt.includes('convertible') || prompt.includes('spectre');
  const isStudentBudget = prompt.includes('cheap') || prompt.includes('student') || prompt.includes('basic') || maxPrice <= 1000;

  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const titleLine = lines[0] ? lines[0].replace(/\*/g, '').trim() : 'Laptop';
    const blockLower = block.toLowerCase();

    const priceMatch = block.match(/Offer\s*Price\s*@\s*(\d+)/i) || block.match(/@\s*(\d+)\s*\/?-?\s*AED/i);
    const offerPrice = priceMatch ? parseInt(priceMatch[1], 10) : 999;

    if (offerPrice > maxPrice) return;

    let score = 0;
    let reason = "";

    // 1. Strict 4GB Graphics Check
    const has4GbGpu = blockLower.includes('4 gb') || blockLower.includes('4gb');
    if (wants4GbGpu) {
      if (has4GbGpu) {
        score += 50;
        reason = "Dedicated 4GB Graphics Card for heavy 3D rendering & gaming";
      } else {
        // Disqualify laptops without 4GB graphics when 4GB was requested!
        return;
      }
    } else if (wants2GbGpu) {
      if (blockLower.includes('2 gb') || blockLower.includes('2gb')) {
        score += 50;
        reason = "Dedicated 2GB Graphics Card";
      } else {
        return;
      }
    } else if (wantsGeneralGpu) {
      if (has4GbGpu || blockLower.includes('2 gb') || blockLower.includes('precision') || blockLower.includes('p14 s')) {
        score += 30;
        reason = "Dedicated Workstation Graphics for heavy tasks";
      } else if (blockLower.includes('iris xe')) {
        score += 15;
        reason = "Intel Iris Xe High Performance Integrated Graphics";
      } else {
        return;
      }
    }

    // 2. Strict Touchscreen / 2-in-1 Check
    if (wantsTouch2in1) {
      if (blockLower.includes('touch') || blockLower.includes('2 in 1') || blockLower.includes('2in1') || blockLower.includes('spectre') || blockLower.includes('x360')) {
        score += 40;
        reason = reason || "2-in-1 Convertible Touchscreen display";
      } else {
        return;
      }
    }

    // 3. Student / Budget Check
    if (isStudentBudget && offerPrice <= 1000) {
      score += 20;
      reason = reason || `Affordable ${offerPrice} AED budget laptop ideal for students`;
    }

    // 4. CPU & RAM matching
    if (prompt.includes('i7') && blockLower.includes('i7')) score += 5;
    if (prompt.includes('i5') && blockLower.includes('i5')) score += 5;
    if (prompt.includes('16gb') || prompt.includes('16 gb')) {
      if (blockLower.includes('16 gb') || blockLower.includes('16gb')) score += 5;
    }

    if (!reason) {
      reason = `Matches customer request at ${offerPrice} AED`;
      score += 5;
    }

    matched.push({ title: titleLine, reason, offerPrice, score });
  });

  matched.sort((a, b) => b.score - a.score);
  const topRecommendations = matched.slice(0, 3);

  if (topRecommendations.length === 0) {
    return {
      recommendations: [],
      summary: `No laptops matching "${prompt}" found in your current stock.`
    };
  }

  return {
    recommendations: topRecommendations.map(m => ({
      title: m.title,
      reason: m.reason,
      offerPrice: m.offerPrice
    })),
    summary: `Found ${topRecommendations.length} exact matching laptop(s) from your live stock catalog!`
  };
}
