'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function LifebookViewerPage() {
  const params = useParams();
  const residentId = params.residentId as string;

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['lifebook', residentId],
    queryFn: () => apiClient.getLifebook(residentId),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-serif">Creating your life story book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Book Not Available
          </h1>
          <p className="text-gray-600">
            This life story book is still being collected. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const { assembly, content } = book;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Cover Page */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="mb-8 text-8xl">📖</div>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {assembly.residentName}
          </h1>
          <p className="text-2xl md:text-3xl font-serif italic text-gray-600">
            A Life in Stories
          </p>
          <div className="mt-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        </div>
      </div>

      {/* Book Introduction */}
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 md:p-16 border border-amber-100">
          <div className="prose prose-lg md:prose-xl prose-amber mx-auto font-serif">
            {content.bookIntro.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-6 first:text-xl first:font-medium">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters */}
      {content.chapters.map((chapter: any, chapterIdx: number) => {
        const assemblyChapter = assembly.chapters[chapterIdx];

        return (
          <div key={chapterIdx} className="max-w-5xl mx-auto px-8 py-16">
            {/* Chapter Header */}
            <div className="text-center mb-16">
              <div className="inline-block">
                <div className="text-sm uppercase tracking-widest text-amber-600 font-semibold mb-3">
                  Chapter {chapter.chapterNumber}
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                  {assemblyChapter.title}
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-6" />
                <p className="text-lg md:text-xl font-serif italic text-gray-600 max-w-2xl mx-auto">
                  {chapter.intro}
                </p>
              </div>
            </div>

            {/* Stories */}
            <div className="space-y-12">
              {chapter.stories.map((story: any, storyIdx: number) => (
                <div
                  key={storyIdx}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-amber-100 hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Story Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-serif font-semibold text-gray-900 mb-2">
                      "{story.title}"
                    </h3>
                    <p className="text-sm md:text-base font-serif italic text-gray-500">
                      {story.recordingNote}
                    </p>
                  </div>

                  {/* Story Content */}
                  <div className="prose prose-lg md:prose-xl prose-gray mx-auto font-serif mb-8">
                    {story.editedTranscript.split('\n\n').map((paragraph: string, pIdx: number) => (
                      <p key={pIdx} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Pull Quote */}
                  <div className="relative pl-8 py-6 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50/50 to-transparent rounded-r-2xl">
                    <div className="absolute -left-3 top-4 text-6xl text-amber-300 leading-none">"</div>
                    <p className="text-xl md:text-2xl font-serif italic text-gray-800 leading-relaxed">
                      {story.primaryPullQuote}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Colophon */}
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-12" />
          <div className="prose prose-base md:prose-lg prose-gray mx-auto font-serif">
            {content.colophon.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="text-gray-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-12 text-4xl">✨</div>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-20" />
    </div>
  );
}
