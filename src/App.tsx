import React, { useState, useEffect } from 'react';
import { fetchBlogContent } from './services/blogApi';
import BlogPost from './components/BlogPost';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import type { BlogContent } from './types/blog';

function App() {
  const [blogPosts, setBlogPosts] = useState<BlogContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog content from fake API
  const loadBlogContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const posts = await fetchBlogContent();
      setBlogPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogContent();
  }, []);

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadBlogContent}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Programming Languages for AI
          </h1>
          <p className="text-lg text-gray-600">
            A comprehensive guide to choosing the right programming language for your AI projects
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Blog Posts */}
        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to implement your AI project?
            </h3>
            <p className="text-gray-600 mb-4">
              Contact us for expert guidance on choosing the right technology stack for your AI initiatives.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                onClick={() => console.log('Contact clicked')}
              >
                Get Started
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200"
                onClick={() => console.log('Learn more clicked')}
              >
                Learn More
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Total articles: {blogPosts.length}</p>
            <p className="mt-2">
              This blog demonstrates a modular React application with fake API integration and content-to-speech capability.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
