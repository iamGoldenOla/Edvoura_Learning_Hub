'use client';

import { useState } from 'react';
import { Book, Sparkles, Wand2, ArrowRight, Volume2, Bookmark } from 'lucide-react';

const BOOKS = [
  { id: 1, title: "The Little Blue Robot", author: "Edvoura AI", cover: "🤖", color: "bg-blue-100", content: "Once upon a time, there was a little blue robot named Bip. Bip lived in a house made of shiny metal. One day, Bip found a small green plant. He watered it every day. The plant grew into a beautiful flower. Bip was very happy!" },
  { id: 2, title: "Sunny the Squirrel", author: "Edvoura AI", cover: "🐿️", color: "bg-orange-100", content: "Sunny the squirrel loved to collect nuts. He had a big pile of acorns in his oak tree. When winter came, Sunny stayed warm and full. He shared his nuts with his friend, Birdie. Sharing made Sunny feel warm inside." },
  { id: 3, title: "The Magic Garden", author: "Edvoura AI", cover: "🌳", color: "bg-green-100", content: "In the magic garden, the trees could talk! One tree told a story about a dragon who liked to eat clouds. The clouds tasted like marshmallows. The dragon was very fluffy and kind. Everyone in the garden was friends." },
];

export default function ReadPage() {
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateStory = () => {
    setIsGenerating(true);
    setGeneratedStory(null);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedStory("Once upon a time, in a land of candy mountains, there was a purple dinosaur named Pip. Pip loved to dance! One day, he found a golden flute. When he played it, all the trees started dancing with him. It was a magical day of music and joy.");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black text-dark flex items-center gap-3">
            <Book className="h-10 w-10 text-indigo-600" />
            Reading Corner
          </h1>
          <p className="mt-2 text-dark/60 font-semibold">Choose a book to read or ask the AI to write a story!</p>
        </div>
        
        <button 
          onClick={generateStory}
          disabled={isGenerating}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-[4px] border-dark bg-yellow text-dark font-black uppercase text-sm tracking-widest shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
        >
          <Wand2 className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'AI Writing...' : 'AI Story Generator'}
        </button>
      </header>

      {selectedBook || generatedStory ? (
        <div className="bg-white border-[4px] border-dark rounded-[40px] shadow-[12px_12px_0px_#060E1C] overflow-hidden">
          <div className="bg-indigo-600 p-6 flex items-center justify-between text-white border-b-[4px] border-dark">
            <div className="flex items-center gap-4">
               <span className="text-4xl">{selectedBook?.cover || '✨'}</span>
               <div>
                 <h2 className="text-2xl font-black">{selectedBook?.title || 'AI Magic Story'}</h2>
                 <p className="text-sm font-bold text-indigo-200">By {selectedBook?.author || 'Edvoura Reader AI'}</p>
               </div>
            </div>
            <button 
              onClick={() => { setSelectedBook(null); setGeneratedStory(null); window.speechSynthesis.cancel(); }}
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Close Book
            </button>
          </div>
          
          <div className="p-12 space-y-8">
            <div className="text-2xl leading-relaxed font-medium text-slate-800 font-serif">
              {selectedBook?.content || generatedStory}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => speak(selectedBook?.content || generatedStory || '')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                <Volume2 className="h-5 w-5" /> Listen to Story
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                <Bookmark className="h-5 w-5" /> Save Progress
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BOOKS.map((book) => (
            <div 
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="group cursor-pointer bg-white border-[4px] border-dark rounded-[32px] shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all overflow-hidden"
            >
              <div className={`${book.color} h-48 flex items-center justify-center text-[80px] group-hover:scale-110 transition-transform`}>
                {book.cover}
              </div>
              <div className="p-6 border-t-[4px] border-dark">
                <h3 className="text-xl font-black text-dark">{book.title}</h3>
                <p className="text-sm font-bold text-dark/40 italic">By {book.author}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                    Read Now <ArrowRight className="h-3 w-3" />
                  </span>
                  <Book className="h-5 w-5 text-dark/10" />
                </div>
              </div>
            </div>
          ))}

          {/* Special AI Box */}
          <div 
            onClick={generateStory}
            className="group cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 border-[4px] border-dark rounded-[32px] shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all p-8 flex flex-col items-center justify-center text-white text-center"
          >
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-black">AI Mystery Story</h3>
            <p className="mt-2 text-indigo-100 font-bold">Ask the AI to create a new story for you!</p>
          </div>
        </div>
      )}
    </div>
  );
}
