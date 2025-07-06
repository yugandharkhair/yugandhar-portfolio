"use client";

import { Content, asImageSrc, isFilled } from "@prismicio/client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PrismicNextImage } from "@prismicio/next";

gsap.registerPlugin(ScrollTrigger);

type ContentListProps = {
  items: Content.BlogPostDocument[] | Content.ProjectDocument[];
  contentType: Content.ContentIndexSlice["primary"]["content_type"];
  fallbackItemImage: Content.ContentIndexSlice["primary"]["fallback_item_image"];
  viewMoreText: Content.ContentIndexSlice["primary"]["view_more_text"];
};

export default function ContentList({
  items,
  contentType,
  fallbackItemImage,
  viewMoreText = "Read More",
}: ContentListProps) {
  const component = useRef(null);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [filteredItems, setFilteredItems] = useState<(Content.BlogPostDocument | Content.ProjectDocument)[]>(items);

  const urlPrefix = contentType === "Blog" ? "/blog" : "/projects";
  
  // Define filter categories for "My Work" section
  const filterCategories = ["All", "Hackathon Wins", "Mobile Dev", "Web Dev", "Other"];

  // Filter items based on selected category
  useEffect(() => {
    if (contentType === "My Work" && selectedFilter !== "All") {
      const filtered = items.filter((item) => {
        // Type guard to check if item is a ProjectDocument
        const isProjectDocument = (doc: Content.BlogPostDocument | Content.ProjectDocument): doc is Content.ProjectDocument => {
          return 'category' in doc.data;
        };
        
        // Check if item has category field (for Project documents)
        if (isProjectDocument(item) && item.data.category) {
          return item.data.category === selectedFilter;
        }
        // Fallback to tags if no category field
        return item.tags.some(tag => 
          tag.toLowerCase().includes(selectedFilter.toLowerCase().replace(" ", ""))
        );
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems([...items]);
    }
  }, [selectedFilter, items, contentType]);

  useEffect(() => {
    // Reset filter when content type changes
    setSelectedFilter("All");
  }, [contentType]);

  useEffect(() => {
    // Animate grid items in with a stagger
    let ctx = gsap.context(() => {
      itemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1.3,
              ease: "elastic.out(1,0.3)",
              delay: index * 0.1,
            },
          );
        }
      });
    }, component);
    return () => ctx.revert();
  }, [filteredItems]);

  // Preload images
  useEffect(() => {
    filteredItems.forEach((item) => {
      const image = isFilled.image(item.data.hover_image)
        ? item.data.hover_image
        : fallbackItemImage;
      
      if (isFilled.image(image)) {
        const img = new Image();
        img.src = asImageSrc(image, {
          fit: "crop",
          w: 400,
          h: 300,
        }) || "";
      }
    });
  }, [filteredItems, fallbackItemImage]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    // Animate out current items
    gsap.to(itemsRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        // Items will animate back in due to the useEffect dependency on filteredItems
      }
    });
  };

  return (
    <div ref={component}>
      {/* Filter buttons for My Work section */}
      {(contentType === "My Work" || contentType === "Project") && (
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {filterCategories.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedFilter === filter
                  ? "bg-yellow-400 text-slate-900 shadow-lg transform scale-105"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {(contentType === "My Work" || contentType === "Project") && (
        <div className="mb-6 text-center">
          <p className="text-slate-400 text-sm">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'project' : 'projects'}
            {selectedFilter !== "All" && ` in "${selectedFilter}"`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <React.Fragment key={`${item.uid}-${selectedFilter}`}>
            {isFilled.keyText(item.data.title) && (
              <div
                className="project-card opacity-0 flex flex-col bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:shadow-lg hover:border-yellow-400 transition-all duration-300"
                ref={(el) => (itemsRef.current[index] = el)}
              >
                <Link href={urlPrefix + "/" + item.uid} aria-label={item.data.title} className="flex flex-col h-full">
                  <div className="project-image relative aspect-video overflow-hidden">
                    <PrismicNextImage
                      field={isFilled.image(item.data.hover_image) ? item.data.hover_image : fallbackItemImage}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      imgixParams={{ fit: "crop", w: 600, h: 340, exp: -1 }}
                    />
                    {/* Category badge */}
                    {(() => {
                      // Type guard to check if item is a ProjectDocument
                      const isProjectDocument = (doc: Content.BlogPostDocument | Content.ProjectDocument): doc is Content.ProjectDocument => {
                        return 'category' in doc.data;
                      };
                      
                      if (isProjectDocument(item) && item.data.category) {
                        return (
                          <div className="absolute top-3 left-3">
                            <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                              {item.data.category}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-200 mb-3 line-clamp-2">{item.data.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-sm font-medium text-yellow-400 bg-slate-700 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-sm font-medium text-slate-400 bg-slate-700 px-2 py-1 rounded-md">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-auto pt-3 text-slate-300 text-sm font-medium group-hover:text-yellow-400 transition-colors">
                      <span>{viewMoreText}</span>
                      <MdArrowOutward className="ml-1 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No projects found</div>
          <p className="text-slate-500 text-sm">
            Try selecting a different category or check back later for new projects.
          </p>
        </div>
      )}
    </div>
  );
}