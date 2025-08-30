const personalityQuiz = {
  question: "Which of these qualities feels most aligned with who you truly are?",
  options: [
    {
      answer: "Adventurous",
      next_question: {
        question: "When you picture a perfect day, do you imagine vibrant, bold experiences or serene, tranquil moments?",
        options: [
          {
            answer: "Vibrant, Bold Experiences",
            next_question: {
              question: "Do you prefer abstract or realistic representations of nature or animals?",
              options: [
                { answer: "Abstract", result: "Abstract Leopard (Vibrant, Bold)" },
                { answer: "Realistic", result: "African Elephant (Majestic, Powerful)" }
              ]
            }
          },
          {
            answer: "Serene, Tranquil Moments",
            next_question: {
              question: "Do you enjoy serene landscapes or nature-inspired motifs?",
              options: [
                { answer: "Serene Landscapes", result: "Wings of Peace (Calm, Gentle)" },
                { answer: "Nature-inspired Motifs", result: "Wild Desert (Adventurous, Free-spirited)" }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Creative and Artistic",
      next_question: {
        question: "Do you gravitate toward abstract or realistic designs in art?",
        options: [
          {
            answer: "Abstract",
            next_question: {
              question: "Do you prefer cosmic or natural influences in the art you enjoy?",
              options: [
                { answer: "Cosmic", result: "Untitled AI Artwork 92 (Introspective, Cosmic)" },
                { answer: "Natural", result: "Canyon Birds (Nature, Wild)" }
              ]
            }
          },
          {
            answer: "Realistic",
            next_question: {
              question: "Do you enjoy detailed, nostalgic art or more contemporary pieces?",
              options: [
                { answer: "Nostalgic", result: "Vintage Bike (Nostalgic, Classic)" },
                { answer: "Contemporary", result: "Venetian Story (Sophisticated, Artistic)" }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Elegant and Sophisticated",
      next_question: {
        question: "Do you prefer nature-inspired or geometric patterns?",
        options: [
          {
            answer: "Nature-inspired",
            next_question: {
              question: "Do you like soft, pastel tones or vibrant, lively colors?",
              options: [
                { answer: "Pastel Shades", result: "Wondrous Wings (Graceful, Serene)" },
                { answer: "Vibrant Colors", result: "Butterfly Honey (Vibrant, Nature)" }
              ]
            }
          },
          {
            answer: "Geometric Patterns",
            next_question: {
              question: "Do you prefer subtle or bold statements in geometric designs?",
              options: [
                { answer: "Subtle", result: "Vintage Floral (Timeless, Elegant)" },
                { answer: "Bold", result: "Skyscrapers (Energetic, Modern)" }
              ]
            }
          }
        ]
      }
    },
    {
      answer: "Free-Spirited",
      next_question: {
        question: "Do you enjoy abstract nature or bold animal designs?",
        options: [
          {
            answer: "Abstract Nature",
            next_question: {
              question: "Do you prefer earthy tones or vibrant colors?",
              options: [
                { answer: "Earthy Tones", result: "Wild Desert (Adventurous, Free-spirited)" },
                { answer: "Vibrant Colors", result: "Underwater Beauty (Calm, Dreamy)" }
              ]
            }
          },
          {
            answer: "Bold Animal Motifs",
            next_question: {
              question: "Do you prefer strong, majestic animals or playful and whimsical ones?",
              options: [
                { answer: "Majestic Animals", result: "African Elephant (Majestic, Powerful)" },
                { answer: "Playful Animals", result: "Deer and Cardinal (Elegant, Graceful)" }
              ]
            }
          }
        ]
      }
    }
  ]
};

export default personalityQuiz;
