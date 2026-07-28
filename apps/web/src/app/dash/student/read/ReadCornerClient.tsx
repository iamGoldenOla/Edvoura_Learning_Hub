'use client';

import { useState } from 'react';
import { Book, Sparkles, Wand2, ArrowRight, Volume2, Bookmark, ArrowLeft } from 'lucide-react';

const BOOKS = [
  { id: 1, title: "The Little Blue Robot", author: "Edvoura AI", cover: "🤖", color: "bg-blue-100", content: "Once upon a time, there was a little blue robot named Bip. Bip lived in a house made of shiny metal. One day, Bip found a small green plant. He watered it every day. The plant grew into a beautiful flower. Bip was very happy!" },
  { id: 2, title: "Sunny the Squirrel", author: "Edvoura AI", cover: "🐿️", color: "bg-orange-100", content: "Sunny the squirrel loved to collect nuts. He had a big pile of acorns in his oak tree. When winter came, Sunny stayed warm and full. He shared his nuts with his friend, Birdie. Sharing made Sunny feel warm inside." },
  { id: 3, title: "The Magic Garden", author: "Edvoura AI", cover: "🌳", color: "bg-green-100", content: "In the magic garden, the trees could talk! One tree told a story about a dragon who liked to eat clouds. The clouds tasted like marshmallows. The dragon was very fluffy and kind. Everyone in the garden was friends." },
];

const THEMES = [
  { id: 'space', name: 'Space Adventure', icon: '🚀', prompt: 'A story about a space adventure' },
  { id: 'safari', name: 'Wild Safari', icon: '🦁', prompt: 'A story about a friendly animal safari' },
  { id: 'undersea', name: 'Undersea Mystery', icon: '🌊', prompt: 'A story about exploring the deep ocean' },
  { id: 'magic', name: 'Magic Forest', icon: '🧙‍♂️', prompt: 'A story about a magical, talking forest' },
  { id: 'robot', name: 'Robot Friend', icon: '🤖', prompt: 'A story about a friendly robot learning something new' },
];

export default function ReadCornerClient({ gradeLevel }: { gradeLevel: string }) {
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{ title: string; content: string; moralLesson?: string } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('space');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedStory(null);
    setSelectedBook(null);

    const themeObj = THEMES.find((t) => t.id === selectedTheme);
    const themePrompt = themeObj ? themeObj.prompt : 'A friendly story';

    try {
      const response = await fetch('/api/ai/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: themePrompt,
          gradeLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story from AI server.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setGeneratedStory({
          title: resData.data.title || `${themeObj?.name || 'AI Story'}`,
          content: resData.data.content || '',
          moralLesson: resData.data.moralLesson,
        });
      } else {
        throw new Error(resData.error || 'Invalid story format returned.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during story generation.');
    } finally {
      setIsGenerating(false);
    }
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
      </header>

      {selectedBook || generatedStory ? (
        <div className="bg-white border-[4px] border-dark rounded-[40px] shadow-[12px_12px_0px_#060E1C] overflow-hidden">
          <div className="bg-indigo-600 p-6 flex items-center justify-between text-white border-b-[4px] border-dark">
            <div className="flex items-center gap-4">
              <span className="text-4xl">
                {selectedBook?.cover || THEMES.find((t) => t.id === selectedTheme)?.icon || '✨'}
              </span>
              <div>
                <h2 className="text-2xl font-black">{selectedBook?.title || generatedStory?.title}</h2>
                <p className="text-sm font-bold text-indigo-200">
                  By {selectedBook?.author || 'Edvoura Reader AI'} ({gradeLevel})
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedBook(null);
                setGeneratedStory(null);
                window.speechSynthesis.cancel();
              }}
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors border-[2px] border-dark shadow-[2px_2px_0px_#000]"
            >
              Close Book
            </button>
          </div>

          <div className="p-12 space-y-8">
            <div className="text-2xl leading-relaxed font-medium text-slate-800 font-serif whitespace-pre-wrap">
              {selectedBook?.content || generatedStory?.content}
            </div>

            {generatedStory?.moralLesson && (
              <div className="bg-emerald-50 border-[3px] border-emerald-500 rounded-2xl p-6">
                <p className="text-xs uppercase font-black tracking-widest text-emerald-800">Moral of the Story</p>
                <p className="mt-2 text-lg font-bold text-emerald-950">{generatedStory.moralLesson}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => speak(selectedBook?.content || generatedStory?.content || '')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-[4px_4px_0px_#000] border-[2px] border-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Volume2 className="h-5 w-5" /> Listen to Story
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-[2px] border-dark bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-[4px_4px_0px_#000]">
                <Bookmark className="h-5 w-5" /> Save Progress
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Books List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </div>

          {/* AI Generator controls */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 border-[4px] border-dark rounded-[32px] shadow-[8px_8px_0px_#060E1C] p-8 text-white flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow animate-pulse" />
              <h3 className="text-2xl font-black">AI Storyteller</h3>
            </div>
            <p className="text-sm font-bold text-indigo-100">
              Select a theme, and Edvoura AI will write a custom, educational story matching your grade level!
            </p>

            <div className="space-y-3">
              <p className="text-xs uppercase font-black tracking-widest text-indigo-200">Select Theme</p>
              <div className="grid grid-cols-1 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-[3px] font-black text-left text-sm transition-all ${
                      selectedTheme === theme.id
                        ? 'bg-yellow border-dark text-dark shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white/10 border-transparent text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-lg">{theme.icon}</span>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-200 bg-red-900/40 p-3 rounded-xl border border-red-500 font-semibold">
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-[4px] border-dark bg-yellow text-dark font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
            >
              <Wand2 className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'AI Writing...' : 'Generate AI Story'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
