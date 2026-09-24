'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Library, Star, X } from 'lucide-react';

interface Storybook {
  id: string;
  title: string;
  author: string;
  language: string;
  grade_band: string;
  cover_image_url: string;
  content_body: string;
}

interface Progress {
  storybook_id: string;
  status: string;
  pages_read: number;
  total_pages: number;
}

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<Storybook[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [gradeBand, setGradeBand] = useState<string>('1-3');
  const [language, setLanguage] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Storybook | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock student ID for now, ideally fetch from auth session
  const studentId = '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    fetchBooks();
    fetchProgress();
  }, [gradeBand, language]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/library/books?gradeBand=${gradeBand}&language=${language}`);
      const json = await res.json();
      if (json.data) {
        setBooks(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch books', err);
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/library/progress?studentId=${studentId}`);
      const json = await res.json();
      if (json.data) {
        const progMap: Record<string, Progress> = {};
        json.data.forEach((p: Progress) => {
          progMap[p.storybook_id] = p;
        });
        setProgress(progMap);
      }
    } catch (err) {
      console.error('Failed to fetch progress', err);
    }
  };

  const updateProgress = async (bookId: string, status: string) => {
    try {
      await fetch('/api/library/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          storybookId: bookId,
          pagesRead: 1,
          totalPages: 1,
          status,
        }),
      });
      fetchProgress();
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const openReader = (book: Storybook) => {
    setSelectedBook(book);
    updateProgress(book.id, 'started');
  };

  const closeReader = () => {
    if (selectedBook) {
      updateProgress(selectedBook.id, 'completed');
    }
    setSelectedBook(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary p-3 rounded-xl border-4 border-dark shadow-[4px_4px_0px_#060E1C]">
          <Library size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-dark">Storybook Library</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between bg-white rounded-[24px] border-[4px] border-dark p-4 shadow-[8px_8px_0px_#060E1C]">
        <div className="flex gap-2 bg-gray-100 p-2 rounded-xl border-2 border-dark">
          {[
            { id: '1-3', label: 'Explorer (1-3)' },
            { id: '4-6', label: 'Builder (4-6)' },
            { id: '7-12', label: 'Achiever (7-12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGradeBand(tab.id)}
              className={`px-4 py-2 font-bold rounded-lg border-2 transition-all ${
                gradeBand === tab.id
                  ? 'bg-secondary text-dark border-dark shadow-[2px_2px_0px_#060E1C]'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-dark">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 font-bold rounded-xl border-4 border-dark shadow-[4px_4px_0px_#060E1C] bg-white cursor-pointer outline-none"
          >
            <option value="all">All Languages</option>
            <option value="English">English</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Swahili">Swahili</option>
            <option value="Hausa">Hausa</option>
            <option value="French">French</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 font-bold text-xl text-dark">Loading magical stories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => openReader(book)}
              className="bg-white rounded-[24px] border-[4px] border-dark p-4 shadow-[8px_8px_0px_#060E1C] cursor-pointer hover:-translate-y-1 hover:shadow-[10px_10px_0px_#060E1C] transition-all flex flex-col h-full"
            >
              <div className="aspect-[3/4] bg-gray-200 rounded-xl border-4 border-dark mb-4 overflow-hidden flex items-center justify-center relative">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={48} className="text-gray-400" />
                )}
                {progress[book.id]?.status === 'completed' && (
                  <div className="absolute top-2 right-2 bg-success text-white p-1 rounded-full border-2 border-dark shadow-[2px_2px_0px_#060E1C]">
                    <Star size={20} />
                  </div>
                )}
              </div>
              
              <div className="flex-grow flex flex-col">
                <h3 className="text-xl font-black text-dark mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-sm font-bold text-gray-500 mb-2">by {book.author}</p>
                
                <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t-2 border-gray-100">
                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded border-2 border-blue-200">
                    {book.language}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded border-2 border-yellow-200">
                    {book.grade_band}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {books.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-[24px] border-[4px] border-dark shadow-[8px_8px_0px_#060E1C]">
              <p className="text-xl font-bold text-gray-500">No stories found for this selection. Try changing your filters!</p>
            </div>
          )}
        </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border-[4px] border-dark w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[16px_16px_0px_#060E1C]">
            <div className="flex items-center justify-between p-4 border-b-4 border-dark bg-yellow-100 rounded-t-[20px]">
              <h2 className="text-2xl font-black text-dark">{selectedBook.title}</h2>
              <button 
                onClick={closeReader}
                className="p-2 bg-red-400 hover:bg-red-500 text-dark rounded-xl border-4 border-dark shadow-[4px_4px_0px_#060E1C] transition-all active:translate-y-1 active:shadow-none"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-grow prose prose-lg max-w-none text-dark font-medium">
              {/* Very simple reader, rendering the text content with some formatting */}
              {selectedBook.content_body.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-lg leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <div className="p-4 border-t-4 border-dark bg-gray-50 rounded-b-[20px] flex justify-between items-center">
              <span className="font-bold text-gray-500">Author: {selectedBook.author}</span>
              <button 
                onClick={closeReader}
                className="px-6 py-2 bg-success text-white font-black rounded-xl border-4 border-dark shadow-[4px_4px_0px_#060E1C] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] transition-all"
              >
                Finish Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
