import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const recommendationMap: Record<string, Record<string, { movies: string[], activities: string[] }>> = {
  happy: {
    english: {
      movies: ["The Grand Budapest Hotel", "La La Land", "Amélie", "Sing", "Paddington 2"],
      activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
    },
    tamil: {
      movies: ["96", "Kadhalukku Mariyadhai", "Anbe Sivam", "Vinnaithaandi Varuvaayaa", "OK Kanmani"],
      activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
    },
    hindi: {
      movies: ["3 Idiots", "Zindagi Na Milegi Dobara", "Queen", "Barfi!", "Yeh Jawaani Hai Deewani"],
      activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
    },
    malayalam: {
      movies: ["Premam", "Bangalore Days", "Ustad Hotel", "Charlie", "Maheshinte Prathikaaram"],
      activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
    },
    telugu: {
      movies: ["Fidaa", "Pelli Choopulu", "Mahanati", "C/o Kancharapalem", "Oh! Baby"],
      activities: ["Go for a nature walk", "Call a friend", "Try a new recipe", "Dance to your favorite music", "Start a creative project"]
    }
  },
  sad: {
    english: {
      movies: ["The Pursuit of Happyness", "Good Will Hunting", "Inside Out", "Soul", "It's a Wonderful Life"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    tamil: {
      movies: ["Aruvi", "Pariyerum Perumal", "Kaaka Muttai", "Vada Chennai", "Visaranai"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    hindi: {
      movies: ["Taare Zameen Par", "Udaan", "Piku", "October", "Masaan"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    malayalam: {
      movies: ["Kumbalangi Nights", "Thanmathra", "Virus", "Take Off", "Kammatipadam"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    telugu: {
      movies: ["Jersey", "Arjun Reddy", "Colour Photo", "Mindhunter", "Balagam"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    }
  },
  anxious: {
    english: {
      movies: ["My Neighbor Totoro", "Paddington", "Finding Nemo", "The Secret Life of Walter Mitty", "Kiki's Delivery Service"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    tamil: {
      movies: ["Soorarai Pottru", "Azhagiya Tamil Magan", "Ayan", "Theri", "Mersal"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    hindi: {
      movies: ["Dear Zindagi", "English Vinglish", "Pad Man", "Chak De! India", "Dangal"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    malayalam: {
      movies: ["Drishyam", "Lucifer", "Unda", "Njandukalude Nattil Oridavela", "Varathan"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    telugu: {
      movies: ["Eega", "Rangasthalam", "Ala Vaikunthapurramuloo", "Uppena", "Vakeel Saab"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    }
  },
  calm: {
    english: {
      movies: ["The Sound of Music", "Chef", "Julie & Julia", "A Beautiful Day in the Neighborhood", "Paterson"],
      activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
    },
    tamil: {
      movies: ["Roja", "Kannathil Muthamittal", "Thanga Magan", "Kaatru Veliyidai", "Mouna Ragam"],
      activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
    },
    hindi: {
      movies: ["Swades", "Dil Chahta Hai", "Wake Up Sid", "Kapoor & Sons", "Dum Laga Ke Haisha"],
      activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
    },
    malayalam: {
      movies: ["Thattathin Marayathu", "North 24 Kaatham", "How Old Are You", "Jacobinte Swargarajyam", "Ohm Shanthi Oshaana"],
      activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
    },
    telugu: {
      movies: ["Geetha Govindam", "Taxiwaala", "Majili", "Middle Class Melodies", "Jathi Ratnalu"],
      activities: ["Read a book", "Practice mindfulness", "Enjoy a cup of tea", "Listen to ambient music", "Gentle stretching"]
    }
  },
  angry: {
    english: {
      movies: ["Peaceful Warrior", "The Karate Kid", "Remember the Titans", "Rocky", "Coach Carter"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    tamil: {
      movies: ["Ghilli", "Sivaji", "Baahubali", "Annaatthe", "Master"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    hindi: {
      movies: ["Bhaag Milkha Bhaag", "Mary Kom", "Dangal", "Sultan", "Chak De! India"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    malayalam: {
      movies: ["Pulimurugan", "Ezra", "Joseph", "Driving Licence", "Irul"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    telugu: {
      movies: ["Magadheera", "RRR", "Pushpa", "Akhanda", "Krack"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    }
  },
  neutral: {
    english: {
      movies: ["The Truman Show", "Eternal Sunshine of the Spotless Mind", "Her", "Lost in Translation", "Before Sunrise"],
      activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
    },
    tamil: {
      movies: ["Ratsasan", "Super Deluxe", "Sarpatta Parambarai", "Jai Bhim", "Maanagaram"],
      activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
    },
    hindi: {
      movies: ["Andhadhun", "Kahaani", "Stree", "Newton", "Tumbbad"],
      activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
    },
    malayalam: {
      movies: ["Drishyam 2", "Jallikattu", "The Great Indian Kitchen", "Joji", "Nayattu"],
      activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
    },
    telugu: {
      movies: ["Goodachari", "Kshanam", "Vikram Vedha (Telugu)", "HIT", "Karthikeya 2"],
      activities: ["Explore a new hobby", "Listen to a podcast", "Take a walk", "Try meditation", "Read something interesting"]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion, language = 'english' } = await req.json();
    console.log("Getting recommendations for emotion:", emotion, "language:", language);

    const emotionRecs = recommendationMap[emotion.toLowerCase()] || recommendationMap.neutral;
    const recommendations = emotionRecs[language.toLowerCase()] || emotionRecs.english;

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
