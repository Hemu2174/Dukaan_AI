const axios = require('axios');

async function parseTextWithAI(rawText) {
  try {
    const prompt = `
    Extract transaction details from the following verbal entry. It might be in English or Telugu (or mixed).
    Translate and map to structured JSON ONLY.
    Fields needed:
    - amount (number)
    - type (string: either "income" or "expense")
    - category (string: brief category, e.g., "Groceries", "Snacks", "Supplier", "Salary")
    - product_name (string: specific product name bought/sold if mentioned, e.g., "Parle-G", "Milk", null if not mentioned)
    - payment_method (string: ONLY "cash", "upi", or "udhari")
    - notes (string: any extra small details/names)
    - confidence (number: between 0 and 1)

    Text: "${rawText}"
    Return ONLY valid JSON format. Do not use quotes or markdown outside of the JSON block.
    `;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    const jsonStr = response.data.choices[0].message.content;
    const parsed = JSON.parse(jsonStr);
    
    return {
      amount: parsed.amount || 0,
      type: parsed.type || "income",
      category: parsed.category || "General",
      product_name: parsed.product_name || null,
      payment_method: parsed.payment_method || "cash",
      notes: parsed.notes || "",
      confidence: parsed.confidence || 0.9
    };
  } catch (error) {
    console.error("Error connecting to Groq:", error?.response?.data || error);
    // Fallback response explicitly required by prompt if AI fails
    return {
      amount: 0,
      type: "income",
      category: "Unknown",
      product_name: null,
      payment_method: "cash",
      notes: "AI parsing failed, manual review needed.",
      confidence: 0
    };
  }
}

async function generateSummary({ income, expenses, net, cash, upi, udhari, categories_summary }) {
  try {
    const prompt = `
    You are a friendly business assistant for a Kirana store in India speaking in clear, natural Telugu script.
    Write a 80 to 120 word paragraph explaining today's business.
    You MUST include these EXACT numbers (DO NOT calculate yourself, DO NOT deviate from these numbers):
    Income: ₹${income}
    Expenses: ₹${expenses}
    Net Profit/Loss: ₹${net}
    Cash: ₹${cash}
    UPI: ₹${upi}
    Udhari (Credit): ₹${udhari}
    Top Categories: ${categories_summary}

    Mention the payment split clearly. Write flowing, encouraging sentences. Do NOT use bullet points, just one solid paragraph. Do NOT output markdown or English translations, ONLY the Telugu text.
    `;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error connecting to Groq for summary:", error?.response?.data || error);
    return ""; // Empty string triggers the fallback logic cleanly in the route
  }
}

async function generateAlert(weekData) {
  try {
    const prompt = `
    You are a Kirana store business assistant. Analyze this 7-day data sequence.
    Sequence: ${JSON.stringify(weekData)}
    
    Detect unusual patterns:
    - expense increase >20% compared to average
    - unusually low sales days
    - high credit (udhari) usage compared to normal

    Write a single short Telugu alert (1-2 lines). Be clear and helpful, pointing out EXACTLY one or two major observations. Do NOT use markdown. Do NOT write an essay. If everything looks stable, just say "ఈ వారం మీ వ్యాపారం స్థిరంగా ఉంది (Business is stable)."
    Example: "ఈ వారం మీ ఖర్చులు 30% పెరిగాయి — జాగ్రత్తగా ఉండండి"
    Example: "గురువారం అమ్మకాలు చాలా తక్కువగా ఉన్నాయి"
    `;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error connecting to Groq for alert:", error?.response?.data || error);
    return "ఈ వారం ఖర్చులు మరియు అమ్మకాలు పరిశీలించండి"; // Fallback explicit telugu string per rules
  }
}

async function generateReorderAlert(productName, daysRemaining) {
  try {
    const prompt = `
    Product: ${productName}. Stock ends in ${daysRemaining} days. 
    Write a short Telugu alert telling the user to reorder. 
    Keep it strictly to 1 or 2 small sentences. No markdown. No English translations in output.
    Example: "పార్లె-G స్టాక్ 2 రోజుల్లో అయిపోతుంది. వెంటనే ఆర్డర్ చేయండి"
    `;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error connecting to Groq for reorder alert:", error?.response?.data || error);
    return `${productName} స్టాక్ ${daysRemaining} రోజుల్లో అయిపోతుంది. వెంటనే ఆర్డర్ చేయండి.`; // Fallback translation
  }
}

module.exports = { parseTextWithAI, generateSummary, generateAlert, generateReorderAlert };
