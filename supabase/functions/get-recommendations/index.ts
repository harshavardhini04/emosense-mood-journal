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
      movies: ["The Pursuit of Happyness", "Soul", "It's a Wonderful Life", "Forrest Gump", "The Intouchables"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    tamil: {
      movies: ["Soorarai Pottru", "96", "OK Kanmani", "Kaatru Veliyidai", "Kadhalukku Mariyadhai"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    hindi: {
      movies: ["3 Idiots", "Zindagi Na Milegi Dobara", "Taare Zameen Par", "Queen", "Wake Up Sid"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    malayalam: {
      movies: ["Ustad Hotel", "Bangalore Days", "Charlie", "Maheshinte Prathikaaram", "North 24 Kaatham"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    },
    telugu: {
      movies: ["Jersey", "C/o Kancharapalem", "Pelli Choopulu", "Oh! Baby", "Middle Class Melodies"],
      activities: ["Write in a journal", "Practice meditation", "Listen to calming music", "Watch comfort shows", "Take a warm bath"]
    }
  },
  anxious: {
    english: {
      movies: ["Superbad", "The Hangover", "Groundhog Day", "Bridesmaids", "Ted"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    tamil: {
      movies: ["Comali", "Nanum Rowdy Dhaan", "Maari 2", "Pokkiri Raja", "Kalakalappu"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    hindi: {
      movies: ["Hera Pheri", "Golmaal", "Munna Bhai MBBS", "3 Idiots", "Stree"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    malayalam: {
      movies: ["In Harihar Nagar", "Ramji Rao Speaking", "CID Moosa", "Kakshi: Amminippilla", "Maheshinte Prathikaaram"],
      activities: ["Deep breathing exercises", "Gentle yoga", "Organize a small space", "Color or draw", "Go for a short walk"]
    },
    telugu: {
      movies: ["F2", "Jathi Ratnalu", "Venky Mama", "F3", "Mahanubhavudu"],
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
      movies: ["My Neighbor Totoro", "Chef", "A Beautiful Day in the Neighborhood", "Paterson", "The Sound of Music"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    tamil: {
      movies: ["Roja", "Kannathil Muthamittal", "Mouna Ragam", "Thanga Magan", "Kadhalukku Mariyadhai"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    hindi: {
      movies: ["Swades", "Dil Chahta Hai", "Kapoor & Sons", "Piku", "English Vinglish"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    malayalam: {
      movies: ["Ustad Hotel", "Charlie", "Maheshinte Prathikaaram", "How Old Are You", "Ohm Shanthi Oshaana"],
      activities: ["Physical exercise", "Punch a pillow", "Listen to calming music", "Practice deep breathing", "Write down your feelings"]
    },
    telugu: {
      movies: ["Middle Class Melodies", "Pelli Choopulu", "Majili", "C/o Kancharapalem", "Oh! Baby"],
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

const genreMovies: Record<string, Record<string, string[]>> = {
  action: {
    english: ["Mad Max: Fury Road", "The Dark Knight", "Inception", "John Wick", "Mission Impossible"],
    tamil: ["Vikram", "Valimai", "Varisu", "Bigil", "Beast"],
    hindi: ["Pathaan", "War", "Tiger Zinda Hai", "Jawan", "Dhoom 3"],
    malayalam: ["Lucifer", "Bheeshma Parvam", "Malik", "Pulimurugan", "Driving Licence"],
    telugu: ["RRR", "Salaar", "Pushpa", "Akhanda", "Saaho"]
  },
  comedy: {
    english: ["Superbad", "The Hangover", "Bridesmaids", "Crazy Stupid Love", "21 Jump Street"],
    tamil: ["Comali", "Nanum Rowdy Dhaan", "Maari 2", "Pokkiri Raja", "Aranmanai"],
    hindi: ["Hera Pheri", "Golmaal", "Hungama", "Bhool Bhulaiyaa", "Dream Girl"],
    malayalam: ["In Harihar Nagar", "Ramji Rao Speaking", "CID Moosa", "Panchavarnathatha", "Kakshi: Amminippilla"],
    telugu: ["F2", "F3", "Venky Mama", "Jathi Ratnalu", "Mahanubhavudu"]
  },
  romance: {
    english: ["The Notebook", "Pride and Prejudice", "La La Land", "Titanic", "Crazy Rich Asians"],
    tamil: ["96", "Vinnaithaandi Varuvaayaa", "OK Kanmani", "Kaathuvaakula Rendu Kaadhal", "Love Today"],
    hindi: ["Dilwale Dulhania Le Jayenge", "Jab We Met", "Veer-Zaara", "Yeh Jawaani Hai Deewani", "Kal Ho Naa Ho"],
    malayalam: ["Premam", "Thattathin Marayathu", "Ohm Shanthi Oshaana", "Sufiyum Sujatayum", "Ishq"],
    telugu: ["Geetha Govindam", "Fidaa", "Arjun Reddy", "Majili", "Kushi"]
  },
  thriller: {
    english: ["The Prestige", "Shutter Island", "Gone Girl", "Se7en", "Knives Out"],
    tamil: ["Ratsasan", "Theeran Adhigaaram Ondru", "Visaranai", "Maanagaram", "Vikram Vedha"],
    hindi: ["Andhadhun", "Kahaani", "Drishyam", "Special 26", "A Wednesday"],
    malayalam: ["Drishyam", "Joseph", "Memories", "Mumbai Police", "Anjaam Pathiraa"],
    telugu: ["Kshanam", "Goodachari", "HIT", "Agent Sai Srinivasa Athreya", "Evaru"]
  },
  drama: {
    english: ["The Shawshank Redemption", "Forrest Gump", "Good Will Hunting", "A Beautiful Mind", "The Green Mile"],
    tamil: ["Jai Bhim", "Soorarai Pottru", "Asuran", "Karnan", "Vada Chennai"],
    hindi: ["3 Idiots", "Taare Zameen Par", "Dangal", "Chak De! India", "Piku"],
    malayalam: ["Kumbalangi Nights", "Thanmathra", "Virus", "Take Off", "The Great Indian Kitchen"],
    telugu: ["Jersey", "C/o Kancharapalem", "Mahanati", "Colour Photo", "Balagam"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion, language = 'english', genre } = await req.json();
    console.log("Getting recommendations for emotion:", emotion, "language:", language, "genre:", genre);

    let recommendations;

    // For happy emotion with genre selection
    if (emotion.toLowerCase() === 'happy' && genre) {
      const genreMovieList = genreMovies[genre.toLowerCase()]?.[language.toLowerCase()] || genreMovies[genre.toLowerCase()]?.english || [];
      const happyActivities = recommendationMap.happy[language.toLowerCase()]?.activities || recommendationMap.happy.english.activities;
      recommendations = {
        movies: genreMovieList,
        activities: happyActivities
      };
    } else {
      const emotionRecs = recommendationMap[emotion.toLowerCase()] || recommendationMap.neutral;
      recommendations = emotionRecs[language.toLowerCase()] || emotionRecs.english;
    }

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
