import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { Blog } from '../types';
import { formatDistanceToNow } from 'date-fns';

export const BlogCard = ({ blog }: { blog: Blog }) => {
  return (
    <Link to={`/blog/${blog.slug}`} className="group block h-full">
      <article className="h-full flex flex-col glass-panel rounded-2xl overflow-hidden hover:neon-glow transition-all duration-300 transform hover:-translate-y-1">
        {blog.featuredImage ? (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={blog.featuredImage} 
              alt={blog.title} 
              className="w-full h-full object-cover origin-center transform group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-full h-12 bg-gradient-to-r from-accent/10 to-accent/5 hidden" />
        )}
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded text-[10px] font-bold uppercase tracking-wider">
              {blog.category}
            </span>
          </div>
          
          <h2 className="text-xl font-bold mb-4 text-white leading-tight group-hover:text-accent transition-colors line-clamp-2">
            {blog.title}
          </h2>
          
          <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-1">
            {/* Very naive stripping of markdown for preview */}
            {blog.content.replace(/#+\s/g, '').replace(/\[.*?\]\(.*?\)/g, '').substring(0, 150)}...
          </p>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 text-xs text-text-secondary">
            <div className="flex items-center gap-4">
              <span>{blog.createdAt.seconds ? formatDistanceToNow(new Date(blog.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime} min</span>
            </div>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};
