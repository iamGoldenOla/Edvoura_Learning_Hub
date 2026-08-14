'use client';

import { useState } from 'react';
import { Play, Sparkles, Tv, BookOpen, Volume2, PlusCircle } from 'lucide-react';
import { StoryViewerModal, type StoryContent } from '@/components/ui/StoryViewerModal';

const STORY_VIDEOS = [
  { id: '1', title: "The Hungry Caterpillar", type: "video", thumbnail: "🐛", youtubeId: "75NQK-Sm1YY", color: "bg-green-100" },
  { id: '2', title: "The Lion and the Mouse", type: "video", thumbnail: "🦁", youtubeId: "GxcGVCEEdcU", color: "bg-orange-100" },
  { id: '3', title: "The Ugly Duckling", type: "video", thumbnail: "🦆", youtubeId: "THX7_94E3hU", color: "bg-blue-100" },
];

const GREAT_LION_STORY: StoryContent = {
  title: "The Great Lion of the Savanna",
  moralLesson: "True strength comes from wisdom, kindness, and leadership—not just raw power.",
  ageSuitability: "Ages 6 to 12 (Primary 1 to JSS 3)",
  content: `Deep in the heart of the vast African savanna, beneath the shade of giant baobab trees, lived Simba the Great Lion. Simba was known across all seven kingdoms for his golden mane that gleamed like sunshine and his roar that echoed across mountains.

One scorching afternoon, water became scarce in the savanna. Smaller animals—zebras, gazelles, and meerkats—gathered nervously near the shrinking waterhole. A selfish leopard named Jabari tried to block the waterhole, claiming it belonged only to the strongest hunters.

Rather than using force, Simba walked forward calmly. He spoke to the animals about unity: "The savanna thrives when every creature flourishes together." Simba used his wisdom to guide the herd to an undiscovered underground spring hidden beneath the marble rocks.

The animals rejoiced, drank fresh cool water, and realized that true leadership is protecting everyone, big and small. From that day on, Simba was celebrated as the wisest ruler of the African savanna.`,
  vocabulary: [
    { word: "Savanna", meaning: "A large grassy plain in tropical regions with scattered trees." },
    { word: "Scarce", meaning: "In short supply; rare or hard to find." },
    { word: "Wisdom", meaning: "The quality of having knowledge, good judgment, and experience." },
    { word: "Flourish", meaning: "To grow, prosper, and develop healthily." },
  ],
  contentType: "story",
};

export default function StoriesPage() {
  const [selectedVideo, setSelectedVideo] = useState<typeof STORY_VIDEOS[0] | null>(null);
  const [activeStory, setActiveStory] = useState<StoryContent | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-12 w-full min-w-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-dark flex items-center gap-3 break-words">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 shrink-0" />
            Story Time & Audio Reader!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-dark/60 font-semibold">Watch animated stories or listen to AI audio fables.</p>
        </div>
        
        <div className="flex gap-3 sm:gap-4 flex-wrap">
           <button 
             onClick={() => setActiveStory(GREAT_LION_STORY)}
             className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[2px] sm:border-[3px] border-dark bg-yellow text-dark font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
           >
             <BookOpen className="h-4 w-4" /> Read Storybook
           </button>
           <button 
             onClick={() => setActiveStory(GREAT_LION_STORY)}
             className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[2px] sm:border-[3px] border-dark bg-red-600 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
           >
             <Sparkles className="h-4 w-4" /> AI Storyteller
           </button>
        </div>
      </header>

      {selectedVideo ? (
        <div className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[40px] shadow-[6px_6px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] overflow-hidden">
          <div className="aspect-video bg-black relative">
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
               title={selectedVideo.title}
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
             ></iframe>
          </div>
          <div className="p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark">{selectedVideo.title}</h2>
              <p className="text-dark/40 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-2">
                <Tv className="h-4 w-4 text-red-600" /> YouTube Story
              </p>
            </div>
            <button 
              onClick={() => setSelectedVideo(null)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {STORY_VIDEOS.map((story) => (
            <div 
              key={story.id}
              onClick={() => setSelectedVideo(story)}
              className="group cursor-pointer bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all overflow-hidden"
            >
              <div className={`${story.color} h-48 flex items-center justify-center text-[100px] group-hover:scale-110 transition-transform relative`}>
                {story.thumbnail}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="h-16 w-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl">
                    <Play className="h-8 w-8 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t-[3px] sm:border-t-[4px] border-dark">
                <h3 className="text-xl font-black text-dark">{story.title}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest">
                    <Tv className="h-4 w-4" /> Watch Now
                  </span>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">Video</div>
                </div>
              </div>
            </div>
          ))}

          {/* AI Storyteller Box */}
          <div 
            onClick={() => setActiveStory(GREAT_LION_STORY)}
            className="bg-gradient-to-br from-red-500 to-rose-600 border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-6 sm:p-8 flex flex-col items-center justify-center text-white text-center group cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
             <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Volume2 className="h-12 w-12 text-white" />
             </div>
             <h3 className="text-2xl font-black">AI Audio Storybook</h3>
             <p className="mt-2 text-rose-100 font-bold italic">Click to listen to "The Great Lion" story with Audio Reader!</p>
          </div>
        </div>
      )}

      {/* Audio Reader Story Modal */}
      {activeStory && (
        <StoryViewerModal
          isOpen={activeStory !== null}
          onClose={() => setActiveStory(null)}
          story={activeStory}
        />
      )}
    </div>
  );
}
