'use client';

import { useState } from 'react';
import { Play, Sparkles, Tv, BookOpen, Volume2, PlusCircle } from 'lucide-react';

const STORY_VIDEOS = [
  { id: '1', title: "The Hungry Caterpillar", type: "video", thumbnail: "🐛", youtubeId: "75NQK-Sm1YY", color: "bg-green-100" },
  { id: '2', title: "The Lion and the Mouse", type: "video", thumbnail: "🦁", youtubeId: "GxcGVCEEdcU", color: "bg-orange-100" },
  { id: '3', title: "The Ugly Duckling", type: "video", thumbnail: "🦆", youtubeId: "THX7_94E3hU", color: "bg-blue-100" },
];

export default function StoriesPage() {
  const [selectedVideo, setSelectedVideo] = useState<typeof STORY_VIDEOS[0] | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-12 w-full min-w-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-dark flex items-center gap-3 break-words">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 shrink-0" />
            Story Time!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-dark/60 font-semibold">Watch and listen to amazing stories.</p>
        </div>
        
        <div className="flex gap-3 sm:gap-4 flex-wrap">
           <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[2px] sm:border-[3px] border-dark bg-white text-dark font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
             <PlusCircle className="h-4 w-4" /> Add Story
           </button>
           <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[2px] sm:border-[3px] border-dark bg-red-600 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
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
          <div className="bg-gradient-to-br from-red-500 to-rose-600 border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-6 sm:p-8 flex flex-col items-center justify-center text-white text-center group cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
             <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Volume2 className="h-12 w-12 text-white" />
             </div>
             <h3 className="text-2xl font-black">AI Audio Story</h3>
             <p className="mt-2 text-rose-100 font-bold italic">Click to listen to a random AI story!</p>
          </div>
        </div>
      )}
    </div>
  );
}
