import React from 'react';
import type { BlogContent } from '../types/blog';
import SpeechPlayer from './SpeechPlayer';

interface BlogPostProps {
  post: BlogContent;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  // Function to safely render HTML content
  const renderHtmlContent = (html: string) => {
    return { __html: html };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        {post.title && (
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
        )}
        
        {/* Meta information */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-4">
              Published on {formatDate(post.created_at)}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Article #{post.id}
            </span>
          </div>
        </div>
      </header>

      {/* Speech Player */}
      <div className="mb-8">
        <SpeechPlayer content={post.description} />
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none
                   prose-headings:text-gray-900 prose-headings:font-semibold
                   prose-p:text-gray-700 prose-p:leading-relaxed
                   prose-strong:text-gray-900 prose-strong:font-semibold
                   prose-ul:text-gray-700 prose-ol:text-gray-700
                   prose-li:mb-2 prose-li:leading-relaxed
                   prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                   prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:my-6
                   prose-blockquote:italic prose-blockquote:text-gray-800
                   prose-table:border-collapse prose-table:border prose-table:border-gray-300
                   prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:font-semibold
                   prose-td:border prose-td:border-gray-300 prose-td:p-3
                   prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                   prose-hr:border-gray-300 prose-hr:my-8"
        dangerouslySetInnerHTML={renderHtmlContent(post.description)}
      />

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Blog ID: {post.blog}</span>
          <span>Author ID: {post.created_by}</span>
        </div>
      </footer>
    </article>
  );
};

export default BlogPost;