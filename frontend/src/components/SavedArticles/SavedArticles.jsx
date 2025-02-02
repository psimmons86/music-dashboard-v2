// src/components/SavedArticles/SavedArticles.jsx
import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import * as articleService from '../../services/articleService';

export default function SavedArticles() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchArticles() {
      try {
        const savedArticles = await articleService.getSavedArticles();
        setArticles(savedArticles);
      } catch (err) {
        setError('Failed to load saved articles');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const handleDelete = async (articleId) => {
    try {
      await articleService.deleteSavedArticle(articleId);
      setArticles(prev => prev.filter(article => article._id !== articleId));
    } catch (err) {
      setError('Failed to delete article');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 text-center bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 text-center">
        No saved articles yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article._id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          {article.urlToImage && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-gray-800">{article.title}</h3>
            <button
              onClick={() => handleDelete(article._id)}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {article.description && (
            <p className="text-sm text-gray-600">
              {article.description}
            </p>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Read Article
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}