const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const languages = ['English', 'Yoruba', 'Swahili', 'Hausa', 'French', 'Hindi'];
const authors = ['Amina Ndibe', 'Kwame Osei', 'Fatima Bello', 'John Smith', 'Marie Dubois', 'Raj Patel', 'African Storybook Project', 'StoryWeaver'];
const genres = ['Folktale', 'Fiction', 'Adventure', 'Non-fiction', 'Science', 'History'];

function generateStories() {
  const stories = [];
  let idCounter = 1;

  // Explorer (1-3) - 45 books
  for (let i = 0; i < 45; i++) {
    stories.push({
      title: `The Magical ${genres[i % genres.length]} of Animal ${i}`,
      author: authors[i % authors.length],
      source: i % 2 === 0 ? 'african-storybook' : 'storyweaver',
      license_type: 'CC-BY-4.0',
      language: languages[i % languages.length],
      grade_band: '1-3',
      content_body: `Once upon a time in a beautiful village, there lived a small animal ${i}.\nIt loved to play and explore the world.\nOne day, it found a magical tree.\nThe end.`,
      page_count: Math.floor(Math.random() * 5) + 1,
      genre: genres[i % genres.length],
      status: 'approved',
      rights_attestation: true,
    });
  }

  // Builder (4-6) - 35 books
  for (let i = 0; i < 35; i++) {
    stories.push({
      title: `Adventure in the Savannah: Part ${i}`,
      author: authors[(i + 1) % authors.length],
      source: i % 2 === 0 ? 'african-storybook' : 'storyweaver',
      license_type: 'CC-BY-4.0',
      language: languages[(i + 1) % languages.length],
      grade_band: '4-6',
      content_body: `The sun was setting over the wide savannah, painting the sky in orange and purple.\nA brave group of friends decided to go on a journey to find the lost river.\nAlong the way they met many challenges, but they learned the value of friendship.\nThey finally reached their destination and celebrated.`,
      page_count: Math.floor(Math.random() * 10) + 5,
      genre: 'Adventure',
      status: 'approved',
      rights_attestation: true,
    });
  }

  // Achiever (7-12) - 25 books
  for (let i = 0; i < 25; i++) {
    stories.push({
      title: `The History of the Great Kingdom ${i}`,
      author: authors[(i + 2) % authors.length],
      source: i % 2 === 0 ? 'african-storybook' : 'storyweaver',
      license_type: 'CC-BY-4.0',
      language: languages[(i + 2) % languages.length],
      grade_band: '7-12',
      content_body: `Centuries ago, a great kingdom flourished in the heart of the continent.\nThe rulers were wise, and the people prospered through trade and innovation.\nThis book explores the ancient texts and traditions that have been passed down through generations.\nThe legacy of this kingdom continues to inspire us today.`,
      page_count: Math.floor(Math.random() * 20) + 10,
      genre: 'History',
      status: 'approved',
      rights_attestation: true,
    });
  }

  return stories;
}

async function seed() {
  console.log('Generating stories...');
  const stories = generateStories();
  console.log(`Generated ${stories.length} stories.`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < stories.length; i += batchSize) {
    const batch = stories.slice(i, i + batchSize);
    console.log(`Inserting batch ${i / batchSize + 1} (${batch.length} items)...`);
    const { error } = await supabase.from('storybooks').insert(batch);
    if (error) {
      console.error('Error inserting batch:', error);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed();
