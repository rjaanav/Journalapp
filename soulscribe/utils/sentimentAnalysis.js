// utils/sentimentAnalysis.js

export function analyzeSentiment(journals) {
    let positive = 0;
    let neutral = 0;
    let negative = 0;
  
    journals.forEach((j) => {
      const text = j.transcript.toLowerCase();
      if (text.includes('happy') || text.includes('great') || text.includes('good')) {
        positive++;
      } else if (text.includes('bad') || text.includes('sad') || text.includes('angry')) {
        negative++;
      } else {
        neutral++;
      }
    });
  
    return { positive, neutral, negative };
  }
  