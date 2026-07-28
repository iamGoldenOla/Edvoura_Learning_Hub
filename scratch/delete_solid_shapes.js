const SUPABASE_URL = 'https://xynawxgiwekfxzymvobk.supabase.co';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

async function run() {
  // Query lessons with title containing 'SOLID SHAPES'
  const queryUrl = `${SUPABASE_URL}/rest/v1/lessons?select=id,title,scheduled_start_at,class_id&title=ilike.*SOLID SHAPES*`;
  
  console.log('Querying lessons...');
  const res = await fetch(queryUrl, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  
  if (!res.ok) {
    console.error('Failed to query:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log('Matches:', data);
  
  if (data.length === 0) {
    console.log('No matching lessons found.');
    return;
  }
  
  // Let's delete them
  for (const lesson of data) {
    console.log(`Deleting lesson ${lesson.id} (${lesson.title})...`);
    const deleteUrl = `${SUPABASE_URL}/rest/v1/lessons?id=eq.${lesson.id}`;
    const delRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    if (delRes.ok) {
      console.log(`Successfully deleted lesson ${lesson.id}`);
      
      // Check if there are any remaining lessons for this class_id
      // to clean up empty classes just like in deleteLesson action
      if (lesson.class_id) {
        const countUrl = `${SUPABASE_URL}/rest/v1/lessons?select=id&class_id=eq.${lesson.class_id}`;
        const countRes = await fetch(countUrl, {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        const remaining = await countRes.json();
        if (remaining.length === 0) {
          console.log(`Class ${lesson.class_id} has no remaining lessons — deleting class...`);
          const deleteClassUrl = `${SUPABASE_URL}/rest/v1/classes?id=eq.${lesson.class_id}`;
          await fetch(deleteClassUrl, {
            method: 'DELETE',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`
            }
          });
        }
      }
    } else {
      console.error(`Failed to delete lesson ${lesson.id}:`, await delRes.text());
    }
  }
}

run();
